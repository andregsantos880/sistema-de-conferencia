using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Resultados;
using SisConf.Application.Identidade;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Identidade.Servicos;

public class AuthService : IAuthService
{
    private readonly SisConfDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly ILogger<AuthService> _log;

    public AuthService(SisConfDbContext db, IPasswordHasher hasher, IJwtTokenService jwt, ILogger<AuthService> log)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _log = log;
    }

    public async Task<Resultado<AuthResposta>> LoginAsync(LoginRequest req, string? ip, string? userAgent, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Email == email && u.Ativo, ct);

        // Mensagem genérica para não vazar enumeração de usuários
        if (usuario is null || !_hasher.Verificar(req.Senha, usuario.SenhaHash))
            return Resultado<AuthResposta>.Falha("Credenciais inválidas.", "credenciais_invalidas");

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == usuario.TenantId, ct);
        if (tenant is null || tenant.Status is TenantStatus.Suspenso or TenantStatus.Cancelado)
            return Resultado<AuthResposta>.Falha("Tenant inativo. Regularize sua assinatura.", "tenant_inativo");

        usuario.RegistrarLogin();
        var resposta = await EmitirTokensAsync(usuario, ip, userAgent, ct);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Login OK usuario={UsuarioId} tenant={TenantId}", usuario.Id, usuario.TenantId);
        return Resultado<AuthResposta>.Ok(resposta);
    }

    public async Task<Resultado<AuthResposta>> RefreshAsync(RefreshRequest req, string? ip, string? userAgent, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(req.RefreshToken))
            return Resultado<AuthResposta>.Falha("Refresh token ausente.", "refresh_invalido");

        var hashCalculado = _jwt.HashRefreshToken(req.RefreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hashCalculado, ct);

        if (token is null || !token.EstaAtivo)
            return Resultado<AuthResposta>.Falha("Refresh token inválido ou expirado.", "refresh_invalido");

        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == token.UsuarioId && u.Ativo, ct);
        if (usuario is null)
            return Resultado<AuthResposta>.Falha("Usuário inativo.", "usuario_inativo");

        // Rotação: revoga o token usado e emite um novo
        token.Revogar();

        var resposta = await EmitirTokensAsync(usuario, ip, userAgent, ct);

        // Liga o novo refresh ao antigo (rastreabilidade)
        var ultimoCriado = _db.ChangeTracker.Entries<RefreshToken>()
            .Where(e => e.State == EntityState.Added)
            .Select(e => e.Entity)
            .FirstOrDefault();
        if (ultimoCriado is not null) token.Revogar(ultimoCriado.Id);

        await _db.SaveChangesAsync(ct);
        return Resultado<AuthResposta>.Ok(resposta);
    }

    public async Task<Resultado> LogoutAsync(string refreshToken, CancellationToken ct)
    {
        var hash = _jwt.HashRefreshToken(refreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (token is not null && token.EstaAtivo)
        {
            token.Revogar();
            await _db.SaveChangesAsync(ct);
        }
        return Resultado.Ok();
    }

    private async Task<AuthResposta> EmitirTokensAsync(Usuario usuario, string? ip, string? userAgent, CancellationToken ct)
    {
        var permissoes = await _db.UsuarioRoles
            .Where(ur => ur.UsuarioId == usuario.Id)
            .Join(_db.RolePermissoes, ur => ur.RoleId, rp => rp.RoleId, (_, rp) => rp.PermissaoCodigo)
            .Distinct()
            .ToListAsync(ct);

        var tokens = _jwt.Emitir(new DadosUsuarioToken(
            usuario.Id, usuario.TenantId, usuario.Email, usuario.Nome, usuario.EhOwner, permissoes));

        var refreshHash = _jwt.HashRefreshToken(tokens.RefreshToken);
        var refresh = RefreshToken.Criar(usuario.TenantId, usuario.Id, refreshHash,
            tokens.RefreshTokenExpiraEm, ip, userAgent);
        _db.RefreshTokens.Add(refresh);

        return new AuthResposta(usuario.Id, usuario.TenantId, usuario.Email, usuario.Nome,
            usuario.EhOwner, permissoes, tokens);
    }
}
