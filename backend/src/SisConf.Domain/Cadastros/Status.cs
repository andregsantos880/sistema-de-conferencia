using SisConf.Domain.Common;

namespace SisConf.Domain.Cadastros;

/// <summary>
/// Status configurável por tenant. Substitui o enum 0/1/2/3 hardcoded do legado.
/// </summary>
public class Status : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public string Codigo { get; private set; } = null!;
    public string Nome { get; private set; } = null!;
    public string CorHex { get; private set; } = "#94A3B8";
    public int Ordem { get; private set; }
    public bool EhInicial { get; private set; }
    public bool EhTerminal { get; private set; }
    public bool EhBloqueio { get; private set; }
    public string? TtsTexto { get; private set; }

    private Status() { }

    public static Status Criar(Guid tenantId, string codigo, string nome, string corHex, int ordem,
        bool ehInicial, bool ehTerminal, bool ehBloqueio, string? ttsTexto)
    {
        return new Status
        {
            TenantId = tenantId,
            Codigo = codigo,
            Nome = nome,
            CorHex = corHex,
            Ordem = ordem,
            EhInicial = ehInicial,
            EhTerminal = ehTerminal,
            EhBloqueio = ehBloqueio,
            TtsTexto = ttsTexto
        };
    }

    public void Atualizar(string nome, string corHex, bool ehInicial, bool ehTerminal, bool ehBloqueio, string? ttsTexto)
    {
        Nome = nome;
        CorHex = corHex;
        EhInicial = ehInicial;
        EhTerminal = ehTerminal;
        EhBloqueio = ehBloqueio;
        TtsTexto = ttsTexto;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarOrdem(int novaOrdem)
    {
        Ordem = novaOrdem;
        AtualizadoEm = DateTime.UtcNow;
    }
}
