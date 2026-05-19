namespace SisConf.Domain.Common;

public abstract class Entidade
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CriadoEm { get; protected set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; protected set; } = DateTime.UtcNow;

    protected Entidade() { }
    protected Entidade(Guid id) => Id = id;

    /// <summary>Reescreve o Id — usado por factories que precisam coordenar com recursos externos
    /// (storage key, integrações). Use com parcimônia.</summary>
    protected internal void SetId(Guid id) => Id = id;
}

public interface IPertenceTenant
{
    Guid TenantId { get; }
}
