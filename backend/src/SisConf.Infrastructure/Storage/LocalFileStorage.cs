using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SisConf.Application.Common.Storage;

namespace SisConf.Infrastructure.Storage;

/// <summary>
/// Storage local em disco — para dev e on-premises.
/// Estrutura: {rootDir}/{tenantId}/{contextoId}/{nomeSafe}
/// Em produção SaaS, troca por adapter R2/S3.
/// </summary>
public class LocalFileStorage : IFileStorage
{
    private readonly string _root;
    private readonly ILogger<LocalFileStorage> _log;

    public LocalFileStorage(IConfiguration config, ILogger<LocalFileStorage> log)
    {
        _root = config["Storage:LocalRoot"]
            ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "data", "uploads");
        _root = Path.GetFullPath(_root);
        Directory.CreateDirectory(_root);
        _log = log;
        _log.LogInformation("LocalFileStorage root: {Root}", _root);
    }

    public async Task<string> SalvarAsync(Guid tenantId, Guid contextoId, string nomeArquivo, Stream conteudo, CancellationToken ct = default)
    {
        var nomeSafe = SanitizarNome(nomeArquivo);
        var rel = Path.Combine(tenantId.ToString(), contextoId.ToString(), nomeSafe);
        var abs = Path.Combine(_root, rel);
        Directory.CreateDirectory(Path.GetDirectoryName(abs)!);

        await using var fs = File.Create(abs);
        await conteudo.CopyToAsync(fs, ct);
        return rel.Replace('\\', '/');
    }

    public Task<Stream> AbrirAsync(string storageKey, CancellationToken ct = default)
    {
        var abs = Path.Combine(_root, storageKey.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(abs)) throw new FileNotFoundException("Arquivo não encontrado.", storageKey);
        Stream s = File.OpenRead(abs);
        return Task.FromResult(s);
    }

    public Task ExcluirAsync(string storageKey, CancellationToken ct = default)
    {
        var abs = Path.Combine(_root, storageKey.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(abs)) File.Delete(abs);
        return Task.CompletedTask;
    }

    private static string SanitizarNome(string nome)
    {
        var invalidos = Path.GetInvalidFileNameChars();
        var sb = new System.Text.StringBuilder(nome.Length);
        foreach (var c in nome) sb.Append(invalidos.Contains(c) ? '_' : c);
        var saneado = sb.ToString().Trim();
        return string.IsNullOrEmpty(saneado) ? Guid.NewGuid().ToString("N") : saneado;
    }
}
