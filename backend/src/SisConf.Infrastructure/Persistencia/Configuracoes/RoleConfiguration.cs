using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Identidade;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> b)
    {
        b.ToTable("role");
        b.HasKey(x => x.Id);
        b.Property(x => x.TenantId);
        b.Property(x => x.Nome).IsRequired().HasMaxLength(80);
        b.Property(x => x.Descricao).HasMaxLength(255);
        b.Property(x => x.EhSistema).IsRequired();
        b.HasIndex(x => new { x.TenantId, x.Nome }).IsUnique();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasMany(x => x.Permissoes).WithOne().HasForeignKey(p => p.RoleId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class PermissaoConfiguration : IEntityTypeConfiguration<Permissao>
{
    public void Configure(EntityTypeBuilder<Permissao> b)
    {
        b.ToTable("permissao");
        b.HasKey(x => x.Codigo);
        b.Property(x => x.Codigo).HasMaxLength(80);
        b.Property(x => x.Modulo).IsRequired().HasMaxLength(40);
        b.Property(x => x.Acao).IsRequired().HasMaxLength(40);
        b.Property(x => x.Descricao).IsRequired().HasMaxLength(255);
    }
}

public class RolePermissaoConfiguration : IEntityTypeConfiguration<RolePermissao>
{
    public void Configure(EntityTypeBuilder<RolePermissao> b)
    {
        b.ToTable("role_permissao");
        b.HasKey(x => new { x.RoleId, x.PermissaoCodigo });
        b.Property(x => x.PermissaoCodigo).HasMaxLength(80);
        b.HasOne<Permissao>().WithMany().HasForeignKey(x => x.PermissaoCodigo).OnDelete(DeleteBehavior.Restrict);
    }
}
