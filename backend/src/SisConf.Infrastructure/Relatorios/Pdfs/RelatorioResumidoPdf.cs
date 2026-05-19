using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace SisConf.Infrastructure.Relatorios.Pdfs;

public record LinhaResumo(string StatusNome, string StatusCor, int Quantidade);

/// <summary>
/// Relatório resumido: contagem de pedidos por status no período/filtros informados.
/// </summary>
public class RelatorioResumidoPdf : IDocument
{
    private readonly string _tenantNome;
    private readonly string _periodo;
    private readonly IReadOnlyList<LinhaResumo> _linhas;
    private readonly int _totalPedidos;

    public RelatorioResumidoPdf(string tenantNome, string periodo, IReadOnlyList<LinhaResumo> linhas)
    {
        _tenantNome = tenantNome;
        _periodo = periodo;
        _linhas = linhas;
        _totalPedidos = linhas.Sum(l => l.Quantidade);
    }

    public DocumentMetadata GetMetadata() => new() { Title = "Relatório Resumido — SisConf" };

    public void Compose(IDocumentContainer container)
    {
        container.Page(p =>
        {
            p.Size(PageSizes.A4);
            p.Margin(40);
            p.PageColor(Colors.White);
            p.DefaultTextStyle(t => t.FontSize(11));

            p.Header().Column(col =>
            {
                col.Item().Text("SisConf — Relatório Resumido").FontSize(18).Bold();
                col.Item().Text(_tenantNome).FontSize(11).FontColor(Colors.Grey.Darken1);
                col.Item().Text(_periodo).FontSize(10).FontColor(Colors.Grey.Darken1);
                col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            });

            p.Content().PaddingTop(12).Column(col =>
            {
                col.Item().Text($"Total de pedidos: {_totalPedidos}").FontSize(12).Bold();
                col.Item().PaddingTop(12).Table(t =>
                {
                    t.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(3);
                        c.RelativeColumn(1);
                        c.RelativeColumn(1);
                    });

                    t.Header(h =>
                    {
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(6).Text("Status").Bold();
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("Qtde").Bold();
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(6).AlignRight().Text("%").Bold();
                    });

                    foreach (var l in _linhas)
                    {
                        var pct = _totalPedidos == 0 ? 0 : (100.0 * l.Quantidade / _totalPedidos);
                        t.Cell().Padding(6).Row(r =>
                        {
                            r.AutoItem().Width(10).Height(10).Background(NormalizarCor(l.StatusCor));
                            r.RelativeItem().PaddingLeft(6).Text(l.StatusNome);
                        });
                        t.Cell().Padding(6).AlignRight().Text(l.Quantidade.ToString());
                        t.Cell().Padding(6).AlignRight().Text($"{pct:0.0}%");
                    }
                });
            });

            p.Footer().AlignRight().Text(x =>
            {
                x.Span($"Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}  •  Página ").FontSize(9).FontColor(Colors.Grey.Darken1);
                x.CurrentPageNumber();
                x.Span(" de ");
                x.TotalPages();
            });
        });
    }

    private static string NormalizarCor(string hex)
    {
        var s = hex.TrimStart('#');
        return s.Length switch
        {
            6 => "#" + s,
            8 => "#" + s.Substring(2),  // ignora alpha
            _ => "#94A3B8"
        };
    }
}
