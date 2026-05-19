namespace SisConf.Application.Conferencia;

/// <summary>
/// Comando despachado pelo endpoint para a fila assíncrona.
/// O ClientEventId é gerado pelo browser e garante idempotência em retries.
/// </summary>
public record ConferenciaCommand(
    Guid ClientEventId,
    Guid TenantId,
    Guid UsuarioId,
    string UsuarioNome,
    string Etiqueta,
    Guid StatusDestinoId,
    string? ConnectionId,
    string? IpOrigem,
    string? UserAgent);

public interface IConferenciaQueue
{
    ValueTask EnqueueAsync(ConferenciaCommand command, CancellationToken ct = default);
    IAsyncEnumerable<ConferenciaCommand> ConsumirAsync(CancellationToken ct);
}
