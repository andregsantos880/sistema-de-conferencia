using System.Runtime.CompilerServices;
using SisConf.Application.Importacao;

namespace SisConf.Infrastructure.Importacao.Parsers;

/// <summary>
/// Porta direta do InserirBartzen do legado (Negocio/boPedido.cs:328).
/// Layout TAB-separado, primeira coluna deve começar com dígito.
/// Índices (legado):
///   [0] sequência/produto, [1] descrição, [11] qtde, [12] pe_cliente,
///   [13] cliente, [14] ord_compra, [n-1] etiqueta
/// </summary>
public class BartzenParser : IPedidoImportParser
{
    public string ParserKey => "bartzen";

    public async IAsyncEnumerable<PedidoImportadoOuErro> ParseAsync(Stream conteudo, string nomeArquivo,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        using var reader = new StreamReader(conteudo, System.Text.Encoding.UTF8, leaveOpen: true);

        int numero = 0;
        while (!reader.EndOfStream)
        {
            ct.ThrowIfCancellationRequested();
            numero++;
            var raw = await reader.ReadLineAsync(ct);
            if (raw is null) break;

            var t = raw.TrimEnd('\r');
            if (string.IsNullOrWhiteSpace(t)) continue;

            var cols = t.Split('\t');
            if (cols.Length == 0 || cols[0].Length == 0 || !char.IsDigit(cols[0][0]))
            {
                // não é linha de pedido (header/rodapé) — ignora silenciosamente
                continue;
            }

            if (cols.Length < 15)
            {
                yield return new ErroLinhaImportacao(numero, raw,
                    $"Linha com {cols.Length} colunas, esperado ao menos 15.");
                continue;
            }

            var produto = cols[0].Trim();
            var descricao = cols[1].Trim();
            int? qtde = int.TryParse(cols[11].Trim(), out var q) ? q : null;
            var peCliente = cols[12].Trim();
            var cliente = cols[13].Trim();
            var ordCompra = cols[14].Trim();
            var etiqueta = cols[cols.Length - 1].Trim();

            if (string.IsNullOrEmpty(etiqueta))
            {
                yield return new ErroLinhaImportacao(numero, raw, "Etiqueta (última coluna) vazia.");
                continue;
            }

            yield return new PedidoImportado(
                Etiqueta: etiqueta, NumeroLinha: numero,
                OrdemCompra: ordCompra.Length > 0 ? ordCompra : null,
                Cliente: cliente.Length > 0 ? cliente : null,
                PeCliente: peCliente.Length > 0 ? peCliente : null,
                Produto: produto.Length > 0 ? produto : null,
                Descricao: descricao.Length > 0 ? descricao : null,
                Qtde: qtde, Volume: null, Sequencia: null);
        }
    }
}
