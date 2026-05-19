using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Application.Conferencia;
using SisConf.Infrastructure.Auth.Authorization;

namespace SisConf.Api.Endpoints;

public record ConferirEtiquetaReq(Guid ClientEventId, string Etiqueta, Guid StatusDestinoId, string? ConnectionId);

public static class ConferenciaEndpoints
{
    public static IEndpointRouteBuilder MapConferenciaEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/conferencias").WithTags("Conferencia").RequireAuthorization();

        grupo.MapPost("/", [HasPermission(Permissoes.Pedidos.Conferir)]
            async (ConferirEtiquetaReq req, IConferenciaQueue queue,
                ITenantContext ctx, HttpContext http, CancellationToken ct) =>
        {
            if (req.ClientEventId == Guid.Empty)
                return Results.BadRequest(new { erro = "clientEventId é obrigatório.", codigo = "client_event_id_ausente" });
            if (string.IsNullOrWhiteSpace(req.Etiqueta))
                return Results.BadRequest(new { erro = "Etiqueta é obrigatória.", codigo = "etiqueta_ausente" });

            var ip = http.Connection.RemoteIpAddress?.ToString();
            var ua = http.Request.Headers.UserAgent.ToString();
            var nome = http.User.FindFirst("nome")?.Value ?? string.Empty;

            await queue.EnqueueAsync(new ConferenciaCommand(
                req.ClientEventId, ctx.TenantId, ctx.UsuarioId, nome,
                req.Etiqueta.Trim(), req.StatusDestinoId, req.ConnectionId, ip, ua), ct);

            // 202 Accepted: o processamento é assíncrono; o resultado chega via SignalR.
            return Results.Accepted(value: new { clientEventId = req.ClientEventId, status = "enfileirado" });
        }).WithName("Conferir");

        return app;
    }
}
