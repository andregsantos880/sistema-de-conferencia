using Microsoft.AspNetCore.Authorization;

namespace SisConf.Infrastructure.Auth.Authorization;

/// <summary>
/// Exige que o JWT do usuário contenha a permissão informada (ou seu wildcard).
/// Uso: [HasPermission(Permissoes.Pedidos.Conferir)]
/// </summary>
public class HasPermissionAttribute : AuthorizeAttribute
{
    public const string PrefixoPolicy = "Permissao:";

    public HasPermissionAttribute(string codigoPermissao)
    {
        Policy = $"{PrefixoPolicy}{codigoPermissao}";
    }
}

public class PermissaoRequirement : IAuthorizationRequirement
{
    public string Codigo { get; }
    public PermissaoRequirement(string codigo) => Codigo = codigo;
}

public class PermissaoHandler : AuthorizationHandler<PermissaoRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissaoRequirement req)
    {
        var permissoes = context.User.FindAll(JwtTokenService.ClaimPermissoes).Select(c => c.Value).ToHashSet();
        if (permissoes.Contains(req.Codigo))
        {
            context.Succeed(req);
            return Task.CompletedTask;
        }

        var modulo = req.Codigo.Split('.')[0];
        if (permissoes.Contains($"{modulo}.*"))
        {
            context.Succeed(req);
        }
        return Task.CompletedTask;
    }
}
