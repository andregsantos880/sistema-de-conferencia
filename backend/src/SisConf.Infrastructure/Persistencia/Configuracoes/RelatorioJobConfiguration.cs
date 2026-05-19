using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Identidade;
using SisConf.Domain.Relatorios;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class RelatorioJobConfiguration : IEntityTypeConfiguration<RelatorioJob>
{
    public void Configure(EntityTypeBuilder<RelatorioJob> b)
    {
        b.ToTable("relatorio_job");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.Tipo).IsRequired().HasMaxLength(40);
        b.Property(x => x.ParametrosJson).HasColumnType("jsonb");
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.StorageKey).HasMaxLength(500);
        b.Property(x => x.MensagemErro).HasMaxLength(2000);
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.CriadoEm });
    }
}
