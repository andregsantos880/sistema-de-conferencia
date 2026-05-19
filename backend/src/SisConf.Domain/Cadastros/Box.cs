using SisConf.Domain.Common;

namespace SisConf.Domain.Cadastros;

public class Box : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public string Codigo { get; private set; } = null!;
    public string Nome { get; private set; } = null!;
    public string? TtsTexto { get; private set; }
    public bool Ativo { get; private set; } = true;

    private Box() { }

    public static Box Criar(Guid tenantId, string codigo, string nome, string? ttsTexto)
    {
        return new Box
        {
            TenantId = tenantId,
            Codigo = codigo,
            Nome = nome,
            TtsTexto = ttsTexto
        };
    }

    public void Atualizar(string nome, string? ttsTexto, bool ativo)
    {
        Nome = nome;
        TtsTexto = ttsTexto;
        Ativo = ativo;
        AtualizadoEm = DateTime.UtcNow;
    }
}
