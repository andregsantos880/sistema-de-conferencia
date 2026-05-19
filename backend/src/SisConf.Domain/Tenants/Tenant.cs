using SisConf.Domain.Common;

namespace SisConf.Domain.Tenants;

public enum TenantStatus
{
    Trial,
    Ativo,
    EmAtraso,
    Suspenso,
    Cancelado
}

public class Tenant : Entidade
{
    public string Slug { get; private set; } = null!;
    public string RazaoSocial { get; private set; } = null!;
    public string Documento { get; private set; } = null!;
    public string EmailAdmin { get; private set; } = null!;
    public string? Telefone { get; private set; }
    public TenantStatus Status { get; private set; }
    public DateTime? TrialTerminaEm { get; private set; }
    public string? StripeCustomerId { get; private set; }
    /// <summary>
    /// Plano corrente do tenant. Em F6 isso passa a ser derivado de Assinatura;
    /// por enquanto fica direto no Tenant para enforcement de limites.
    /// </summary>
    public Guid? PlanoId { get; private set; }

    private Tenant() { }

    public static Tenant Criar(string slug, string razaoSocial, string documento, string emailAdmin,
        string? telefone, Guid planoId)
    {
        return new Tenant
        {
            Slug = slug,
            RazaoSocial = razaoSocial,
            Documento = documento,
            EmailAdmin = emailAdmin,
            Telefone = telefone,
            PlanoId = planoId,
            Status = TenantStatus.Trial,
            TrialTerminaEm = DateTime.UtcNow.AddDays(14)
        };
    }

    public void AlterarPlano(Guid novoPlanoId)
    {
        PlanoId = novoPlanoId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void VincularStripeCustomer(string stripeCustomerId)
    {
        StripeCustomerId = stripeCustomerId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarStatus(TenantStatus novoStatus)
    {
        Status = novoStatus;
        AtualizadoEm = DateTime.UtcNow;
    }
}
