namespace SisConf.Application.Common.Auth;

/// <summary>
/// Catálogo estático de todas as permissões do sistema.
/// Codigo = "modulo.acao". Wildcard: "modulo.*" concede todas as ações do módulo.
/// </summary>
public static class Permissoes
{
    public record Item(string Codigo, string Modulo, string Acao, string Descricao);

    public static class Pedidos
    {
        public const string Visualizar = "pedidos.visualizar";
        public const string Conferir = "pedidos.conferir";
        public const string AlterarBox = "pedidos.alterar_box";
        public const string AlterarStatus = "pedidos.alterar_status";
        public const string AlterarGrupo = "pedidos.alterar_grupo";
        public const string Exportar = "pedidos.exportar";
        public const string CriarManual = "pedidos.criar_manual";
    }

    public static class Importacao
    {
        public const string Upload = "importacao.upload";
        public const string Visualizar = "importacao.visualizar";
        public const string Reprocessar = "importacao.reprocessar";
        public const string Cancelar = "importacao.cancelar";
    }

    public static class Cadastros
    {
        public const string StatusGerenciar = "status.gerenciar";
        public const string BoxesGerenciar = "boxes.gerenciar";
        public const string LayoutsGerenciar = "layouts.gerenciar";
        public const string GruposGerenciar = "grupos.gerenciar";
    }

    public static class Usuarios
    {
        public const string Visualizar = "usuarios.visualizar";
        public const string Gerenciar = "usuarios.gerenciar";
        public const string AtribuirRoles = "usuarios.atribuir_roles";
    }

    public static class Roles
    {
        public const string Gerenciar = "roles.gerenciar";
    }

    public static class Historico
    {
        public const string Visualizar = "historico.visualizar";
        public const string Exportar = "historico.exportar";
    }

    public static class Relatorios
    {
        public const string Gerar = "relatorios.gerar";
    }

    public static class Faturas
    {
        public const string Visualizar = "faturas.visualizar";
        public const string Gerenciar = "faturas.gerenciar";
    }

    public static class Tenant
    {
        public const string Configurar = "tenant.configurar";
    }

    public static IReadOnlyList<Item> Catalogo { get; } = new[]
    {
        new Item(Pedidos.Visualizar, "pedidos", "visualizar", "Visualizar pedidos"),
        new Item(Pedidos.Conferir, "pedidos", "conferir", "Conferir (bipar) pedidos"),
        new Item(Pedidos.AlterarBox, "pedidos", "alterar_box", "Alterar box dos pedidos"),
        new Item(Pedidos.AlterarStatus, "pedidos", "alterar_status", "Alterar status dos pedidos em lote"),
        new Item(Pedidos.AlterarGrupo, "pedidos", "alterar_grupo", "Adicionar pedidos a grupos"),
        new Item(Pedidos.Exportar, "pedidos", "exportar", "Exportar pedidos (Excel)"),
        new Item(Pedidos.CriarManual, "pedidos", "criar_manual", "Criar pedido manualmente (sem importação)"),

        new Item(Importacao.Upload, "importacao", "upload", "Fazer upload de arquivos"),
        new Item(Importacao.Visualizar, "importacao", "visualizar", "Visualizar histórico de importações"),
        new Item(Importacao.Reprocessar, "importacao", "reprocessar", "Reprocessar uma importação"),
        new Item(Importacao.Cancelar, "importacao", "cancelar", "Cancelar uma importação em andamento"),

        new Item(Cadastros.StatusGerenciar, "status", "gerenciar", "Gerenciar cadastros de status"),
        new Item(Cadastros.BoxesGerenciar, "boxes", "gerenciar", "Gerenciar cadastros de boxes"),
        new Item(Cadastros.LayoutsGerenciar, "layouts", "gerenciar", "Ativar/desativar layouts"),
        new Item(Cadastros.GruposGerenciar, "grupos", "gerenciar", "Gerenciar grupos"),

        new Item(Usuarios.Visualizar, "usuarios", "visualizar", "Visualizar usuários"),
        new Item(Usuarios.Gerenciar, "usuarios", "gerenciar", "Criar, editar e desativar usuários"),
        new Item(Usuarios.AtribuirRoles, "usuarios", "atribuir_roles", "Atribuir roles a usuários"),

        new Item(Roles.Gerenciar, "roles", "gerenciar", "Gerenciar roles e suas permissões"),

        new Item(Historico.Visualizar, "historico", "visualizar", "Visualizar histórico de eventos"),
        new Item(Historico.Exportar, "historico", "exportar", "Exportar histórico"),

        new Item(Relatorios.Gerar, "relatorios", "gerar", "Gerar relatórios"),

        new Item(Faturas.Visualizar, "faturas", "visualizar", "Visualizar faturas"),
        new Item(Faturas.Gerenciar, "faturas", "gerenciar", "Gerenciar pagamento e assinatura"),

        new Item(Tenant.Configurar, "tenant", "configurar", "Configurar dados gerais do tenant"),
    };

    /// <summary>Todas as permissões exceto admin_saas. Usado para o role Admin do tenant.</summary>
    public static IEnumerable<string> TodasDoTenant => Catalogo.Select(c => c.Codigo);
}
