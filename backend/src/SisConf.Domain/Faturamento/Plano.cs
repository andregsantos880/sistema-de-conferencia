using SisConf.Domain.Common;

namespace SisConf.Domain.Faturamento;

public class Plano : Entidade
{
    public string Nome { get; private set; } = null!;
    public string Codigo { get; private set; } = null!;
    public int PrecoMensalCentavos { get; private set; }
    public int LimiteImportacoesMes { get; private set; }
    public string? StripePriceId { get; private set; }
    public string RecursosJson { get; private set; } = "{}";
    public bool Ativo { get; private set; } = true;
    public int Ordem { get; private set; }

    private Plano() { }

    public static Plano Criar(string nome, string codigo, int precoMensalCentavos, int limiteImportacoesMes, int ordem)
    {
        return new Plano
        {
            Nome = nome,
            Codigo = codigo,
            PrecoMensalCentavos = precoMensalCentavos,
            LimiteImportacoesMes = limiteImportacoesMes,
            Ordem = ordem
        };
    }

    public void VincularStripePrice(string stripePriceId)
    {
        StripePriceId = stripePriceId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public bool EhIlimitado => LimiteImportacoesMes == -1;
}
