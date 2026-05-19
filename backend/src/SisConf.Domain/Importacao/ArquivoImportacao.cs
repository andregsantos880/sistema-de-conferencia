using SisConf.Domain.Common;

namespace SisConf.Domain.Importacao;

public enum ImportacaoStatus
{
    Recebido,
    Processando,
    Concluido,
    Erro,
    Cancelado
}

public class ArquivoImportacao : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid LayoutId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string NomeArquivo { get; private set; } = null!;
    public string StorageKey { get; private set; } = null!;
    public long StorageTamanhoBytes { get; private set; }
    public ImportacaoStatus Status { get; private set; }
    public int? TotalLinhas { get; private set; }
    public int LinhasOk { get; private set; }
    public int LinhasErro { get; private set; }
    public DateTime? IniciadoEm { get; private set; }
    public DateTime? FinalizadoEm { get; private set; }
    public string? MensagemErro { get; private set; }

    private ArquivoImportacao() { }

    public static ArquivoImportacao Criar(Guid tenantId, Guid layoutId, Guid usuarioId,
        string nomeArquivo, string storageKey, long tamanhoBytes, Guid? id = null)
    {
        var x = new ArquivoImportacao
        {
            TenantId = tenantId,
            LayoutId = layoutId,
            UsuarioId = usuarioId,
            NomeArquivo = nomeArquivo,
            StorageKey = storageKey,
            StorageTamanhoBytes = tamanhoBytes,
            Status = ImportacaoStatus.Recebido
        };
        if (id.HasValue) x.SetId(id.Value);
        return x;
    }

    /// <summary>Permite que o factory aceite Id explícito (precisa do Id antes de salvar no storage).</summary>
    public static ArquivoImportacao CriarComId(Guid id, Guid tenantId, Guid layoutId, Guid usuarioId,
        string nomeArquivo, string storageKey, long tamanhoBytes)
        => Criar(tenantId, layoutId, usuarioId, nomeArquivo, storageKey, tamanhoBytes, id);

    public void IniciarProcessamento()
    {
        Status = ImportacaoStatus.Processando;
        IniciadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Concluir(int totalLinhas, int linhasOk, int linhasErro)
    {
        Status = ImportacaoStatus.Concluido;
        TotalLinhas = totalLinhas;
        LinhasOk = linhasOk;
        LinhasErro = linhasErro;
        FinalizadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Falhar(string mensagem)
    {
        Status = ImportacaoStatus.Erro;
        MensagemErro = mensagem;
        FinalizadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Cancelar()
    {
        if (Status is ImportacaoStatus.Concluido or ImportacaoStatus.Erro)
            throw new InvalidOperationException("Importação já finalizada não pode ser cancelada.");
        Status = ImportacaoStatus.Cancelado;
        FinalizadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void RegistrarProgresso(int linhasOk, int linhasErro, int? totalLinhas = null)
    {
        LinhasOk = linhasOk;
        LinhasErro = linhasErro;
        if (totalLinhas.HasValue) TotalLinhas = totalLinhas;
        AtualizadoEm = DateTime.UtcNow;
    }
}

public class ArquivoImportacaoErro : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid ArquivoImportacaoId { get; private set; }
    public int NumeroLinha { get; private set; }
    public string? Conteudo { get; private set; }
    public string Mensagem { get; private set; } = null!;

    private ArquivoImportacaoErro() { }

    public static ArquivoImportacaoErro Criar(Guid tenantId, Guid arquivoId, int numeroLinha, string? conteudo, string mensagem)
    {
        return new ArquivoImportacaoErro
        {
            TenantId = tenantId,
            ArquivoImportacaoId = arquivoId,
            NumeroLinha = numeroLinha,
            Conteudo = conteudo,
            Mensagem = mensagem
        };
    }
}
