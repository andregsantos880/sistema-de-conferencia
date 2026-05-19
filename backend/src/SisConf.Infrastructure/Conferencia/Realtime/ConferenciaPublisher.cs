using Microsoft.AspNetCore.SignalR;
using SisConf.Application.Conferencia;

namespace SisConf.Infrastructure.Conferencia.Realtime;

public class ConferenciaPublisher : IConferenciaPublisher
{
    private readonly IHubContext<ConferenciaHub> _hub;

    public ConferenciaPublisher(IHubContext<ConferenciaHub> hub) => _hub = hub;

    public Task EnviarParaUsuarioAsync(Guid usuarioId, ConferenciaResultado resultado, CancellationToken ct = default)
    {
        return _hub.Clients.Group(ConferenciaHub.GrupoDoUsuario(usuarioId))
            .SendAsync("conferenciaResultado", resultado, ct);
    }
}
