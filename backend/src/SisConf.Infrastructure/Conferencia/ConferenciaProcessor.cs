using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SisConf.Application.Conferencia;
using SisConf.Domain.Conferencia;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Conferencia;

/// <summary>
/// BackgroundService que consome a fila in-process e processa cada conferência.
/// Roda no mesmo processo da API. Cada item tem seu próprio scope (DbContext novo).
/// </summary>
public class ConferenciaProcessor : BackgroundService
{
    private readonly IConferenciaQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ConferenciaProcessor> _log;

    public ConferenciaProcessor(IConferenciaQueue queue, IServiceScopeFactory scopeFactory,
        ILogger<ConferenciaProcessor> log)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("ConferenciaProcessor iniciado.");

        await foreach (var cmd in _queue.ConsumirAsync(stoppingToken))
        {
            try
            {
                await ProcessarAsync(cmd, stoppingToken);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Falha ao processar conferência {ClientEventId}", cmd.ClientEventId);
                await TentarPublicarErroAsync(cmd, "Erro interno ao processar.", stoppingToken);
            }
        }
    }

    private async Task ProcessarAsync(ConferenciaCommand cmd, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
        var publisher = scope.ServiceProvider.GetRequiredService<IConferenciaPublisher>();

        // Bypass do filtro global: o command já carrega TenantId; aplicamos manualmente.
        // (TenantContext do scope é vazio porque processor não tem HttpContext.)

        // 1) Idempotência — mesmo client_event_id?
        var jaExiste = await db.PedidoEventos.IgnoreQueryFilters()
            .Where(e => e.ClientEventId == cmd.ClientEventId)
            .Select(e => new { e.PedidoId, e.StatusNovoId })
            .FirstOrDefaultAsync(ct);

        if (jaExiste is not null)
        {
            // Replay seguro — retorna o resultado anterior
            var dados = await CarregarDadosResultado(db, cmd.TenantId, jaExiste.PedidoId, jaExiste.StatusNovoId, ct);
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.JaConferido,
                "Já conferido", jaExiste.PedidoId, dados.Etiqueta,
                jaExiste.StatusNovoId, dados.StatusNome, dados.StatusCor,
                dados.BoxId, dados.BoxCodigo, dados.Cliente, dados.Descricao, null), ct);
            return;
        }

        // 2) Localiza o pedido pela etiqueta
        var pedido = await db.Pedidos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.TenantId == cmd.TenantId && p.Etiqueta == cmd.Etiqueta, ct);

        if (pedido is null)
        {
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.EtiquetaNaoEncontrada,
                "Etiqueta não encontrada", null, cmd.Etiqueta, null, null, null, null, null, null, null,
                $"Etiqueta '{cmd.Etiqueta}' não encontrada."), ct);
            return;
        }

        // 3) Lock distribuído — outro operador segura?
        var agora = DateTime.UtcNow;
        if (pedido.EstaBloqueado(agora) && !pedido.LockPertenceA(cmd.ConnectionId ?? string.Empty))
        {
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.PedidoBloqueado,
                "Peça bloqueada por outro operador", pedido.Id, pedido.Etiqueta,
                pedido.StatusId, null, null, pedido.BoxId, null, pedido.Cliente, pedido.Descricao,
                "Pedido bloqueado em outra sessão."), ct);
            return;
        }

        // 4) Carrega status atual e destino do tenant
        var statusEnvolvidos = await db.Statuses.IgnoreQueryFilters()
            .Where(s => s.TenantId == cmd.TenantId &&
                       (s.Id == pedido.StatusId || s.Id == cmd.StatusDestinoId))
            .ToListAsync(ct);

        var statusAtual = statusEnvolvidos.FirstOrDefault(s => s.Id == pedido.StatusId);
        var statusDestino = statusEnvolvidos.FirstOrDefault(s => s.Id == cmd.StatusDestinoId);

        if (statusDestino is null)
        {
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.StatusInvalido,
                "Status de destino inválido", pedido.Id, pedido.Etiqueta,
                pedido.StatusId, null, null, pedido.BoxId, null, pedido.Cliente, pedido.Descricao,
                "O status destino informado não pertence ao tenant."), ct);
            return;
        }

        // 5) Regras de transição:
        //    - status atual não pode ser de bloqueio (pedido finalizado)
        //    - ordem destino > ordem atual (avança no fluxo)
        if (statusAtual?.EhBloqueio == true)
        {
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.StatusInvalido,
                "Pedido finalizado", pedido.Id, pedido.Etiqueta,
                pedido.StatusId, statusAtual.Nome, statusAtual.CorHex,
                pedido.BoxId, null, pedido.Cliente, pedido.Descricao,
                $"Pedido está em status '{statusAtual.Nome}' e não pode ser alterado."), ct);
            return;
        }

        if (statusAtual is not null && statusDestino.Ordem <= statusAtual.Ordem)
        {
            // Mesmo status = já lida; status anterior = transição inválida
            var tipo = statusDestino.Id == statusAtual.Id
                ? ConferenciaResultadoTipo.JaConferido
                : ConferenciaResultadoTipo.StatusInvalido;
            var ttsResposta = statusDestino.Id == statusAtual.Id ? "Já conferido" : "Status inválido";
            await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, tipo, ttsResposta, pedido.Id, pedido.Etiqueta,
                pedido.StatusId, statusAtual.Nome, statusAtual.CorHex,
                pedido.BoxId, null, pedido.Cliente, pedido.Descricao,
                $"Pedido já está em '{statusAtual.Nome}'."), ct);
            return;
        }

        // 6) Tudo OK — grava transição
        var statusAnteriorId = pedido.StatusId;

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            pedido.AlterarStatus(statusDestino.Id);
            var evento = PedidoEvento.Criar(cmd.TenantId, pedido.Id,
                statusAnteriorId, statusDestino.Id,
                cmd.UsuarioId, cmd.ClientEventId, OrigemEvento.Web);
            db.PedidoEventos.Add(evento);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("client_event_id") == true)
        {
            // Outro thread já inseriu o mesmo client_event_id (race) — idempotente
            await tx.RollbackAsync(ct);
            // Apenas avisa OK; a transição já foi feita pelo outro thread.
        }

        // 7) Busca box pra TTS
        var box = pedido.BoxId.HasValue
            ? await db.Boxes.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.Id == pedido.BoxId.Value, ct)
            : null;

        var tts = MontarTts(statusDestino, box);

        await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
            cmd.ClientEventId, ConferenciaResultadoTipo.Ok, tts,
            pedido.Id, pedido.Etiqueta,
            statusDestino.Id, statusDestino.Nome, statusDestino.CorHex,
            pedido.BoxId, box?.Codigo, pedido.Cliente, pedido.Descricao, null), ct);
    }

    private static string MontarTts(SisConf.Domain.Cadastros.Status status, SisConf.Domain.Cadastros.Box? box)
    {
        // Prioridade: TTS do status > "Box {codigo}, {nomeStatus}" > nome do status
        if (!string.IsNullOrWhiteSpace(status.TtsTexto))
            return box is not null ? $"{box.TtsTexto ?? $"Box {box.Codigo}"}, {status.TtsTexto}" : status.TtsTexto;

        if (box is not null)
            return $"{box.TtsTexto ?? $"Box {box.Codigo}"}, {status.Nome}";

        return status.Nome;
    }

    private static async Task<(string? Etiqueta, string? StatusNome, string? StatusCor, Guid? BoxId, string? BoxCodigo, string? Cliente, string? Descricao)>
        CarregarDadosResultado(SisConfDbContext db, Guid tenantId, Guid pedidoId, Guid statusId, CancellationToken ct)
    {
        var p = await db.Pedidos.IgnoreQueryFilters()
            .Where(x => x.Id == pedidoId).Select(x => new { x.Etiqueta, x.BoxId, x.Cliente, x.Descricao })
            .FirstOrDefaultAsync(ct);
        var s = await db.Statuses.IgnoreQueryFilters()
            .Where(x => x.Id == statusId).Select(x => new { x.Nome, x.CorHex })
            .FirstOrDefaultAsync(ct);
        var b = p?.BoxId.HasValue == true
            ? await db.Boxes.IgnoreQueryFilters().Where(x => x.Id == p.BoxId).Select(x => x.Codigo).FirstOrDefaultAsync(ct)
            : null;
        return (p?.Etiqueta, s?.Nome, s?.CorHex, p?.BoxId, b, p?.Cliente, p?.Descricao);
    }

    private async Task TentarPublicarErroAsync(ConferenciaCommand cmd, string msg, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var pub = scope.ServiceProvider.GetRequiredService<IConferenciaPublisher>();
            await pub.EnviarParaUsuarioAsync(cmd.UsuarioId, new ConferenciaResultado(
                cmd.ClientEventId, ConferenciaResultadoTipo.Erro, "Erro interno",
                null, cmd.Etiqueta, null, null, null, null, null, null, null, msg), ct);
        }
        catch { /* não propaga */ }
    }
}
