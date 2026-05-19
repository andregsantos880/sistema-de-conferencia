using System.Runtime.CompilerServices;
using SisConf.Application.Importacao;

namespace SisConf.Infrastructure.Importacao.Parsers;

/// <summary>
/// Parser CSV genérico. Aceita separador ';' ou ','.
/// Cabeçalho obrigatório com pelo menos a coluna "etiqueta". Demais opcionais:
///   ordem_compra, cliente, pe_cliente, produto, descricao, qtde, volume, sequencia
/// Linhas em branco e comentários (#) são ignorados.
/// </summary>
public class CsvPadraoParser : IPedidoImportParser
{
    public string ParserKey => "csv-padrao";

    public async IAsyncEnumerable<PedidoImportadoOuErro> ParseAsync(Stream conteudo, string nomeArquivo,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        using var reader = new StreamReader(conteudo, System.Text.Encoding.UTF8, leaveOpen: true);

        var headerLinha = await SkipBrancos(reader, ct);
        if (headerLinha is null) yield break;

        var sep = headerLinha.Contains(';') ? ';' : ',';
        var headers = headerLinha.Split(sep).Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int idxEtiqueta = Array.IndexOf(headers, "etiqueta");
        if (idxEtiqueta < 0)
        {
            yield return new ErroLinhaImportacao(1, headerLinha,
                "Cabeçalho inválido: coluna 'etiqueta' não encontrada.");
            yield break;
        }

        int Idx(string nome) => Array.IndexOf(headers, nome);
        int idxOC = Idx("ordem_compra"), idxCli = Idx("cliente"), idxPe = Idx("pe_cliente"),
            idxProd = Idx("produto"), idxDesc = Idx("descricao"), idxQtde = Idx("qtde"),
            idxVol = Idx("volume"), idxSeq = Idx("sequencia");

        int numero = 1;
        while (!reader.EndOfStream)
        {
            ct.ThrowIfCancellationRequested();
            numero++;
            var raw = await reader.ReadLineAsync(ct);
            if (raw is null) break;
            var linha = raw.Trim();
            if (string.IsNullOrEmpty(linha) || linha.StartsWith('#')) continue;

            var cols = linha.Split(sep);
            if (cols.Length <= idxEtiqueta)
            {
                yield return new ErroLinhaImportacao(numero, raw, "Quantidade de colunas insuficiente.");
                continue;
            }

            var etiqueta = cols[idxEtiqueta].Trim();
            if (string.IsNullOrEmpty(etiqueta))
            {
                yield return new ErroLinhaImportacao(numero, raw, "Etiqueta vazia.");
                continue;
            }

            int? qtde = null;
            if (idxQtde >= 0 && idxQtde < cols.Length && int.TryParse(cols[idxQtde].Trim(), out var q)) qtde = q;
            long? seq = null;
            if (idxSeq >= 0 && idxSeq < cols.Length && long.TryParse(cols[idxSeq].Trim(), out var s)) seq = s;

            yield return new PedidoImportado(
                etiqueta, numero,
                Pick(cols, idxOC), Pick(cols, idxCli), Pick(cols, idxPe),
                Pick(cols, idxProd), Pick(cols, idxDesc),
                qtde, Pick(cols, idxVol), seq);
        }
    }

    private static async Task<string?> SkipBrancos(StreamReader r, CancellationToken ct)
    {
        while (!r.EndOfStream)
        {
            var l = await r.ReadLineAsync(ct);
            if (l is null) return null;
            var t = l.Trim();
            if (t.Length > 0 && !t.StartsWith('#')) return t;
        }
        return null;
    }

    private static string? Pick(string[] cols, int idx)
        => (idx >= 0 && idx < cols.Length) ? Empty(cols[idx].Trim()) : null;

    private static string? Empty(string s) => string.IsNullOrEmpty(s) ? null : s;
}
