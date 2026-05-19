using SisConf.Domain.Common;

namespace SisConf.Domain.Conferencia;

public enum OrigemEvento
{
    Web,
    Mobile,
    Import,
    Sistema
}

/// <summary>
/// Source-of-truth do histórico. Cada conferência/alteração de status gera uma linha.
/// client_event_id garante idempotência contra retries da fila offline do browser.
/// </summary>
public class PedidoEvento : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid PedidoId { get; private set; }
    public Guid? StatusAnteriorId { get; private set; }
    public Guid StatusNovoId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public Guid ClientEventId { get; private set; }
    public DateTime OcorreuEm { get; private set; }
    public OrigemEvento Origem { get; private set; }
    public string? MetadataJson { get; private set; }

    private PedidoEvento() { }

    public static PedidoEvento Criar(
        Guid tenantId, Guid pedidoId,
        Guid? statusAnteriorId, Guid statusNovoId,
        Guid usuarioId, Guid clientEventId,
        OrigemEvento origem, string? metadataJson = null)
    {
        return new PedidoEvento
        {
            TenantId = tenantId,
            PedidoId = pedidoId,
            StatusAnteriorId = statusAnteriorId,
            StatusNovoId = statusNovoId,
            UsuarioId = usuarioId,
            ClientEventId = clientEventId,
            OcorreuEm = DateTime.UtcNow,
            Origem = origem,
            MetadataJson = metadataJson
        };
    }
}
