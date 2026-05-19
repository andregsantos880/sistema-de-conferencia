using System.Runtime.CompilerServices;

namespace SisConf.Application.Importacao;

/// <summary>
/// Resultado parcial de cada item lido de um arquivo: pode ser um pedido válido ou um erro de linha.
/// </summary>
public abstract record PedidoImportadoOuErro;

public record PedidoImportado(
    string Etiqueta,
    int? NumeroLinha,
    string? OrdemCompra,
    string? Cliente,
    string? PeCliente,
    string? Produto,
    string? Descricao,
    int? Qtde,
    string? Volume,
    long? Sequencia) : PedidoImportadoOuErro;

public record ErroLinhaImportacao(int NumeroLinha, string? Conteudo, string Mensagem) : PedidoImportadoOuErro;

/// <summary>
/// Implementações são registradas no DI por parser_key (ex: "todeschini", "csv-padrao")
/// e resolvidas em runtime pelo Layout.parser_key.
/// </summary>
public interface IPedidoImportParser
{
    string ParserKey { get; }
    IAsyncEnumerable<PedidoImportadoOuErro> ParseAsync(Stream conteudo, string nomeArquivo, [EnumeratorCancellation] CancellationToken ct = default);
}

/// <summary>Resolve um parser concreto pela parser_key do layout.</summary>
public interface IPedidoImportParserRegistry
{
    IPedidoImportParser? Resolver(string parserKey);
    IReadOnlyList<string> KeysSuportadas { get; }
}
