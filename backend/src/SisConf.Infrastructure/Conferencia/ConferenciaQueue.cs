using System.Threading.Channels;
using SisConf.Application.Conferencia;

namespace SisConf.Infrastructure.Conferencia;

/// <summary>
/// Fila in-process baseada em System.Threading.Channels.
/// Capacidade limitada com BoundedChannelFullMode.Wait — produtores esperam se atingirem o teto
/// (evita explodir memória sob pico extremo de bipagem; produtor sempre é HTTP endpoint, então 100k é folga).
/// </summary>
public class ConferenciaQueue : IConferenciaQueue
{
    private readonly Channel<ConferenciaCommand> _channel;

    public ConferenciaQueue()
    {
        var opts = new BoundedChannelOptions(capacity: 100_000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = false,
            SingleWriter = false
        };
        _channel = Channel.CreateBounded<ConferenciaCommand>(opts);
    }

    public ValueTask EnqueueAsync(ConferenciaCommand command, CancellationToken ct = default)
        => _channel.Writer.WriteAsync(command, ct);

    public IAsyncEnumerable<ConferenciaCommand> ConsumirAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
