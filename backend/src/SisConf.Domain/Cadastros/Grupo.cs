using SisConf.Domain.Common;

namespace SisConf.Domain.Cadastros;

public class Grupo : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = null!;
    public Guid CriadoPorUsuarioId { get; private set; }

    private Grupo() { }

    public static Grupo Criar(Guid tenantId, string nome, Guid criadoPorUsuarioId)
    {
        return new Grupo
        {
            TenantId = tenantId,
            Nome = nome,
            CriadoPorUsuarioId = criadoPorUsuarioId
        };
    }

    public void Renomear(string novoNome)
    {
        Nome = novoNome;
        AtualizadoEm = DateTime.UtcNow;
    }
}
