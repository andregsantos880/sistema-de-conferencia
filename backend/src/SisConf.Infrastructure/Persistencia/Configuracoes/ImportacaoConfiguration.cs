using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SisConf.Domain.Cadastros;
using SisConf.Domain.Identidade;
using SisConf.Domain.Importacao;
using SisConf.Domain.Tenants;

namespace SisConf.Infrastructure.Persistencia.Configuracoes;

public class ArquivoImportacaoConfiguration : IEntityTypeConfiguration<ArquivoImportacao>
{
    public void Configure(EntityTypeBuilder<ArquivoImportacao> b)
    {
        b.ToTable("arquivo_importacao");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.HasOne<Layout>().WithMany().HasForeignKey(x => x.LayoutId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);

        b.Property(x => x.NomeArquivo).IsRequired().HasMaxLength(255);
        b.Property(x => x.StorageKey).IsRequired().HasMaxLength(500);
        b.Property(x => x.StorageTamanhoBytes).IsRequired();
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.MensagemErro).HasMaxLength(2000);

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.TenantId, x.Status });
        b.HasIndex(x => new { x.TenantId, x.CriadoEm });
    }
}

public class ArquivoImportacaoErroConfiguration : IEntityTypeConfiguration<ArquivoImportacaoErro>
{
    public void Configure(EntityTypeBuilder<ArquivoImportacaoErro> b)
    {
        b.ToTable("arquivo_importacao_erro");
        b.HasKey(x => x.Id);

        b.Property(x => x.TenantId).IsRequired();
        b.HasOne<Tenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

        b.HasOne<ArquivoImportacao>().WithMany().HasForeignKey(x => x.ArquivoImportacaoId).OnDelete(DeleteBehavior.Cascade);

        b.Property(x => x.NumeroLinha).IsRequired();
        b.Property(x => x.Conteudo).HasMaxLength(4000);
        b.Property(x => x.Mensagem).IsRequired().HasMaxLength(500);

        b.Property(x => x.CriadoEm).HasDefaultValueSql("now()");
        b.Property(x => x.AtualizadoEm).HasDefaultValueSql("now()");

        b.HasIndex(x => new { x.ArquivoImportacaoId, x.NumeroLinha });
    }
}
