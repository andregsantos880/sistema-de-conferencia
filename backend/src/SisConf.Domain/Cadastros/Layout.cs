using SisConf.Domain.Common;

namespace SisConf.Domain.Cadastros;

/// <summary>
/// Catálogo global de layouts de importação. Não pertence a tenant —
/// é mantido pela equipe do SaaS conforme novos fabricantes são suportados.
/// </summary>
public class Layout : Entidade
{
    public string Nome { get; private set; } = null!;
    public string ParserKey { get; private set; } = null!;
    public string? Descricao { get; private set; }
    public string? ExemploArquivoUrl { get; private set; }
    public bool Ativo { get; private set; } = true;

    private Layout() { }

    public static Layout Criar(string nome, string parserKey, string? descricao)
    {
        return new Layout
        {
            Nome = nome,
            ParserKey = parserKey,
            Descricao = descricao
        };
    }

    public void Atualizar(string nome, string? descricao, string? exemploArquivoUrl, bool ativo)
    {
        Nome = nome;
        Descricao = descricao;
        ExemploArquivoUrl = exemploArquivoUrl;
        Ativo = ativo;
        AtualizadoEm = DateTime.UtcNow;
    }
}

/// <summary>
/// Opt-in: cada tenant escolhe quais layouts do catálogo ele usa.
/// </summary>
public class TenantLayoutAtivo
{
    public Guid TenantId { get; set; }
    public Guid LayoutId { get; set; }
    public DateTime AtivadoEm { get; set; } = DateTime.UtcNow;
    public Guid AtivadoPorUsuarioId { get; set; }
}
