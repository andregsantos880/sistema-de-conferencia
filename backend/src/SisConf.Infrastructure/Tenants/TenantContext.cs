using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SisConf.Application.Common.Tenants;
using SisConf.Infrastructure.Auth;

namespace SisConf.Infrastructure.Tenants;

public class TenantContext : ITenantContext
{
    public bool EstaAutenticado { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public bool EhOwner { get; private set; }
    public IReadOnlySet<string> Permissoes { get; private set; } = new HashSet<string>();

    public TenantContext(IHttpContextAccessor httpAccessor)
    {
        var user = httpAccessor.HttpContext?.User;
        if (user?.Identity is null || !user.Identity.IsAuthenticated) return;

        var tenantId = user.FindFirst(JwtTokenService.ClaimTenantId)?.Value;
        var sub = user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
                ?? user.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(sub)) return;

        EstaAutenticado = true;
        TenantId = Guid.Parse(tenantId);
        UsuarioId = Guid.Parse(sub);
        Email = email ?? string.Empty;
        EhOwner = user.FindFirst(JwtTokenService.ClaimEhOwner)?.Value == "true";
        Permissoes = user.FindAll(JwtTokenService.ClaimPermissoes)
                         .Select(c => c.Value)
                         .ToHashSet();
    }

    public bool TemPermissao(string codigo)
    {
        if (Permissoes.Contains(codigo)) return true;
        // Suporte a wildcard: "modulo.*" concede todas as ações daquele módulo
        var modulo = codigo.Split('.')[0];
        return Permissoes.Contains($"{modulo}.*");
    }
}
