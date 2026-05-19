using SisConf.Domain.Common;

namespace SisConf.Domain.Faturamento;

public enum FaturaStatus
{
    Aberta,
    Paga,
    Vencida,
    Cancelada,
    Falhou
}

public class Fatura : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid? AssinaturaId { get; private set; }
    public string StripeInvoiceId { get; private set; } = null!;
    public string? Numero { get; private set; }
    public int ValorCentavos { get; private set; }
    public DateTime Vencimento { get; private set; }
    public FaturaStatus Status { get; private set; }
    public DateTime? PagoEm { get; private set; }
    public string? PaymentMethod { get; private set; }
    public string? LinkPagamento { get; private set; }
    public string? LinkPdf { get; private set; }

    private Fatura() { }

    public static Fatura Criar(Guid tenantId, Guid? assinaturaId, string stripeInvoiceId,
        string? numero, int valorCentavos, DateTime vencimento, FaturaStatus status,
        string? paymentMethod, string? linkPagamento, string? linkPdf)
        => new()
        {
            TenantId = tenantId,
            AssinaturaId = assinaturaId,
            StripeInvoiceId = stripeInvoiceId,
            Numero = numero,
            ValorCentavos = valorCentavos,
            Vencimento = vencimento,
            Status = status,
            PaymentMethod = paymentMethod,
            LinkPagamento = linkPagamento,
            LinkPdf = linkPdf
        };

    public void Atualizar(int valorCentavos, DateTime vencimento, FaturaStatus status,
        string? paymentMethod, string? linkPagamento, string? linkPdf, DateTime? pagoEm)
    {
        ValorCentavos = valorCentavos;
        Vencimento = vencimento;
        Status = status;
        PaymentMethod = paymentMethod;
        LinkPagamento = linkPagamento;
        LinkPdf = linkPdf;
        PagoEm = pagoEm;
        AtualizadoEm = DateTime.UtcNow;
    }
}
