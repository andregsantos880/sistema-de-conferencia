using SisConf.Application.Common.Auth;
using SisConf.Domain.Identidade;

namespace SisConf.Infrastructure.Persistencia.Seeders;

/// <summary>
/// Cria as 4 roles template para um tenant recém-criado.
/// Não é seeder global — é chamado pelo SignupService.
/// </summary>
public static class RolesTenantTemplate
{
    public static IReadOnlyList<Role> CriarParaTenant(Guid tenantId)
    {
        var admin = Role.Criar(tenantId, "Admin", "Acesso total ao tenant.", ehSistema: true);
        foreach (var p in Permissoes.TodasDoTenant) admin.AdicionarPermissao(p);

        var supervisor = Role.Criar(tenantId, "Supervisor",
            "Operação completa de pedidos, histórico e relatórios.", ehSistema: true);
        foreach (var p in PermissoesSupervisor) supervisor.AdicionarPermissao(p);

        var conferente = Role.Criar(tenantId, "Conferente",
            "Apenas conferência (bipagem) de pedidos.", ehSistema: true);
        conferente.AdicionarPermissao(Permissoes.Pedidos.Visualizar);
        conferente.AdicionarPermissao(Permissoes.Pedidos.Conferir);

        var importador = Role.Criar(tenantId, "Importador",
            "Upload e gerenciamento de importações.", ehSistema: true);
        foreach (var p in PermissoesImportador) importador.AdicionarPermissao(p);

        return new[] { admin, supervisor, conferente, importador };
    }

    private static readonly string[] PermissoesSupervisor =
    {
        Permissoes.Pedidos.Visualizar, Permissoes.Pedidos.Conferir,
        Permissoes.Pedidos.AlterarBox, Permissoes.Pedidos.AlterarStatus,
        Permissoes.Pedidos.AlterarGrupo, Permissoes.Pedidos.Exportar,
        Permissoes.Historico.Visualizar, Permissoes.Historico.Exportar,
        Permissoes.Relatorios.Gerar,
        Permissoes.Importacao.Visualizar,
        Permissoes.Usuarios.Visualizar
    };

    private static readonly string[] PermissoesImportador =
    {
        Permissoes.Importacao.Upload, Permissoes.Importacao.Visualizar,
        Permissoes.Importacao.Reprocessar, Permissoes.Importacao.Cancelar,
        Permissoes.Pedidos.Visualizar
    };
}
