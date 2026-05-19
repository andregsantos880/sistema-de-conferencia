using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> b)
    {
        b.ToTable("refresh_token");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.UsuarioId).IsRequired();
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.TokenHash).IsRequired().HasMaxLength(120);
        b.HasIndex(x => x.TokenHash).IsUnique();

        b.Property(x => x.ExpiraEm).IsRequired();
        b.Property(x => x.IpOrigem).HasMaxLength(45);
        b.Property(x => x.UserAgent).HasMaxLength(500);

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => x.UsuarioId);
    }
}
