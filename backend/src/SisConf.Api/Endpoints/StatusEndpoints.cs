using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Cadastros;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record StatusDto(Guid Id, string Codigo, string Nome, string CorHex, int Ordem,
    bool EhInicial, bool EhTerminal, bool EhBloqueio, string? TtsTexto);

public record CriarStatusReq(string Codigo, string Nome, string CorHex, int Ordem,
    bool EhInicial, bool EhTerminal, bool EhBloqueio, string? TtsTexto);

public record AtualizarStatusReq(string Nome, string CorHex,
    bool EhInicial, bool EhTerminal, bool EhBloqueio, string? TtsTexto);

public record ReordenarItem(Guid Id, int Ordem);

public static class StatusEndpoints
{
    public static IEndpointRouteBuilder MapStatusEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/status")
            .WithTags("Status")
            .RequireAuthorization();

        grupo.MapGet("/", async (SisConfDbContext db, CancellationToken ct) =>
        {
            var lista = await db.Statuses
                .OrderBy(s => s.Ordem)
                .Select(s => new StatusDto(s.Id, s.Codigo, s.Nome, s.CorHex, s.Ordem,
                    s.EhInicial, s.EhTerminal, s.EhBloqueio, s.TtsTexto))
                .ToListAsync(ct);
            return Results.Ok(lista);
        }).WithName("ListarStatus");

        grupo.MapPost("/", [HasPermission(Permissoes.Cadastros.StatusGerenciar)]
            async (CriarStatusReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (await db.Statuses.AnyAsync(s => s.Codigo == req.Codigo, ct))
                return Results.BadRequest(new { erro = "Código já cadastrado.", codigo = "duplicado" });

            // Se ehInicial=true, desliga os outros iniciais
            if (req.EhInicial)
            {
                await db.Statuses.Where(s => s.EhInicial)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.EhInicial, false), ct);
            }

            var status = Status.Criar(ctx.TenantId, req.Codigo.Trim().ToLowerInvariant(),
                req.Nome.Trim(), req.CorHex, req.Ordem,
                req.EhInicial, req.EhTerminal, req.EhBloqueio, req.TtsTexto);
            db.Statuses.Add(status);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/status/{status.Id}", new StatusDto(
                status.Id, status.Codigo, status.Nome, status.CorHex, status.Ordem,
                status.EhInicial, status.EhTerminal, status.EhBloqueio, status.TtsTexto));
        }).WithName("CriarStatus");

        grupo.MapPut("/{id:guid}", [HasPermission(Permissoes.Cadastros.StatusGerenciar)]
            async (Guid id, AtualizarStatusReq req, SisConfDbContext db, CancellationToken ct) =>
        {
            var status = await db.Statuses.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (status is null) return Results.NotFound();

            if (req.EhInicial && !status.EhInicial)
            {
                await db.Statuses.Where(s => s.EhInicial && s.Id != id)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.EhInicial, false), ct);
            }

            status.Atualizar(req.Nome.Trim(), req.CorHex,
                req.EhInicial, req.EhTerminal, req.EhBloqueio, req.TtsTexto);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtualizarStatus");

        grupo.MapDelete("/{id:guid}", [HasPermission(Permissoes.Cadastros.StatusGerenciar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var status = await db.Statuses.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (status is null) return Results.NotFound();
            // F3 vai verificar uso por pedidos antes de excluir
            db.Statuses.Remove(status);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ExcluirStatus");

        grupo.MapPut("/reordenar", [HasPermission(Permissoes.Cadastros.StatusGerenciar)]
            async (List<ReordenarItem> itens, SisConfDbContext db, CancellationToken ct) =>
        {
            var ids = itens.Select(i => i.Id).ToList();
            var statuses = await db.Statuses.Where(s => ids.Contains(s.Id)).ToListAsync(ct);
            foreach (var item in itens)
            {
                var s = statuses.FirstOrDefault(x => x.Id == item.Id);
                s?.AlterarOrdem(item.Ordem);
            }
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ReordenarStatus");

        return app;
    }
}
