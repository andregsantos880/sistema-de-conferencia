using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Resultados;
using SisConf.Application.Tenants;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public static class PublicEndpoints
{
    public static IEndpointRouteBuilder MapPublicEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/public").WithTags("Public");

        grupo.MapGet("/planos", async (SisConfDbContext db) =>
        {
            var planos = await db.Planos
                .Where(p => p.Ativo)
                .OrderBy(p => p.Ordem)
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Codigo,
                    p.PrecoMensalCentavos,
                    p.LimiteImportacoesMes,
                    Recursos = p.RecursosJson,
                    EhIlimitado = p.LimiteImportacoesMes == -1
                })
                .ToListAsync();
            return Results.Ok(planos);
        }).WithName("ListarPlanosPublicos");

        grupo.MapPost("/signup", async (
            SignupRequest req,
            ISignupService service,
            HttpContext http,
            CancellationToken ct) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString();
            var ua = http.Request.Headers.UserAgent.ToString();
            var resultado = await service.ExecutarAsync(req, ip, ua, ct);
            return ParaHttp(resultado);
        }).WithName("Signup");

        return app;
    }

    internal static IResult ParaHttp<T>(Resultado<T> r)
        => r.Sucesso
            ? Results.Ok(r.Valor)
            : Results.BadRequest(new { erro = r.Erro, codigo = r.CodigoErro });

    internal static IResult ParaHttp(Resultado r)
        => r.Sucesso
            ? Results.NoContent()
            : Results.BadRequest(new { erro = r.Erro, codigo = r.CodigoErro });
}
