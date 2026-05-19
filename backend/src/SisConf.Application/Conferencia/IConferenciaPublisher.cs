namespace SisConf.Application.Conferencia;

/// <summary>
/// Publica resultados via SignalR. Implementação concreta vive na Infrastructure
/// para que o Application não dependa de SignalR diretamente.
/// </summary>
public interface IConferenciaPublisher
{
    Task EnviarParaUsuarioAsync(Guid usuarioId, ConferenciaResultado resultado, CancellationToken ct = default);
}
