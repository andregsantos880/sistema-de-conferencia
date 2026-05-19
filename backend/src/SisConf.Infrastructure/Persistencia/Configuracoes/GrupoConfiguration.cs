using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class GrupoConfiguration : IEntityTypeConfiguration<Grupo>
{
    public void Configure(EntityTypeBuilder<Grupo> b)
    {
        b.ToTable("grupo");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.Nome).IsRequired().HasMaxLength(100);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.CriadoPorUsuarioId).OnDelete(DeleteBehavior.Restrict);
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.Nome });
    }
}
