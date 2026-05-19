using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Storage;
using SisConf.Application.Common.Tenants;
using SisConf.Application.Relatorios;
using SisConf.Domain.Relatorios;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record GerarRelatorioReq(JsonElement? Parametros);

public record RelatorioJobDto(
    Guid Id, string Tipo, string Status, string? MensagemErro,
    DateTime CriadoEm, DateTime? IniciadoEm, DateTime? FinalizadoEm,
    bool TemDownload);

public static class RelatorioEndpoints
{
    private static readonly HashSet<string> TiposSuportados = new() { "resumido" };

    public static IEndpointRouteBuilder MapRelatorioEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/relatorios").WithTags("Relatorios").RequireAuthorization();

        grupo.MapPost("/{tipo}/gerar", [HasPermission(Permissoes.Relatorios.Gerar)]
            async (string tipo, GerarRelatorioReq req, SisConfDbContext db,
                IRelatorioQueue queue, ITenantContext ctx, CancellationToken ct) =>
        {
            if (!TiposSuportados.Contains(tipo))
                return Results.BadRequest(new { erro = $"Tipo '{tipo}' não suportado.", suportados = TiposSuportados });

            var paramsJson = req.Parametros?.GetRawText() ?? "{}";
            var job = RelatorioJob.Criar(ctx.TenantId, ctx.UsuarioId, tipo, paramsJson);
            db.RelatorioJobs.Add(job);
            await db.SaveChangesAsync(ct);

            await queue.EnqueueAsync(new RelatorioCommand(job.Id, ctx.TenantId, ctx.UsuarioId), ct);
            return Results.Accepted(value: new { jobId = job.Id });
        }).WithName("GerarRelatorio");

        grupo.MapGet("/", [HasPermission(Permissoes.Relatorios.Gerar)]
            async (SisConfDbContext db, int pagina = 1, int tamanho = 30, CancellationToken ct = default) =>
        {
            tamanho = Math.Clamp(tamanho, 1, 100);
            pagina = Math.Max(pagina, 1);
            var q = db.RelatorioJobs.AsQueryable();
            var total = await q.CountAsync(ct);
            var itens = await q
                .OrderByDescending(j => j.CriadoEm)
                .Skip((pagina - 1) * tamanho).Take(tamanho)
                .Select(j => new RelatorioJobDto(
                    j.Id, j.Tipo, j.Status.ToString().ToLowerInvariant(), j.MensagemErro,
                    j.CriadoEm, j.IniciadoEm, j.FinalizadoEm,
                    j.StorageKey != null))
                .ToListAsync(ct);
            return Results.Ok(new { total, pagina, tamanho, itens });
        }).WithName("ListarRelatorios");

        grupo.MapGet("/{id:guid}", [HasPermission(Permissoes.Relatorios.Gerar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var j = await db.RelatorioJobs.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (j is null) return Results.NotFound();
            return Results.Ok(new RelatorioJobDto(
                j.Id, j.Tipo, j.Status.ToString().ToLowerInvariant(), j.MensagemErro,
                j.CriadoEm, j.IniciadoEm, j.FinalizadoEm, j.StorageKey != null));
        }).WithName("ObterRelatorio");

        grupo.MapGet("/{id:guid}/download", [HasPermission(Permissoes.Relatorios.Gerar)]
            async (Guid id, SisConfDbContext db, IFileStorage storage, CancellationToken ct) =>
        {
            var j = await db.RelatorioJobs.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (j is null) return Results.NotFound();
            if (j.Status != RelatorioJobStatus.Concluido || j.StorageKey is null)
                return Results.BadRequest(new { erro = "Relatório ainda não finalizado.", status = j.Status.ToString().ToLowerInvariant() });

            await using var src = await storage.AbrirAsync(j.StorageKey, ct);
            using var ms = new MemoryStream();
            await src.CopyToAsync(ms, ct);
            var nomeArquivo = Path.GetFileName(j.StorageKey);
            var contentType = nomeArquivo.EndsWith(".pdf") ? "application/pdf" : "application/octet-stream";
            return Results.File(ms.ToArray(), contentType, nomeArquivo);
        }).WithName("DownloadRelatorio");

        return app;
    }
}
