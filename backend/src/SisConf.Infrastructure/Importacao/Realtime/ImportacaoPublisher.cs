using Microsoft.AspNetCore.SignalR;
using SisConf.Application.Importacao;

namespace SisConf.Infrastructure.Importacao.Realtime;

public class ImportacaoPublisher : IImportacaoPublisher
{
    private readonly IHubContext<ImportacaoHub> _hub;
    public ImportacaoPublisher(IHubContext<ImportacaoHub> hub) => _hub = hub;

    public Task EnviarParaUsuarioAsync(Guid usuarioId, ImportacaoProgresso progresso, CancellationToken ct = default)
        => _hub.Clients.Group(ImportacaoHub.GrupoDoUsuario(usuarioId))
            .SendAsync("importacaoProgresso", progresso, ct);
}
