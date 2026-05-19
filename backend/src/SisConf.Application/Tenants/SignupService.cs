using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Resultados;

namespace SisConf.Application.Tenants;

public record SignupRequest(
    string RazaoSocial,
    string Documento,
    string Telefone,
    string PlanoCodigo,
    string NomeAdmin,
    string EmailAdmin,
    string SenhaAdmin);

public record SignupResposta(
    Guid TenantId,
    string TenantSlug,
    Guid UsuarioId,
    string Email,
    string Nome,
    TokensEmitidos Tokens);

public interface ISignupService
{
    Task<Resultado<SignupResposta>> ExecutarAsync(SignupRequest req, string? ip, string? userAgent, CancellationToken ct);
}
