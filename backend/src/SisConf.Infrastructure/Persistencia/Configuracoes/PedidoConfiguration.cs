using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Conferencia;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> b)
    {
        b.ToTable("pedido");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.HasOne<Layout>().WithMany().HasForeignKey(x => x.LayoutId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Status>().WithMany().HasForeignKey(x => x.StatusId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Box>().WithMany().HasForeignKey(x => x.BoxId).OnDelete(DeleteBehavior.SetNull);
        b.HasOne<Grupo>().WithMany().HasForeignKey(x => x.GrupoId).OnDelete(DeleteBehavior.SetNull);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.LockUsuarioId).OnDelete(DeleteBehavior.SetNull);

        b.Property(x => x.Etiqueta).IsRequired().HasMaxLength(50);
        b.Property(x => x.OrdemCompra).HasMaxLength(50);
        b.Property(x => x.Cliente).HasMaxLength(200);
        b.Property(x => x.PeCliente).HasMaxLength(50);
        b.Property(x => x.Produto).HasMaxLength(50);
        b.Property(x => x.Descricao).HasMaxLength(500);
        b.Property(x => x.Volume).HasMaxLength(20);

        b.Property(x => x.LockSessionId).HasMaxLength(80);

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.Etiqueta });
        b.HasIndex(x => new { x.TenantId, x.StatusId, x.BoxId });
        b.HasIndex(x => new { x.TenantId, x.ArquivoImportacaoId });
        b.HasIndex(x => new { x.TenantId, x.GrupoId });
    }
}

public class PedidoEventoConfiguration : IEntityTypeConfiguration<PedidoEvento>
{
    public void Configure(EntityTypeBuilder<PedidoEvento> b)
    {
        b.ToTable("pedido_evento");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.HasOne<Pedido>().WithMany().HasForeignKey(x => x.PedidoId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Status>().WithMany().HasForeignKey(x => x.StatusNovoId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.ClientEventId).IsRequired();
        b.HasIndex(x => x.ClientEventId).IsUnique();    // idempotência

        b.Property(x => x.Origem).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.MetadataJson).HasColumnType("jsonb");
        b.Property(x => x.OcorreuEm).IsRequired();
        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.OcorreuEm });
        b.HasIndex(x => new { x.TenantId, x.PedidoId, x.OcorreuEm });
        b.HasIndex(x => new { x.TenantId, x.UsuarioId, x.OcorreuEm });
    }
}
