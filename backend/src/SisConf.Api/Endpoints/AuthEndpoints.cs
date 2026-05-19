using SisConf.Application.Common.Tenants;
using SisConf.Application.Identidade;

namespace SisConf.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/auth").WithTags("Auth");

        grupo.MapPost("/login", async (LoginRequest req, IAuthService service, HttpContext http, CancellationToken ct) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString();
            var ua = http.Request.Headers.UserAgent.ToString();
            var r = await service.LoginAsync(req, ip, ua, ct);
            return PublicEndpoints.ParaHttp(r);
        }).WithName("Login");

        grupo.MapPost("/refresh", async (RefreshRequest req, IAuthService service, HttpContext http, CancellationToken ct) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString();
            var ua = http.Request.Headers.UserAgent.ToString();
            var r = await service.RefreshAsync(req, ip, ua, ct);
            return PublicEndpoints.ParaHttp(r);
        }).WithName("Refresh");

        grupo.MapPost("/logout", async (RefreshRequest req, IAuthService service, CancellationToken ct) =>
        {
            var r = await service.LogoutAsync(req.RefreshToken, ct);
            return PublicEndpoints.ParaHttp(r);
        }).WithName("Logout");

        // /api/me — útil para validar JWT e ver claims expandidas
        app.MapGet("/api/me", (ITenantContext ctx) =>
        {
            if (!ctx.EstaAutenticado) return Results.Unauthorized();
            return Results.Ok(new
            {
                ctx.UsuarioId,
                ctx.TenantId,
                ctx.Email,
                ctx.EhOwner,
                Permissoes = ctx.Permissoes
            });
        }).RequireAuthorization().WithTags("Auth").WithName("Me");

        return app;
    }
}
