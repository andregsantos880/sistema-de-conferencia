namespace SisConf.Application.Common.Tenants;

/// <summary>
/// Contexto do tenant/usuário corrente. Populado pelo TenantResolutionMiddleware
/// a partir do JWT em cada request autenticada.
/// </summary>
public interface ITenantContext
{
    bool EstaAutenticado { get; }
    Guid TenantId { get; }
    Guid UsuarioId { get; }
    string Email { get; }
    bool EhOwner { get; }
    IReadOnlySet<string> Permissoes { get; }

    bool TemPermissao(string codigo);
}
