using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Resultados;

namespace SisConf.Application.Identidade;

public record LoginRequest(string Email, string Senha);
public record RefreshRequest(string RefreshToken);

public record AuthResposta(
    Guid UsuarioId,
    Guid TenantId,
    string Email,
    string Nome,
    bool EhOwner,
    IReadOnlyList<string> Permissoes,
    TokensEmitidos Tokens);

public interface IAuthService
{
    Task<Resultado<AuthResposta>> LoginAsync(LoginRequest req, string? ip, string? userAgent, CancellationToken ct);
    Task<Resultado<AuthResposta>> RefreshAsync(RefreshRequest req, string? ip, string? userAgent, CancellationToken ct);
    Task<Resultado> LogoutAsync(string refreshToken, CancellationToken ct);
}
