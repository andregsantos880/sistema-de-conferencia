using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Cadastros;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record BoxDto(Guid Id, string Codigo, string Nome, string? TtsTexto, bool Ativo);
public record CriarBoxReq(string Codigo, string Nome, string? TtsTexto);
public record AtualizarBoxReq(string Nome, string? TtsTexto, bool Ativo);

public static class BoxEndpoints
{
    public static IEndpointRouteBuilder MapBoxEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/boxes").WithTags("Boxes").RequireAuthorization();

        grupo.MapGet("/", async (SisConfDbContext db, bool? incluirInativos, CancellationToken ct) =>
        {
            var q = db.Boxes.AsQueryable();
            if (incluirInativos != true) q = q.Where(b => b.Ativo);
            var lista = await q.OrderBy(b => b.Codigo)
                .Select(b => new BoxDto(b.Id, b.Codigo, b.Nome, b.TtsTexto, b.Ativo))
                .ToListAsync(ct);
            return Results.Ok(lista);
        }).WithName("ListarBoxes");

        grupo.MapPost("/", [HasPermission(Permissoes.Cadastros.BoxesGerenciar)]
            async (CriarBoxReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (await db.Boxes.AnyAsync(b => b.Codigo == req.Codigo, ct))
                return Results.BadRequest(new { erro = "Código já cadastrado.", codigo = "duplicado" });

            var box = Box.Criar(ctx.TenantId, req.Codigo.Trim(), req.Nome.Trim(), req.TtsTexto);
            db.Boxes.Add(box);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/boxes/{box.Id}",
                new BoxDto(box.Id, box.Codigo, box.Nome, box.TtsTexto, box.Ativo));
        }).WithName("CriarBox");

        grupo.MapPut("/{id:guid}", [HasPermission(Permissoes.Cadastros.BoxesGerenciar)]
            async (Guid id, AtualizarBoxReq req, SisConfDbContext db, CancellationToken ct) =>
        {
            var box = await db.Boxes.FirstOrDefaultAsync(b => b.Id == id, ct);
            if (box is null) return Results.NotFound();
            box.Atualizar(req.Nome.Trim(), req.TtsTexto, req.Ativo);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtualizarBox");

        grupo.MapDelete("/{id:guid}", [HasPermission(Permissoes.Cadastros.BoxesGerenciar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var box = await db.Boxes.FirstOrDefaultAsync(b => b.Id == id, ct);
            if (box is null) return Results.NotFound();
            db.Boxes.Remove(box);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ExcluirBox");

        return app;
    }
}
