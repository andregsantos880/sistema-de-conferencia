using SisConf.Domain.Cadastros;

namespace SisConf.Infrastructure.Persistencia.Seeders;

/// <summary>
/// Cria os cadastros default ao registrar um novo tenant.
/// </summary>
public static class CadastrosIniciaisTenant
{
    public static IReadOnlyList<Status> CriarStatusIniciais(Guid tenantId)
    {
        return new[]
        {
            Status.Criar(tenantId, "normal", "Normal", "#94A3B8", ordem: 0,
                ehInicial: true, ehTerminal: false, ehBloqueio: false, ttsTexto: null),
            Status.Criar(tenantId, "conferido", "Conferido", "#22C55E", ordem: 1,
                ehInicial: false, ehTerminal: false, ehBloqueio: false, ttsTexto: "Conferido"),
            Status.Criar(tenantId, "saida", "Saída", "#F97316", ordem: 2,
                ehInicial: false, ehTerminal: false, ehBloqueio: false, ttsTexto: "Saída"),
            Status.Criar(tenantId, "entregue", "Entregue", "#3B82F6", ordem: 3,
                ehInicial: false, ehTerminal: true, ehBloqueio: true, ttsTexto: "Entregue"),
        };
    }

    public static IReadOnlyList<Box> CriarBoxesIniciais(Guid tenantId)
    {
        // Mínimo viável — tenant cadastra os seus depois
        return new[]
        {
            Box.Criar(tenantId, "01", "Box 01", "Box um"),
            Box.Criar(tenantId, "02", "Box 02", "Box dois"),
            Box.Criar(tenantId, "03", "Box 03", "Box três"),
        };
    }
}
