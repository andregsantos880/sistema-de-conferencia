using SisConf.Application.Importacao;

namespace SisConf.Infrastructure.Importacao;

public class PedidoImportParserRegistry : IPedidoImportParserRegistry
{
    private readonly Dictionary<string, IPedidoImportParser> _porKey;

    public PedidoImportParserRegistry(IEnumerable<IPedidoImportParser> parsers)
    {
        _porKey = parsers.ToDictionary(p => p.ParserKey, StringComparer.OrdinalIgnoreCase);
    }

    public IPedidoImportParser? Resolver(string parserKey)
        => _porKey.TryGetValue(parserKey, out var p) ? p : null;

    public IReadOnlyList<string> KeysSuportadas => _porKey.Keys.OrderBy(k => k).ToList();
}
