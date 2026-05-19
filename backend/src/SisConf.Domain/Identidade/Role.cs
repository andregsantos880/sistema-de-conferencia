using SisConf.Domain.Common;

namespace SisConf.Domain.Identidade;

public class Role : Entidade
{
    public Guid? TenantId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string? Descricao { get; private set; }
    public bool EhSistema { get; private set; }

    private readonly List<RolePermissao> _permissoes = new();
    public IReadOnlyCollection<RolePermissao> Permissoes => _permissoes.AsReadOnly();

    private Role() { }

    public static Role Criar(Guid? tenantId, string nome, string? descricao, bool ehSistema)
    {
        return new Role
        {
            TenantId = tenantId,
            Nome = nome,
            Descricao = descricao,
            EhSistema = ehSistema
        };
    }

    public void AdicionarPermissao(string codigo)
    {
        if (_permissoes.Any(p => p.PermissaoCodigo == codigo)) return;
        _permissoes.Add(new RolePermissao { RoleId = Id, PermissaoCodigo = codigo });
    }

    public void RemoverPermissao(string codigo)
    {
        var item = _permissoes.FirstOrDefault(p => p.PermissaoCodigo == codigo);
        if (item is not null) _permissoes.Remove(item);
    }

    public void SubstituirPermissoes(IEnumerable<string> codigos)
    {
        _permissoes.Clear();
        foreach (var c in codigos.Distinct())
            _permissoes.Add(new RolePermissao { RoleId = Id, PermissaoCodigo = c });
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Atualizar(string nome, string? descricao)
    {
        Nome = nome;
        Descricao = descricao;
        AtualizadoEm = DateTime.UtcNow;
    }
}

public class Permissao
{
    public string Codigo { get; private set; } = null!;
    public string Modulo { get; private set; } = null!;
    public string Acao { get; private set; } = null!;
    public string Descricao { get; private set; } = null!;

    private Permissao() { }

    public static Permissao Criar(string codigo, string modulo, string acao, string descricao)
        => new() { Codigo = codigo, Modulo = modulo, Acao = acao, Descricao = descricao };
}

public class UsuarioRole
{
    public Guid UsuarioId { get; set; }
    public Guid RoleId { get; set; }
}

public class RolePermissao
{
    public Guid RoleId { get; set; }
    public string PermissaoCodigo { get; set; } = null!;
}
