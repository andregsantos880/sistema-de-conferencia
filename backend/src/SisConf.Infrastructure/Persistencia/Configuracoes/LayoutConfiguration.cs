using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Tenants;
using SisConf.Domain.Identidade;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class LayoutConfiguration : IEntityTypeConfiguration<Layout>
{
    public void Configure(EntityTypeBuilder<Layout> b)
    {
        b.ToTable("layout");
        b.HasKey(x => x.Id);

        b.Property(x => x.Nome).IsRequired().HasMaxLength(80);
        b.Property(x => x.ParserKey).IsRequired().HasMaxLength(80);
        b.HasIndex(x => x.ParserKey).IsUnique();
        b.Property(x => x.Descricao).HasMaxLength(500);
        b.Property(x => x.ExemploArquivoUrl).HasMaxLength(500);
        b.Property(x => x.Ativo).IsRequired();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}

public class TenantLayoutAtivoConfiguration : IEntityTypeConfiguration<TenantLayoutAtivo>
{
    public void Configure(EntityTypeBuilder<TenantLayoutAtivo> b)
    {
        b.ToTable("tenant_layout_ativo");
        b.HasKey(x => new { x.TenantId, x.LayoutId });

        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Layout>().WithMany().HasForeignKey(x => x.LayoutId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.AtivadoPorUsuarioId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.AtivadoEm).HasDefaultValueSql("now()");
    }
}
