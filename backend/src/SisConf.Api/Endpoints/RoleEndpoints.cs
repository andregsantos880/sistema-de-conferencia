using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Identidade;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record RoleDto(Guid Id, string Nome, string? Descricao, bool EhSistema, IReadOnlyList<string> Permissoes);
public record CriarRoleReq(string Nome, string? Descricao, List<string> Permissoes);
public record AtualizarRoleReq(string Nome, string? Descricao, List<string> Permissoes);
public record PermissaoCatalogoDto(string Codigo, string Modulo, string Acao, string Descricao);

public static class RoleEndpoints
{
    public static IEndpointRouteBuilder MapRoleEndpoints(this IEndpointRouteBuilder app)
    {
        // Catálogo de permissões — usado pela tela de roles
        app.MapGet("/api/permissoes", () =>
        {
            var lista = Permissoes.Catalogo
                .Select(p => new PermissaoCatalogoDto(p.Codigo, p.Modulo, p.Acao, p.Descricao))
                .ToList();
            return Results.Ok(lista);
        }).RequireAuthorization().WithTags("Permissoes").WithName("ListarPermissoes");

        var grupo = app.MapGroup("/api/roles").WithTags("Roles").RequireAuthorization();

        grupo.MapGet("/", async (SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            // Roles do tenant atual (Role tem TenantId nullable — não entra no filtro global)
            var roles = await db.Roles
                .Where(r => r.TenantId == ctx.TenantId)
                .OrderBy(r => r.Nome)
                .Select(r => new RoleDto(
                    r.Id, r.Nome, r.Descricao, r.EhSistema,
                    r.Permissoes.Select(p => p.PermissaoCodigo).OrderBy(c => c).ToList()))
                .ToListAsync(ct);
            return Results.Ok(roles);
        }).WithName("ListarRoles");

        grupo.MapPost("/", [HasPermission(Permissoes.Roles.Gerenciar)]
            async (CriarRoleReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            if (await db.Roles.AnyAsync(r => r.TenantId == ctx.TenantId && r.Nome == req.Nome, ct))
                return Results.BadRequest(new { erro = "Nome de role já cadastrado.", codigo = "duplicado" });

            ValidarPermissoesCodigos(req.Permissoes, out var invalidas);
            if (invalidas.Any())
                return Results.BadRequest(new { erro = "Permissões inválidas.", codigo = "permissoes_invalidas", invalidas });

            var role = Role.Criar(ctx.TenantId, req.Nome.Trim(), req.Descricao?.Trim(), ehSistema: false);
            foreach (var p in req.Permissoes.Distinct()) role.AdicionarPermissao(p);
            db.Roles.Add(role);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/roles/{role.Id}", new RoleDto(
                role.Id, role.Nome, role.Descricao, role.EhSistema,
                role.Permissoes.Select(p => p.PermissaoCodigo).OrderBy(c => c).ToList()));
        }).WithName("CriarRole");

        grupo.MapPut("/{id:guid}", [HasPermission(Permissoes.Roles.Gerenciar)]
            async (Guid id, AtualizarRoleReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var role = await db.Roles.Include(r => r.Permissoes)
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == ctx.TenantId, ct);
            if (role is null) return Results.NotFound();
            if (role.EhSistema)
                return Results.BadRequest(new { erro = "Roles de sistema não podem ser editadas. Duplique e edite a cópia.",
                    codigo = "role_sistema" });

            ValidarPermissoesCodigos(req.Permissoes, out var invalidas);
            if (invalidas.Any())
                return Results.BadRequest(new { erro = "Permissões inválidas.", codigo = "permissoes_invalidas", invalidas });

            role.Atualizar(req.Nome.Trim(), req.Descricao?.Trim());
            role.SubstituirPermissoes(req.Permissoes);

            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtualizarRole");

        grupo.MapDelete("/{id:guid}", [HasPermission(Permissoes.Roles.Gerenciar)]
            async (Guid id, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == id && r.TenantId == ctx.TenantId, ct);
            if (role is null) return Results.NotFound();
            if (role.EhSistema)
                return Results.BadRequest(new { erro = "Roles de sistema não podem ser excluídas.", codigo = "role_sistema" });

            var emUso = await db.UsuarioRoles.AnyAsync(ur => ur.RoleId == id, ct);
            if (emUso)
                return Results.BadRequest(new { erro = "Role em uso por usuários — remova das atribuições antes.",
                    codigo = "role_em_uso" });

            db.Roles.Remove(role);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ExcluirRole");

        return app;
    }

    private static readonly HashSet<string> _todasPermissoes = Permissoes.Catalogo.Select(p => p.Codigo).ToHashSet();

    private static void ValidarPermissoesCodigos(List<string> codigos, out List<string> invalidas)
    {
        invalidas = codigos.Where(c => !_todasPermissoes.Contains(c)).Distinct().ToList();
    }
}
