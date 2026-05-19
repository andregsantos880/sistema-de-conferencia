using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> b)
    {
        b.ToTable("usuario");
        b.HasKey(x => x.Id);
        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.Email).IsRequired().HasMaxLength(255);
        b.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
        b.Property(x => x.SenhaHash).IsRequired().HasMaxLength(500);
        b.Property(x => x.Nome).IsRequired().HasMaxLength(255);
        b.Property(x => x.EhOwner).IsRequired();
        b.Property(x => x.Ativo).IsRequired();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasMany(x => x.Roles).WithOne().HasForeignKey(r => r.UsuarioId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class UsuarioRoleConfiguration : IEntityTypeConfiguration<UsuarioRole>
{
    public void Configure(EntityTypeBuilder<UsuarioRole> b)
    {
        b.ToTable("usuario_role");
        b.HasKey(x => new { x.UsuarioId, x.RoleId });
        b.HasOne<Role>().WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
    }
}
