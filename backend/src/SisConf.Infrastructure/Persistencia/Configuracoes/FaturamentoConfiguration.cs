using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class AssinaturaConfiguration : IEntityTypeConfiguration<Assinatura>
{
    public void Configure(EntityTypeBuilder<Assinatura> b)
    {
        b.ToTable("assinatura");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasIndex(x => x.TenantId).IsUnique();   // 1 assinatura por tenant
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.PlanoId).IsRequired();
        b.HasOne<Plano>().WithMany().HasForeignKey(x => x.PlanoId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.StripeSubscriptionId).HasMaxLength(80);
        b.HasIndex(x => x.StripeSubscriptionId).IsUnique().HasFilter("stripe_subscription_id IS NOT NULL");

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}

public class FaturaConfiguration : IEntityTypeConfiguration<Fatura>
{
    public void Configure(EntityTypeBuilder<Fatura> b)
    {
        b.ToTable("fatura");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Assinatura>().WithMany().HasForeignKey(x => x.AssinaturaId).OnDelete(DeleteBehavior.SetNull);

        b.Property(x => x.StripeInvoiceId).IsRequired().HasMaxLength(80);
        b.HasIndex(x => x.StripeInvoiceId).IsUnique();
        b.Property(x => x.Numero).HasMaxLength(40);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.PaymentMethod).HasMaxLength(20);
        b.Property(x => x.LinkPagamento).HasMaxLength(500);
        b.Property(x => x.LinkPdf).HasMaxLength(500);

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
        b.HasIndex(x => new { x.TenantId, x.Vencimento });
    }
}

public class StripeEventoConfiguration : IEntityTypeConfiguration<StripeEvento>
{
    public void Configure(EntityTypeBuilder<StripeEvento> b)
    {
        b.ToTable("stripe_evento");
        b.HasKey(x => x.Id);

        b.Property(x => x.Tipo).IsRequired().HasMaxLength(80);
        b.Property(x => x.StripeEventId).IsRequired().HasMaxLength(80);
        b.HasIndex(x => x.StripeEventId).IsUnique();
        b.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();
        b.Property(x => x.ErroProcessamento).HasMaxLength(2000);
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}
