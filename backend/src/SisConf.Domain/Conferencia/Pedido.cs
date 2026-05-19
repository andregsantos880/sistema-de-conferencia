using SisConf.Domain.Common;

namespace SisConf.Domain.Conferencia;

/// <summary>
/// Pedido / peça a ser conferida. status_id é "denormalizado" — aponta para o último
/// evento em pedido_evento (source-of-truth do histórico).
/// </summary>
public class Pedido : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid? ArquivoImportacaoId { get; private set; }
    public Guid LayoutId { get; private set; }
    public Guid? BoxId { get; private set; }
    public Guid? GrupoId { get; private set; }
    public Guid StatusId { get; private set; }

    public string Etiqueta { get; private set; } = null!;
    public string? OrdemCompra { get; private set; }
    public string? Cliente { get; private set; }
    public string? PeCliente { get; private set; }
    public string? Produto { get; private set; }
    public string? Descricao { get; private set; }
    public int? Qtde { get; private set; }
    public string? Volume { get; private set; }
    public long? Sequencia { get; private set; }

    // Locking distribuído (substitui FlBloqueio + PECOMPUTADOR do legado)
    public string? LockSessionId { get; private set; }
    public DateTime? LockExpiresAt { get; private set; }
    public Guid? LockUsuarioId { get; private set; }

    private Pedido() { }

    public static Pedido Criar(
        Guid tenantId, Guid layoutId, Guid statusInicialId,
        string etiqueta, Guid? boxId = null, Guid? arquivoImportacaoId = null, Guid? grupoId = null,
        string? ordemCompra = null, string? cliente = null, string? peCliente = null,
        string? produto = null, string? descricao = null, int? qtde = null,
        string? volume = null, long? sequencia = null)
    {
        return new Pedido
        {
            TenantId = tenantId,
            LayoutId = layoutId,
            StatusId = statusInicialId,
            Etiqueta = etiqueta,
            BoxId = boxId,
            ArquivoImportacaoId = arquivoImportacaoId,
            GrupoId = grupoId,
            OrdemCompra = ordemCompra,
            Cliente = cliente,
            PeCliente = peCliente,
            Produto = produto,
            Descricao = descricao,
            Qtde = qtde,
            Volume = volume,
            Sequencia = sequencia
        };
    }

    public void AlterarStatus(Guid novoStatusId)
    {
        StatusId = novoStatusId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarBox(Guid? novoBoxId)
    {
        BoxId = novoBoxId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarGrupo(Guid? novoGrupoId)
    {
        GrupoId = novoGrupoId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Bloquear(string sessionId, Guid usuarioId, TimeSpan ttl)
    {
        LockSessionId = sessionId;
        LockUsuarioId = usuarioId;
        LockExpiresAt = DateTime.UtcNow.Add(ttl);
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Desbloquear()
    {
        LockSessionId = null;
        LockUsuarioId = null;
        LockExpiresAt = null;
        AtualizadoEm = DateTime.UtcNow;
    }

    public bool EstaBloqueado(DateTime agora)
        => LockExpiresAt.HasValue && LockExpiresAt.Value > agora;

    public bool LockPertenceA(string sessionId)
        => string.Equals(LockSessionId, sessionId, StringComparison.Ordinal);
}
