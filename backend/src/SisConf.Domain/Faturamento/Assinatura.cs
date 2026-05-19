using SisConf.Domain.Common;

namespace SisConf.Domain.Faturamento;

public enum AssinaturaStatus
{
    Trialing,
    Active,
    PastDue,
    Canceled,
    Incomplete
}

public class Assinatura : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid PlanoId { get; private set; }
    public AssinaturaStatus Status { get; private set; }
    public DateTime IniciadaEm { get; private set; }
    public DateTime? ProximaCobrancaEm { get; private set; }
    public DateTime? CanceladaEm { get; private set; }
    public string? StripeSubscriptionId { get; private set; }

    private Assinatura() { }

    public static Assinatura Criar(Guid tenantId, Guid planoId, string? stripeSubscriptionId = null)
        => new()
        {
            TenantId = tenantId,
            PlanoId = planoId,
            Status = AssinaturaStatus.Trialing,
            IniciadaEm = DateTime.UtcNow,
            StripeSubscriptionId = stripeSubscriptionId
        };

    public void VincularStripeSubscription(string id)
    {
        StripeSubscriptionId = id;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarStatus(AssinaturaStatus novo)
    {
        Status = novo;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarPlano(Guid novoPlanoId)
    {
        PlanoId = novoPlanoId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void DefinirProximaCobranca(DateTime quando)
    {
        ProximaCobrancaEm = quando;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void MarcarCancelada()
    {
        Status = AssinaturaStatus.Canceled;
        CanceladaEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }
}
