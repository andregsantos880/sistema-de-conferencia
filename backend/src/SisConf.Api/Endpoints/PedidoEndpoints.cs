using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Conferencia;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record PedidoListaItemDto(
    Guid Id, string Etiqueta, string? OrdemCompra, string? Cliente, string? PeCliente,
    string? Produto, string? Descricao, int? Qtde, string? Volume,
    Guid StatusId, string StatusNome, string StatusCor,
    Guid? BoxId, string? BoxCodigo, Guid? GrupoId, string? GrupoNome,
    bool Bloqueado, DateTime AtualizadoEm);

public record PedidosPagina(int Total, int Pagina, int Tamanho, IReadOnlyList<PedidoListaItemDto> Itens);

public record CriarPedidoManualReq(
    string Etiqueta, Guid LayoutId, Guid? StatusInicialId, Guid? BoxId, Guid? GrupoId,
    string? OrdemCompra, string? Cliente, string? PeCliente, string? Produto,
    string? Descricao, int? Qtde, string? Volume, long? Sequencia);

public record LoteAlterarBoxReq(List<Guid> PedidoIds, Guid? BoxId);
public record LoteAlterarGrupoReq(List<Guid> PedidoIds, Guid? GrupoId);
public record LoteAlterarStatusReq(List<Guid> PedidoIds, Guid StatusId);

public static class PedidoEndpoints
{
    public static IEndpointRouteBuilder MapPedidoEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/pedidos").WithTags("Pedidos").RequireAuthorization();

        grupo.MapGet("/", [HasPermission(Permissoes.Pedidos.Visualizar)]
            async (SisConfDbContext db,
                Guid? statusId, Guid? boxId, Guid? grupoId, string? etiqueta,
                string? cliente, string? peCliente, string? ordemCompra,
                int pagina = 1, int tamanho = 50,
                CancellationToken ct = default) =>
        {
            tamanho = Math.Clamp(tamanho, 1, 500);
            pagina = Math.Max(pagina, 1);

            var q = db.Pedidos.AsQueryable();

            if (statusId.HasValue) q = q.Where(p => p.StatusId == statusId.Value);
            if (boxId.HasValue) q = q.Where(p => p.BoxId == boxId.Value);
            if (grupoId.HasValue) q = q.Where(p => p.GrupoId == grupoId.Value);
            if (!string.IsNullOrWhiteSpace(etiqueta)) q = q.Where(p => p.Etiqueta.Contains(etiqueta));
            if (!string.IsNullOrWhiteSpace(cliente)) q = q.Where(p => p.Cliente != null && p.Cliente.Contains(cliente));
            if (!string.IsNullOrWhiteSpace(peCliente)) q = q.Where(p => p.PeCliente != null && p.PeCliente.Contains(peCliente));
            if (!string.IsNullOrWhiteSpace(ordemCompra)) q = q.Where(p => p.OrdemCompra != null && p.OrdemCompra.Contains(ordemCompra));

            var total = await q.CountAsync(ct);

            var agora = DateTime.UtcNow;
            var itens = await q
                .OrderByDescending(p => p.AtualizadoEm)
                .Skip((pagina - 1) * tamanho)
                .Take(tamanho)
                .Select(p => new PedidoListaItemDto(
                    p.Id, p.Etiqueta, p.OrdemCompra, p.Cliente, p.PeCliente,
                    p.Produto, p.Descricao, p.Qtde, p.Volume,
                    p.StatusId,
                    db.Statuses.Where(s => s.Id == p.StatusId).Select(s => s.Nome).First(),
                    db.Statuses.Where(s => s.Id == p.StatusId).Select(s => s.CorHex).First(),
                    p.BoxId,
                    p.BoxId == null ? null : db.Boxes.Where(b => b.Id == p.BoxId).Select(b => b.Codigo).FirstOrDefault(),
                    p.GrupoId,
                    p.GrupoId == null ? null : db.Grupos.Where(g => g.Id == p.GrupoId).Select(g => g.Nome).FirstOrDefault(),
                    p.LockExpiresAt != null && p.LockExpiresAt > agora,
                    p.AtualizadoEm))
                .ToListAsync(ct);

            return Results.Ok(new PedidosPagina(total, pagina, tamanho, itens));
        }).WithName("ListarPedidos");

