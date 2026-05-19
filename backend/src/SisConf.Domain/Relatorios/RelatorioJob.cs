using SisConf.Domain.Common;

namespace SisConf.Domain.Relatorios;

public enum RelatorioJobStatus { Pendente, Processando, Concluido, Erro }

public class RelatorioJob : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Tipo { get; private set; } = null!;
    public string ParametrosJson { get; private set; } = "{}";
    public RelatorioJobStatus Status { get; private set; }
    public string? StorageKey { get; private set; }
    public string? MensagemErro { get; private set; }
    public DateTime? IniciadoEm { get; private set; }
    public DateTime? FinalizadoEm { get; private set; }

    private RelatorioJob() { }

    public static RelatorioJob Criar(Guid tenantId, Guid usuarioId, string tipo, string parametrosJson)
        => new()
        {
            TenantId = tenantId,
            UsuarioId = usuarioId,
            Tipo = tipo,
            ParametrosJson = parametrosJson,
            Status = RelatorioJobStatus.Pendente
        };

    public void Iniciar() { Status = RelatorioJobStatus.Processando; IniciadoEm = DateTime.UtcNow; AtualizadoEm = DateTime.UtcNow; }
    public void Concluir(string storageKey) { Status = RelatorioJobStatus.Concluido; StorageKey = storageKey; FinalizadoEm = DateTime.UtcNow; AtualizadoEm = DateTime.UtcNow; }
    public void Falhar(string mensagem) { Status = RelatorioJobStatus.Erro; MensagemErro = mensagem; FinalizadoEm = DateTime.UtcNow; AtualizadoEm = DateTime.UtcNow; }
}
