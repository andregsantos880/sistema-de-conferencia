namespace SisConf.Application.Common.Storage;

public interface IFileStorage
{
    /// <summary>Salva o stream e retorna a chave usada para recuperar depois.</summary>
    Task<string> SalvarAsync(Guid tenantId, Guid contextoId, string nomeArquivo, Stream conteudo, CancellationToken ct = default);

    /// <summary>Abre o conteúdo para leitura. Caller deve fechar o stream.</summary>
    Task<Stream> AbrirAsync(string storageKey, CancellationToken ct = default);

    Task ExcluirAsync(string storageKey, CancellationToken ct = default);
}
