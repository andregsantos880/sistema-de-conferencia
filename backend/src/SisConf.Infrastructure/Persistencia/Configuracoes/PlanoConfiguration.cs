using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Faturamento;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class PlanoConfiguration : IEntityTypeConfiguration<Plano>
{
    public void Configure(EntityTypeBuilder<Plano> b)
    {
        b.ToTable("plano");
        b.HasKey(x => x.Id);
        b.Property(x => x.Nome).IsRequired().HasMaxLength(80);
        b.Property(x => x.Codigo).IsRequired().HasMaxLength(40);
        b.HasIndex(x => x.Codigo).IsUnique();
        b.Property(x => x.PrecoMensalCentavos).IsRequired();
        b.Property(x => x.LimiteImportacoesMes).IsRequired();
        b.Property(x => x.StripePriceId).HasMaxLength(80);
        b.Property(x => x.RecursosJson).HasColumnType("jsonb").HasDefaultValue("{}");
        b.Property(x => x.Ativo).IsRequired();
        b.Property(x => x.Ordem).IsRequired();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}
