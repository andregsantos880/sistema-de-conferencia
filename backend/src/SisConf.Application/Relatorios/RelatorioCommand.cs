namespace SisConf.Application.Relatorios;

public record RelatorioCommand(Guid JobId, Guid TenantId, Guid UsuarioId);

public interface IRelatorioQueue
{
    ValueTask EnqueueAsync(RelatorioCommand cmd, CancellationToken ct = default);
    IAsyncEnumerable<RelatorioCommand> ConsumirAsync(CancellationToken ct);
}
