using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Identidade;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record UsuarioDto(Guid Id, string Email, string Nome, bool Ativo, bool EhOwner,
    DateTime? UltimoLoginEm, DateTime CriadoEm, IReadOnlyList<Guid> RoleIds);
public record CriarUsuarioReq(string Email, string Nome, string Senha, List<Guid> RoleIds);
public record AtualizarUsuarioReq(string Nome, bool Ativo);
public record AtribuirRolesReq(List<Guid> RoleIds);
public record RedefinirSenhaReq(string NovaSenha);
public record TransferirOwnerReq(Guid NovoOwnerUsuarioId);

public static class UsuarioEndpoints
{
    public static IEndpointRouteBuilder MapUsuarioEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/usuarios").WithTags("Usuarios").RequireAuthorization();

        grupo.MapGet("/", [HasPermission(Permissoes.Usuarios.Visualizar)]
            async (SisConfDbContext db, CancellationToken ct) =>
        {
            var lista = await db.Usuarios
                .Include(u => u.Roles)
                .OrderBy(u => u.Nome)
                .Select(u => new UsuarioDto(
                    u.Id, u.Email, u.Nome, u.Ativo, u.EhOwner,
                    u.UltimoLoginEm, u.CriadoEm,
                    u.Roles.Select(r => r.RoleId).ToList()))
                .ToListAsync(ct);
            return Results.Ok(lista);
        }).WithName("ListarUsuarios");

        grupo.MapGet("/{id:guid}", [HasPermission(Permissoes.Usuarios.Visualizar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var u = await db.Usuarios.Include(x => x.Roles).FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return Results.NotFound();
            return Results.Ok(new UsuarioDto(u.Id, u.Email, u.Nome, u.Ativo, u.EhOwner,
                u.UltimoLoginEm, u.CriadoEm, u.Roles.Select(r => r.RoleId).ToList()));
        }).WithName("ObterUsuario");

        grupo.MapPost("/", [HasPermission(Permissoes.Usuarios.Gerenciar)]
            async (CriarUsuarioReq req, SisConfDbContext db, IPasswordHasher hasher,
                ITenantContext ctx, CancellationToken ct) =>
        {
            if (req.Senha.Length < 8)
                return Results.BadRequest(new { erro = "Senha deve ter ao menos 8 caracteres.", codigo = "senha_curta" });

            var emailNorm = req.Email.Trim().ToLowerInvariant();
            if (await db.Usuarios.AnyAsync(u => u.Email == emailNorm, ct))
                return Results.BadRequest(new { erro = "Email já cadastrado.", codigo = "email_duplicado" });

            var rolesValidas = await db.Roles
                .Where(r => r.TenantId == ctx.TenantId && req.RoleIds.Contains(r.Id))
                .Select(r => r.Id).ToListAsync(ct);
            if (rolesValidas.Count != req.RoleIds.Distinct().Count())
                return Results.BadRequest(new { erro = "Uma ou mais roles informadas não existem.", codigo = "roles_invalidas" });

            var usuario = Usuario.Criar(ctx.TenantId, emailNorm, hasher.Hash(req.Senha), req.Nome.Trim());
            usuario.AtribuirRoles(rolesValidas);
            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/usuarios/{usuario.Id}",
                new UsuarioDto(usuario.Id, usuario.Email, usuario.Nome, usuario.Ativo, usuario.EhOwner,
                    null, usuario.CriadoEm, rolesValidas));
        }).WithName("CriarUsuario");

        grupo.MapPut("/{id:guid}", [HasPermission(Permissoes.Usuarios.Gerenciar)]
            async (Guid id, AtualizarUsuarioReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var u = await db.Usuarios.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return Results.NotFound();
            if (u.EhOwner && !req.Ativo)
                return Results.BadRequest(new { erro = "O owner do tenant não pode ser desativado. Transfira ownership primeiro.",
                    codigo = "owner_protegido" });

            u.AlterarNome(req.Nome.Trim());
            if (req.Ativo && !u.Ativo) u.Ativar();
            else if (!req.Ativo && u.Ativo) u.Desativar();

            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtualizarUsuario");

        grupo.MapDelete("/{id:guid}", [HasPermission(Permissoes.Usuarios.Gerenciar)]
            async (Guid id, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var u = await db.Usuarios.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return Results.NotFound();
            if (u.EhOwner)
                return Results.BadRequest(new { erro = "O owner não pode ser excluído.", codigo = "owner_protegido" });
            if (u.Id == ctx.UsuarioId)
                return Results.BadRequest(new { erro = "Você não pode excluir a si mesmo.", codigo = "auto_exclusao" });

            // Soft-delete via desativação preserva histórico (pedido_evento.usuario_id FK)
            u.Desativar();
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("ExcluirUsuario");

        grupo.MapPost("/{id:guid}/atribuir-roles", [HasPermission(Permissoes.Usuarios.AtribuirRoles)]
            async (Guid id, AtribuirRolesReq req, SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var u = await db.Usuarios.Include(x => x.Roles).FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return Results.NotFound();

            var rolesValidas = await db.Roles
                .Where(r => r.TenantId == ctx.TenantId && req.RoleIds.Contains(r.Id))
                .Select(r => r.Id).ToListAsync(ct);
            if (rolesValidas.Count != req.RoleIds.Distinct().Count())
                return Results.BadRequest(new { erro = "Uma ou mais roles informadas não existem.", codigo = "roles_invalidas" });

            u.AtribuirRoles(rolesValidas);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AtribuirRoles");

        grupo.MapPost("/{id:guid}/redefinir-senha", [HasPermission(Permissoes.Usuarios.Gerenciar)]
            async (Guid id, RedefinirSenhaReq req, SisConfDbContext db, IPasswordHasher hasher, CancellationToken ct) =>
        {
            if (req.NovaSenha.Length < 8)
                return Results.BadRequest(new { erro = "Senha deve ter ao menos 8 caracteres.", codigo = "senha_curta" });
            var u = await db.Usuarios.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return Results.NotFound();
            u.AlterarSenha(hasher.Hash(req.NovaSenha));

            // Revoga todos os refresh tokens ativos do usuário
            await db.RefreshTokens
                .Where(rt => rt.UsuarioId == id && rt.RevogadoEm == null)
                .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevogadoEm, DateTime.UtcNow), ct);

            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("RedefinirSenhaUsuario");

        grupo.MapPost("/transferir-owner", async (TransferirOwnerReq req, SisConfDbContext db,
            ITenantContext ctx, CancellationToken ct) =>
        {
            if (!ctx.EhOwner)
                return Results.Forbid();

            var atual = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == ctx.UsuarioId, ct);
            var destino = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == req.NovoOwnerUsuarioId, ct);
            if (atual is null || destino is null) return Results.NotFound();

            try
            {
                atual.TransferirOwnershipPara(destino);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { erro = ex.Message, codigo = "transferencia_invalida" });
            }

            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("TransferirOwner");

        return app;
    }
}
