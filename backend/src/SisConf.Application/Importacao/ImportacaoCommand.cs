namespace SisConf.Application.Importacao;

public record ImportacaoCommand(Guid ArquivoImportacaoId, Guid TenantId, Guid UsuarioId);

public interface IImportacaoQueue
{
    ValueTask EnqueueAsync(ImportacaoCommand command, CancellationToken ct = default);
    IAsyncEnumerable<ImportacaoCommand> ConsumirAsync(CancellationToken ct);
}

public record ImportacaoProgresso(
    Guid ArquivoImportacaoId,
    string Status,
    int LinhasOk,
    int LinhasErro,
    int? TotalLinhas,
    string? MensagemErro = null);

public interface IImportacaoPublisher
{
    Task EnviarParaUsuarioAsync(Guid usuarioId, ImportacaoProgresso progresso, CancellationToken ct = default);
}
