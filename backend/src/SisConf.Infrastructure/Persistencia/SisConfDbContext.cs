using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Common;
using SisConf.Domain.Conferencia;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Identidade;
using SisConf.Domain.Importacao;
using SisConf.Domain.Relatorios;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia;

public class SisConfDbContext : DbContext
{
    /// <summary>
    /// Tenant do request corrente. Acessado pelos HasQueryFilter como property de instância
    /// (não closure), o que faz o EF Core parametrizar a query por request.
    /// Guid.Empty desliga o filtro (migrations, signup, seed).
    /// </summary>
    public Guid TenantIdFiltro { get; private set; }

    public SisConfDbContext(DbContextOptions<SisConfDbContext> options, ITenantContext? tenantContext = null) : base(options)
    {
        TenantIdFiltro = (tenantContext?.EstaAutenticado ?? false) ? tenantContext.TenantId : Guid.Empty;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permissao> Permissoes => Set<Permissao>();
    public DbSet<UsuarioRole> UsuarioRoles => Set<UsuarioRole>();
    public DbSet<RolePermissao> RolePermissoes => Set<RolePermissao>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Plano> Planos => Set<Plano>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Box> Boxes => Set<Box>();
    public DbSet<Layout> Layouts => Set<Layout>();
    public DbSet<TenantLayoutAtivo> TenantLayoutsAtivos => Set<TenantLayoutAtivo>();
    public DbSet<Grupo> Grupos => Set<Grupo>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<PedidoEvento> PedidoEventos => Set<PedidoEvento>();
    public DbSet<ArquivoImportacao> ArquivoImportacoes => Set<ArquivoImportacao>();
    public DbSet<ArquivoImportacaoErro> ArquivoImportacaoErros => Set<ArquivoImportacaoErro>();
    public DbSet<UsoMensal> UsoMensal => Set<UsoMensal>();
    public DbSet<RelatorioJob> RelatorioJobs => Set<RelatorioJob>();
    public DbSet<Assinatura> Assinaturas => Set<Assinatura>();
    public DbSet<Fatura> Faturas => Set<Fatura>();
    public DbSet<StripeEvento> StripeEventos => Set<StripeEvento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SisConfDbContext).Assembly);

        AplicarFiltroDeTenant(modelBuilder);
        ConfigurarSnakeCase(modelBuilder);
    }

    /// <summary>
    /// Aplica HasQueryFilter automaticamente em toda entidade que implementa IPertenceTenant,
    /// referenciando this.TenantIdFiltro (não closure) — o EF parametriza a query por request.
    /// </summary>
    private void AplicarFiltroDeTenant(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(IPertenceTenant).IsAssignableFrom(entityType.ClrType)) continue;

            var metodo = typeof(SisConfDbContext)
                .GetMethod(nameof(MontarFiltroTenant),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .MakeGenericMethod(entityType.ClrType);

            var filtro = (LambdaExpression)metodo.Invoke(this, null)!;
            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filtro);
        }
    }

    private LambdaExpression MontarFiltroTenant<TEntity>() where TEntity : class, IPertenceTenant
    {
        // e => TenantIdFiltro == Guid.Empty || e.TenantId == TenantIdFiltro
        Expression<Func<TEntity, bool>> filtro =
            e => TenantIdFiltro == Guid.Empty || e.TenantId == TenantIdFiltro;
        return filtro;
    }

    private static void ConfigurarSnakeCase(ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnake(entity.GetTableName()!));

            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnake(property.GetColumnName()));

            foreach (var key in entity.GetKeys())
                key.SetName(ToSnake(key.GetName()!));

            foreach (var fk in entity.GetForeignKeys())
                fk.SetConstraintName(ToSnake(fk.GetConstraintName()!));

            foreach (var idx in entity.GetIndexes())
                idx.SetDatabaseName(ToSnake(idx.GetDatabaseName()!));
        }
    }

    private static string ToSnake(string nome)
    {
        if (string.IsNullOrEmpty(nome)) return nome;
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < nome.Length; i++)
        {
            var c = nome[i];
            if (char.IsUpper(c) && i > 0 && !char.IsUpper(nome[i - 1]))
                sb.Append('_');
            sb.Append(char.ToLowerInvariant(c));
        }
        return sb.ToString();
    }
}
