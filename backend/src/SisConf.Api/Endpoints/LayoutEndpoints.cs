using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Cadastros;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record LayoutDto(Guid Id, string Nome, string ParserKey, string? Descricao, bool Ativo, bool AtivadoParaTenant);

public static class LayoutEndpoints
{
    public static IEndpointRouteBuilder MapLayoutEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/layouts").WithTags("Layouts").RequireAuthorization();

        grupo.MapGet("/", async (SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            // Catálogo global + flag "ativado para este tenant"
            var ativos = await db.TenantLayoutsAtivos
                .Where(t => t.TenantId == ctx.TenantId)
                .Select(t => t.LayoutId)
                .ToListAsync(ct);
            var ativosSet = ativos.ToHashSet();

            var lista = await db.Layouts.IgnoreQueryFilters()
                .Where(l => l.Ativo)
                .OrderBy(l => l.Nome)
                .Select(l => new LayoutDto(l.Id, l.Nome, l.ParserKey, l.Descricao, l.Ativo, false))
                .ToListAsync(ct);

            // Marca quais estão ativos para o tenant
            var resultado = lista.Select(l => l with { AtivadoParaTenant = ativosSet.Contains(l.Id) }).ToList();
            return Results.Ok(resultado);
        }).WithName("ListarLayouts");

        grupo.MapPost("/{id:guid}/ativar", [HasPermission(Permissoes.Cadastros.LayoutsGerenciar)]
            async (Guid id, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var layout = await db.Layouts.IgnoreQueryFilters().FirstOrDefaultAsync(l => l.Id == id && l.Ativo, ct);
            if (layout is null) return Results.NotFound();

            var ja = await db.TenantLayoutsAtivos
                .AnyAsync(t => t.TenantId == ctx.TenantId && t.LayoutId == id, ct);
            if (ja) return Results.NoContent();

            db.TenantLayoutsAtivos.Add(new TenantLayoutAtivo
            {
                TenantId = ctx.TenantId,
                LayoutId = id,
                AtivadoEm = DateTime.UtcNow,
                AtivadoPorUsuarioId = ctx.UsuarioId
            });
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtivarLayout");

        grupo.MapPost("/{id:guid}/desativar", [HasPermission(Permissoes.Cadastros.LayoutsGerenciar)]
            async (Guid id, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var vinculo = await db.TenantLayoutsAtivos
                .FirstOrDefaultAsync(t => t.TenantId == ctx.TenantId && t.LayoutId == id, ct);
            if (vinculo is null) return Results.NoContent();
            db.TenantLayoutsAtivos.Remove(vinculo);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("DesativarLayout");

        return app;
    }
}
