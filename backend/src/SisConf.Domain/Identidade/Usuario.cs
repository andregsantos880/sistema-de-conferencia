using SisConf.Domain.Common;

namespace SisConf.Domain.Identidade;

public class Usuario : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public string Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public string Nome { get; private set; } = null!;
    public bool EhOwner { get; private set; }
    public bool Ativo { get; private set; } = true;
    public DateTime? UltimoLoginEm { get; private set; }

    private readonly List<UsuarioRole> _roles = new();
    public IReadOnlyCollection<UsuarioRole> Roles => _roles.AsReadOnly();

    private Usuario() { }

    public static Usuario Criar(Guid tenantId, string email, string senhaHash, string nome, bool ehOwner = false)
    {
        return new Usuario
        {
            TenantId = tenantId,
            Email = email.ToLowerInvariant(),
            SenhaHash = senhaHash,
            Nome = nome,
            EhOwner = ehOwner
        };
    }

    public void AlterarSenha(string novaSenhaHash)
    {
        SenhaHash = novaSenhaHash;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void RegistrarLogin()
    {
        UltimoLoginEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Desativar()
    {
        if (EhOwner)
            throw new InvalidOperationException("Não é possível desativar o owner do tenant.");
        Ativo = false;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Ativar()
    {
        Ativo = true;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarNome(string novoNome)
    {
        Nome = novoNome;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AtribuirRoles(IEnumerable<Guid> roleIds)
    {
        _roles.Clear();
        foreach (var roleId in roleIds.Distinct())
            _roles.Add(new UsuarioRole { UsuarioId = Id, RoleId = roleId });
        AtualizadoEm = DateTime.UtcNow;
    }

    /// <summary>Transfere ownership para outro usuário. O outro precisa estar ativo.</summary>
    public void TransferirOwnershipPara(Usuario destino)
    {
        if (!EhOwner) throw new InvalidOperationException("Este usuário não é owner.");
        if (destino.TenantId != TenantId) throw new InvalidOperationException("Destino é de outro tenant.");
        if (!destino.Ativo) throw new InvalidOperationException("Destino está inativo.");

        EhOwner = false;
        destino.EhOwner = true;
        AtualizadoEm = DateTime.UtcNow;
        destino.AtualizadoEm = DateTime.UtcNow;
    }
}
