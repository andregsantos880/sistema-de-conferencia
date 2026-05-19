namespace SisConf.Application.Common.Auth;

public record TokensEmitidos(string AccessToken, DateTime AccessTokenExpiraEm, string RefreshToken, DateTime RefreshTokenExpiraEm);

public record DadosUsuarioToken(
    Guid UsuarioId,
    Guid TenantId,
    string Email,
    string Nome,
    bool EhOwner,
    IEnumerable<string> Permissoes);

public interface IJwtTokenService
{
    TokensEmitidos Emitir(DadosUsuarioToken dados);
    string HashRefreshToken(string refreshToken);
    bool VerificarRefreshToken(string refreshToken, string hashArmazenado);
}
