using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using SisConf.Application.Common.Storage;
using SisConf.Application.Relatorios;
using SisConf.Domain.Relatorios;
using SisConf.Infrastructure.Persistencia;
using SisConf.Infrastructure.Relatorios.Pdfs;

namespace SisConf.Infrastructure.Relatorios;

public class RelatorioProcessor : BackgroundService
{
    private readonly IRelatorioQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RelatorioProcessor> _log;

    public RelatorioProcessor(IRelatorioQueue queue, IServiceScopeFactory scopeFactory, ILogger<RelatorioProcessor> log)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("RelatorioProcessor iniciado.");
        await foreach (var cmd in _queue.ConsumirAsync(stoppingToken))
        {
            try { await ProcessarAsync(cmd, stoppingToken); }
            catch (Exception ex)
            {
                _log.LogError(ex, "Falha ao gerar relatório {JobId}", cmd.JobId);
                await MarcarErroAsync(cmd.JobId, ex.Message, stoppingToken);
            }
        }
    }

    private async Task ProcessarAsync(RelatorioCommand cmd, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
        var storage = scope.ServiceProvider.GetRequiredService<IFileStorage>();

        var job = await db.RelatorioJobs.IgnoreQueryFilters().FirstOrDefaultAsync(j => j.Id == cmd.JobId, ct);
        if (job is null) { _log.LogWarning("RelatorioJob {Id} não encontrado.", cmd.JobId); return; }
        if (job.Status != RelatorioJobStatus.Pendente) return;

        job.Iniciar();
        await db.SaveChangesAsync(ct);

        var parametros = JsonDocument.Parse(string.IsNullOrEmpty(job.ParametrosJson) ? "{}" : job.ParametrosJson).RootElement;

        byte[] bytes;
        string contentType;
        string ext;

        switch (job.Tipo)
        {
            case "resumido":
                (bytes, contentType, ext) = await GerarResumidoAsync(db, cmd.TenantId, parametros, ct);
                break;
            default:
                job.Falhar($"Tipo de relatório '{job.Tipo}' não suportado.");
                await db.SaveChangesAsync(ct);
                return;
        }

        using var ms = new MemoryStream(bytes);
        var nome = $"{job.Tipo}_{DateTime.UtcNow:yyyyMMddHHmmss}.{ext}";
        var key = await storage.SalvarAsync(cmd.TenantId, job.Id, nome, ms, ct);

        job.Concluir(key);
        await db.SaveChangesAsync(ct);

        _ = contentType; // content_type fica implícito na extensão
    }

    private static async Task<(byte[], string, string)> GerarResumidoAsync(
        SisConfDbContext db, Guid tenantId, JsonElement parametros, CancellationToken ct)
    {
        DateTime? de = null, ate = null;
        if (parametros.TryGetProperty("de", out var deEl) && deEl.ValueKind == JsonValueKind.String)
            de = deEl.GetDateTime();
        if (parametros.TryGetProperty("ate", out var ateEl) && ateEl.ValueKind == JsonValueKind.String)
            ate = ateEl.GetDateTime();

        var q = db.Pedidos.IgnoreQueryFilters().Where(p => p.TenantId == tenantId);
        if (de.HasValue) q = q.Where(p => p.CriadoEm >= de.Value);
        if (ate.HasValue) q = q.Where(p => p.CriadoEm <= ate.Value);

        var contagens = await q
            .GroupBy(p => p.StatusId)
            .Select(g => new { StatusId = g.Key, Qtde = g.Count() })
            .ToListAsync(ct);

        var statusIds = contagens.Select(c => c.StatusId).ToList();
        var statusMap = await db.Statuses.IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId && statusIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => new { s.Nome, s.CorHex }, ct);

        var dados = contagens
            .Select(c => statusMap.TryGetValue(c.StatusId, out var s)
                ? new LinhaResumo(s.Nome, s.CorHex, c.Qtde)
                : new LinhaResumo("(removido)", "#94A3B8", c.Qtde))
            .OrderBy(l => l.StatusNome)
            .ToList();

        var tenantNome = await db.Tenants.IgnoreQueryFilters()
            .Where(t => t.Id == tenantId).Select(t => t.RazaoSocial).FirstOrDefaultAsync(ct) ?? "";

        var periodo = (de, ate) switch
        {
            (null, null) => "Todo o período",
            (var d, null) => $"De {d:dd/MM/yyyy}",
            (null, var a) => $"Até {a:dd/MM/yyyy}",
            ({ } d, { } a) => $"De {d:dd/MM/yyyy} a {a:dd/MM/yyyy}"
        };

        var doc = new RelatorioResumidoPdf(tenantNome, periodo, dados);
        return (doc.GeneratePdf(), "application/pdf", "pdf");
    }

    private async Task MarcarErroAsync(Guid jobId, string msg, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
            var job = await db.RelatorioJobs.IgnoreQueryFilters().FirstOrDefaultAsync(j => j.Id == jobId, ct);
            if (job is null) return;
            job.Falhar(msg);
            await db.SaveChangesAsync(ct);
        }
        catch { /* nada a fazer */ }
    }
}