        grupo.MapPost("/", [HasPermission(Permissoes.Pedidos.CriarManual)]
            async (CriarPedidoManualReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Etiqueta))
                return Results.BadRequest(new { erro = "Etiqueta é obrigatória.", codigo = "etiqueta_ausente" });

            var statusInicial = req.StatusInicialId is { } sid
                ? await db.Statuses.FirstOrDefaultAsync(s => s.Id == sid, ct)
                : await db.Statuses.FirstOrDefaultAsync(s => s.EhInicial, ct);

            if (statusInicial is null)
                return Results.BadRequest(new { erro = "Nenhum status inicial encontrado.", codigo = "status_inicial_ausente" });

            // Layout deve estar ativado para o tenant
            var layoutOk = await db.TenantLayoutsAtivos
                .AnyAsync(t => t.TenantId == ctx.TenantId && t.LayoutId == req.LayoutId, ct);
            if (!layoutOk)
                return Results.BadRequest(new { erro = "Layout não está ativado para este tenant.", codigo = "layout_nao_ativo" });

            var pedido = Pedido.Criar(
                ctx.TenantId, req.LayoutId, statusInicial.Id, req.Etiqueta.Trim(),
                req.BoxId, arquivoImportacaoId: null, req.GrupoId,
                req.OrdemCompra, req.Cliente, req.PeCliente, req.Produto,
                req.Descricao, req.Qtde, req.Volume, req.Sequencia);
            db.Pedidos.Add(pedido);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/pedidos/{pedido.Id}", new { id = pedido.Id });
        }).WithName("CriarPedidoManual");

        grupo.MapPost("/lote/alterar-box", [HasPermission(Permissoes.Pedidos.AlterarBox)]
            async (LoteAlterarBoxReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (req.PedidoIds.Count == 0) return Results.NoContent();

            if (req.BoxId.HasValue)
            {
                var existe = await db.Boxes.AnyAsync(b => b.Id == req.BoxId.Value, ct);
                if (!existe) return Results.BadRequest(new { erro = "Box inexistente.", codigo = "box_invalido" });
            }

            var afetados = await db.Pedidos
                .Where(p => req.PedidoIds.Contains(p.Id))
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.BoxId, req.BoxId)
                                          .SetProperty(p => p.AtualizadoEm, DateTime.UtcNow), ct);
            return Results.Ok(new { afetados });
        }).WithName("AlterarBoxLote");

        grupo.MapPost("/lote/alterar-grupo", [HasPermission(Permissoes.Pedidos.AlterarGrupo)]
            async (LoteAlterarGrupoReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (req.PedidoIds.Count == 0) return Results.NoContent();

            if (req.GrupoId.HasValue)
            {
                var existe = await db.Grupos.AnyAsync(g => g.Id == req.GrupoId.Value, ct);
                if (!existe) return Results.BadRequest(new { erro = "Grupo inexistente.", codigo = "grupo_invalido" });
            }

            var afetados = await db.Pedidos
                .Where(p => req.PedidoIds.Contains(p.Id))
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.GrupoId, req.GrupoId)
                                          .SetProperty(p => p.AtualizadoEm, DateTime.UtcNow), ct);
            return Results.Ok(new { afetados });
        }).WithName("AlterarGrupoLote");

        grupo.MapPost("/lote/alterar-status", [HasPermission(Permissoes.Pedidos.AlterarStatus)]
            async (LoteAlterarStatusReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (req.PedidoIds.Count == 0) return Results.NoContent();

            var status = await db.Statuses.FirstOrDefaultAsync(s => s.Id == req.StatusId, ct);
            if (status is null)
                return Results.BadRequest(new { erro = "Status inexistente.", codigo = "status_invalido" });

            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var pedidos = await db.Pedidos
                .Where(p => req.PedidoIds.Contains(p.Id))
                .ToListAsync(ct);

            var agora = DateTime.UtcNow;
            foreach (var p in pedidos)
            {
                var statusAnterior = p.StatusId;
                p.AlterarStatus(status.Id);
                db.PedidoEventos.Add(PedidoEvento.Criar(
                    ctx.TenantId, p.Id, statusAnterior, status.Id,
                    ctx.UsuarioId, Guid.NewGuid(), OrigemEvento.Web,
                    metadataJson: "{\"origem\":\"alteracao_lote\"}"));
            }
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return Results.Ok(new { afetados = pedidos.Count });
        }).WithName("AlterarStatusLote");

        return app;
    }
}
