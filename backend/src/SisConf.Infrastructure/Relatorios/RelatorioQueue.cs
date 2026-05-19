using System.Threading.Channels;
using SisConf.Application.Relatorios;

namespace SisConf.Infrastructure.Relatorios;

public class RelatorioQueue : IRelatorioQueue
{
    private readonly Channel<RelatorioCommand> _channel = Channel.CreateBounded<RelatorioCommand>(
        new BoundedChannelOptions(500) { FullMode = BoundedChannelFullMode.Wait });

    public ValueTask EnqueueAsync(RelatorioCommand cmd, CancellationToken ct = default)
        => _channel.Writer.WriteAsync(cmd, ct);

    public IAsyncEnumerable<RelatorioCommand> ConsumirAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
