using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class BoxConfiguration : IEntityTypeConfiguration<Box>
{
    public void Configure(EntityTypeBuilder<Box> b)
    {
        b.ToTable("box");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.Codigo).IsRequired().HasMaxLength(40);
        b.Property(x => x.Nome).IsRequired().HasMaxLength(80);
        b.Property(x => x.TtsTexto).HasMaxLength(200);
        b.Property(x => x.Ativo).IsRequired();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.Codigo }).IsUnique();
    }
}
