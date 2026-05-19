using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SisConf.Infrastructure.Auth.Authorization;

/// <summary>
/// Cria policies dinamicamente para cada permissão referenciada por [HasPermission].
/// Evita ter que registrar policy por policy em Program.cs.
/// </summary>
public class PermissaoPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissaoPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallback = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallback.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallback.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(HasPermissionAttribute.PrefixoPolicy, StringComparison.Ordinal))
        {
            var codigo = policyName[HasPermissionAttribute.PrefixoPolicy.Length..];
            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissaoRequirement(codigo))
                .Build();
            return Task.FromResult<AuthorizationPolicy?>(policy);
        }
        return _fallback.GetPolicyAsync(policyName);
    }
}
