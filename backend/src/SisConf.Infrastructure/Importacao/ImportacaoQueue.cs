using System.Threading.Channels;
using SisConf.Application.Importacao;

namespace SisConf.Infrastructure.Importacao;

public class ImportacaoQueue : IImportacaoQueue
{
    private readonly Channel<ImportacaoCommand> _channel = Channel.CreateBounded<ImportacaoCommand>(
        new BoundedChannelOptions(capacity: 1000) { FullMode = BoundedChannelFullMode.Wait });

    public ValueTask EnqueueAsync(ImportacaoCommand command, CancellationToken ct = default)
        => _channel.Writer.WriteAsync(command, ct);

    public IAsyncEnumerable<ImportacaoCommand> ConsumirAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
