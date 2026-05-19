using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Cadastros;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record GrupoDto(Guid Id, string Nome, Guid CriadoPorUsuarioId, DateTime CriadoEm);
public record CriarGrupoReq(string Nome);
public record AtualizarGrupoReq(string Nome);

public static class GrupoEndpoints
{
    public static IEndpointRouteBuilder MapGrupoEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/grupos").WithTags("Grupos").RequireAuthorization();

        grupo.MapGet("/", async (SisConfDbContext db, CancellationToken ct) =>
        {
            var lista = await db.Grupos
                .OrderBy(g => g.Nome)
                .Select(g => new GrupoDto(g.Id, g.Nome, g.CriadoPorUsuarioId, g.CriadoEm))
                .ToListAsync(ct);
            return Results.Ok(lista);
        }).WithName("ListarGrupos");

        grupo.MapPost("/", [HasPermission(Permissoes.Cadastros.GruposGerenciar)]
            async (CriarGrupoReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var g = Grupo.Criar(ctx.TenantId, req.Nome.Trim(), ctx.UsuarioId);
            db.Grupos.Add(g);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/grupos/{g.Id}",
                new GrupoDto(g.Id, g.Nome, g.CriadoPorUsuarioId, g.CriadoEm));
        }).WithName("CriarGrupo");

        grupo.MapPut("/{id:guid}", [HasPermission(Permissoes.Cadastros.GruposGerenciar)]
            async (Guid id, AtualizarGrupoReq req, SisConfDbContext db, CancellationToken ct) =>
        {
            var g = await db.Grupos.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (g is null) return Results.NotFound();
            g.Renomear(req.Nome.Trim());
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtualizarGrupo");

        grupo.MapDelete("/{id:guid}", [HasPermission(Permissoes.Cadastros.GruposGerenciar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var g = await db.Grupos.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (g is null) return Results.NotFound();
            db.Grupos.Remove(g);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ExcluirGrupo");

        return app;
    }
}
