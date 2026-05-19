namespace SisConf.Application.Common.Resultados;

/// <summary>
/// Resultado padronizado de use cases. Evita lançar exceções para erros de negócio.
/// </summary>
public class Resultado
{
    public bool Sucesso { get; }
    public string? Erro { get; }
    public string? CodigoErro { get; }

    protected Resultado(bool sucesso, string? erro, string? codigoErro)
    {
        Sucesso = sucesso;
        Erro = erro;
        CodigoErro = codigoErro;
    }

    public static Resultado Ok() => new(true, null, null);
    public static Resultado Falha(string erro, string codigoErro) => new(false, erro, codigoErro);
}

public class Resultado<T> : Resultado
{
    public T? Valor { get; }

    private Resultado(bool sucesso, T? valor, string? erro, string? codigoErro)
        : base(sucesso, erro, codigoErro)
    {
        Valor = valor;
    }

    public static Resultado<T> Ok(T valor) => new(true, valor, null, null);
    public static new Resultado<T> Falha(string erro, string codigoErro) => new(false, default, erro, codigoErro);
}
