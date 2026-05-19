using SisConf.Domain.Common;

namespace SisConf.Domain.Faturamento;

/// <summary>
/// Espelha cada webhook Stripe recebido. Idempotência via StripeEventId UNIQUE.
/// </summary>
public class StripeEvento : Entidade
{
    public string Tipo { get; private set; } = null!;
    public string StripeEventId { get; private set; } = null!;
    public string PayloadJson { get; private set; } = null!;
    public DateTime? ProcessadoEm { get; private set; }
    public string? ErroProcessamento { get; private set; }
    public DateTime RecebidoEm { get; private set; }

    private StripeEvento() { }

    public static StripeEvento Criar(string tipo, string stripeEventId, string payloadJson)
        => new()
        {
            Tipo = tipo,
            StripeEventId = stripeEventId,
            PayloadJson = payloadJson,
            RecebidoEm = DateTime.UtcNow
        };

    public void MarcarProcessado()
    {
        ProcessadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void MarcarErro(string mensagem)
    {
        ErroProcessamento = mensagem;
        AtualizadoEm = DateTime.UtcNow;
    }
}
