using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SisConf.Application.Common.Storage;
using SisConf.Application.Importacao;
using SisConf.Domain.Conferencia;
using SisConf.Domain.Importacao;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Importacao;

/// <summary>
/// Consome arquivos enfileirados, resolve o parser pelo Layout.parser_key,
/// emite pedidos em batches de 200, grava erros por linha, atualiza progresso via SignalR.
/// </summary>
public class ImportacaoProcessor : BackgroundService
{
    private const int TamanhoBatch = 200;
    private const int IntervaloProgressoLinhas = 50;

    private readonly IImportacaoQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ImportacaoProcessor> _log;

    public ImportacaoProcessor(IImportacaoQueue queue, IServiceScopeFactory scopeFactory,
        ILogger<ImportacaoProcessor> log)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("ImportacaoProcessor iniciado.");
        await foreach (var cmd in _queue.ConsumirAsync(stoppingToken))
        {
            try { await ProcessarAsync(cmd, stoppingToken); }
            catch (Exception ex)
            {
                _log.LogError(ex, "Erro processando importação {Id}", cmd.ArquivoImportacaoId);
                await FinalizarComErroAsync(cmd, ex.Message, stoppingToken);
            }
        }
    }

    private async Task ProcessarAsync(ImportacaoCommand cmd, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
        var storage = scope.ServiceProvider.GetRequiredService<IFileStorage>();
        var registry = scope.ServiceProvider.GetRequiredService<IPedidoImportParserRegistry>();
        var publisher = scope.ServiceProvider.GetRequiredService<IImportacaoPublisher>();

        var arq = await db.ArquivoImportacoes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Id == cmd.ArquivoImportacaoId, ct);
        if (arq is null) { _log.LogWarning("Arquivo {Id} não encontrado.", cmd.ArquivoImportacaoId); return; }
        if (arq.Status == ImportacaoStatus.Cancelado) return;

        var layout = await db.Layouts.IgnoreQueryFilters().FirstOrDefaultAsync(l => l.Id == arq.LayoutId, ct);
        if (layout is null) { await FinalizarComErroAsync(cmd, "Layout não encontrado.", ct); return; }

        var parser = registry.Resolver(layout.ParserKey);
        if (parser is null)
        {
            await FinalizarComErroAsync(cmd, $"Parser '{layout.ParserKey}' ainda não implementado.", ct);
            return;
        }

        var statusInicial = await db.Statuses.IgnoreQueryFilters()
            .Where(s => s.TenantId == cmd.TenantId && s.EhInicial)
            .FirstOrDefaultAsync(ct);
        if (statusInicial is null)
        {
            await FinalizarComErroAsync(cmd, "Nenhum status inicial configurado para o tenant.", ct);
            return;
        }

        arq.IniciarProcessamento();
        await db.SaveChangesAsync(ct);

        await using var stream = await storage.AbrirAsync(arq.StorageKey, ct);

        int linhasOk = 0, linhasErro = 0, processadasDesdeUltimoEnvio = 0;
        var batchPedidos = new List<Pedido>(TamanhoBatch);
        var batchErros = new List<ArquivoImportacaoErro>(TamanhoBatch);

        await foreach (var item in parser.ParseAsync(stream, arq.NomeArquivo, ct))
        {
            ct.ThrowIfCancellationRequested();

            switch (item)
            {
                case PedidoImportado p:
                    batchPedidos.Add(Pedido.Criar(
                        cmd.TenantId, layout.Id, statusInicial.Id, p.Etiqueta,
                        boxId: null, arquivoImportacaoId: arq.Id, grupoId: null,
                        p.OrdemCompra, p.Cliente, p.PeCliente, p.Produto,
                        p.Descricao, p.Qtde, p.Volume, p.Sequencia));
                    linhasOk++;
                    break;
                case ErroLinhaImportacao e:
                    batchErros.Add(ArquivoImportacaoErro.Criar(
                        cmd.TenantId, arq.Id, e.NumeroLinha, e.Conteudo, e.Mensagem));
                    linhasErro++;
                    break;
            }

            if (batchPedidos.Count >= TamanhoBatch) await FlushAsync(db, batchPedidos, batchErros, ct);
            if (batchErros.Count >= TamanhoBatch) await FlushAsync(db, batchPedidos, batchErros, ct);

            processadasDesdeUltimoEnvio++;
            if (processadasDesdeUltimoEnvio >= IntervaloProgressoLinhas)
            {
                arq.RegistrarProgresso(linhasOk, linhasErro);
                await db.SaveChangesAsync(ct);
                await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ImportacaoProgresso(
                    arq.Id, arq.Status.ToString().ToLowerInvariant(), linhasOk, linhasErro, null), ct);
                processadasDesdeUltimoEnvio = 0;
            }
        }

        await FlushAsync(db, batchPedidos, batchErros, ct);

        arq.Concluir(linhasOk + linhasErro, linhasOk, linhasErro);
        await db.SaveChangesAsync(ct);

        await publisher.EnviarParaUsuarioAsync(cmd.UsuarioId, new ImportacaoProgresso(
            arq.Id, arq.Status.ToString().ToLowerInvariant(), linhasOk, linhasErro, linhasOk + linhasErro), ct);

        _log.LogInformation("Importação {Id} concluída: {Ok} OK, {Erro} erros.", arq.Id, linhasOk, linhasErro);
    }

    private static async Task FlushAsync(SisConfDbContext db, List<Pedido> pedidos, List<ArquivoImportacaoErro> erros, CancellationToken ct)
    {
        if (pedidos.Count == 0 && erros.Count == 0) return;
        if (pedidos.Count > 0) { db.Pedidos.AddRange(pedidos); pedidos.Clear(); }
        if (erros.Count > 0) { db.ArquivoImportacaoErros.AddRange(erros); erros.Clear(); }
        await db.SaveChangesAsync(ct);
    }

    private async Task FinalizarComErroAsync(ImportacaoCommand cmd, string mensagem, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
            var pub = scope.ServiceProvider.GetRequiredService<IImportacaoPublisher>();

            var arq = await db.ArquivoImportacoes.IgnoreQueryFilters()
                .FirstOrDefaultAsync(a => a.Id == cmd.ArquivoImportacaoId, ct);
            if (arq is null) return;
            arq.Falhar(mensagem);
            await db.SaveChangesAsync(ct);

            await pub.EnviarParaUsuarioAsync(cmd.UsuarioId, new ImportacaoProgresso(
                arq.Id, "erro", arq.LinhasOk, arq.LinhasErro, arq.TotalLinhas, mensagem), ct);
        }
        catch { /* swallow */ }
    }
}
