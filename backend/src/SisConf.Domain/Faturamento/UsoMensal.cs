using SisConf.Domain.Common;

namespace SisConf.Domain.Faturamento;

/// <summary>
/// Contador mensal de uso por tenant para enforcement de limites do plano.
/// PK composta (tenant_id, ano_mes), atualizada via increment atômico.
/// </summary>
public class UsoMensal : IPertenceTenant
{
    public Guid TenantId { get; private set; }
    /// <summary>yyyymm — ex: 202605</summary>
    public int AnoMes { get; private set; }
    public int ImportacoesCount { get; private set; }
    public int PedidosProcessadosCount { get; private set; }
    public DateTime AtualizadoEm { get; private set; } = DateTime.UtcNow;

    private UsoMensal() { }

    public static UsoMensal Novo(Guid tenantId, int anoMes)
        => new() { TenantId = tenantId, AnoMes = anoMes };

    public static int AnoMesAtual(DateTime? agora = null)
    {
        var d = (agora ?? DateTime.UtcNow);
        return d.Year * 100 + d.Month;
    }
}
