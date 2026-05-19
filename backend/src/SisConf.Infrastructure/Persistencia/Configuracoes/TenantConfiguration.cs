using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> b)
    {
        b.ToTable("tenant");
        b.HasKey(x => x.Id);
        b.Property(x => x.Slug).IsRequired().HasMaxLength(80);
        b.HasIndex(x => x.Slug).IsUnique();
        b.Property(x => x.RazaoSocial).IsRequired().HasMaxLength(255);
        b.Property(x => x.Documento).IsRequired().HasMaxLength(20);
        b.Property(x => x.EmailAdmin).IsRequired().HasMaxLength(255);
        b.Property(x => x.Telefone).HasMaxLength(30);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.StripeCustomerId).HasMaxLength(80);
        b.HasIndex(x => x.StripeCustomerId).IsUnique().HasFilter("stripe_customer_id IS NOT NULL");
        b.HasOne<SisConf.Domain.Faturamento.Plano>().WithMany().HasForeignKey(x => x.PlanoId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Restrict);
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}
