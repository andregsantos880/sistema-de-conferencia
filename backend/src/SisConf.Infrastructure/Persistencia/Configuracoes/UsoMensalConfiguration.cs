using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class UsoMensalConfiguration : IEntityTypeConfiguration<UsoMensal>
{
    public void Configure(EntityTypeBuilder<UsoMensal> b)
    {
        b.ToTable("uso_mensal");
        b.HasKey(x => new { x.TenantId, x.AnoMes });

        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.AnoMes).IsRequired();
        b.Property(x => x.ImportacoesCount).IsRequired();
        b.Property(x => x.PedidosProcessadosCount).IsRequired();
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");
    }
}
