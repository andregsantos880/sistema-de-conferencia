using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SisConf.Application.Common.Auth;

namespace SisConf.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    public const string ClaimTenantId = "tenant_id";
    public const string ClaimEhOwner = "eh_owner";
    public const string ClaimPermissoes = "perms";

    private readonly JwtOptions _opts;
    private readonly SymmetricSecurityKey _key;

    public JwtTokenService(IOptions<JwtOptions> opts)
    {
        _opts = opts.Value;
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.Secret));
    }

    public TokensEmitidos Emitir(DadosUsuarioToken d)
    {
        var agora = DateTime.UtcNow;
        var accessExp = agora.AddMinutes(_opts.AccessTokenMinutes);
        var refreshExp = agora.AddDays(_opts.RefreshTokenDays);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, d.UsuarioId.ToString()),
            new(JwtRegisteredClaimNames.Email, d.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("nome", d.Nome),
            new(ClaimTenantId, d.TenantId.ToString()),
            new(ClaimEhOwner, d.EhOwner ? "true" : "false"),
        };
        claims.AddRange(d.Permissoes.Select(p => new Claim(ClaimPermissoes, p)));

        var token = new JwtSecurityToken(
            issuer: _opts.Issuer,
            audience: _opts.Audience,
            claims: claims,
            notBefore: agora,
            expires: accessExp,
            signingCredentials: new SigningCredentials(_key, SecurityAlgorithms.HmacSha256));

        var accessJwt = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshTokenPlano = GerarRefreshTokenPlano();

        return new TokensEmitidos(accessJwt, accessExp, refreshTokenPlano, refreshExp);
    }

    public string HashRefreshToken(string refreshToken)
    {
        var bytes = Encoding.UTF8.GetBytes(refreshToken);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }

    public bool VerificarRefreshToken(string refreshToken, string hashArmazenado)
    {
        var hashCalculado = HashRefreshToken(refreshToken);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(hashCalculado),
            Encoding.UTF8.GetBytes(hashArmazenado));
    }

    private static string GerarRefreshTokenPlano()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}
