using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Storage;
using SisConf.Application.Common.Tenants;
using SisConf.Application.Importacao;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Importacao;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record ImportacaoDto(
    Guid Id, string NomeArquivo, Guid LayoutId, string LayoutNome,
    string Status, int? TotalLinhas, int LinhasOk, int LinhasErro,
    DateTime? IniciadoEm, DateTime? FinalizadoEm, DateTime CriadoEm,
    Guid UsuarioId, string? MensagemErro);

public record ImportacaoErroDto(int NumeroLinha, string? Conteudo, string Mensagem);

public static class ImportacaoEndpoints
{
    private const long MaxBytesUpload = 50 * 1024 * 1024; // 50 MB

    public static IEndpointRouteBuilder MapImportacaoEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/importacoes").WithTags("Importacao").RequireAuthorization();

        grupo.MapPost("/", [HasPermission(Permissoes.Importacao.Upload)]
            async (HttpContext http, SisConfDbContext db, IFileStorage storage,
                IImportacaoQueue queue, ITenantContext ctx, CancellationToken ct) =>
        {
            if (!http.Request.HasFormContentType)
                return Results.BadRequest(new { erro = "Requisição deve ser multipart/form-data.", codigo = "form_invalido" });

            var form = await http.Request.ReadFormAsync(ct);
            var arquivo = form.Files["arquivo"];
            if (arquivo is null || arquivo.Length == 0)
                return Results.BadRequest(new { erro = "Campo 'arquivo' obrigatório.", codigo = "arquivo_ausente" });
            if (arquivo.Length > MaxBytesUpload)
                return Results.BadRequest(new { erro = "Arquivo excede 50MB.", codigo = "arquivo_grande" });

            if (!Guid.TryParse(form["layoutId"], out var layoutId))
                return Results.BadRequest(new { erro = "Campo 'layoutId' inválido.", codigo = "layout_invalido" });

            var ativo = await db.TenantLayoutsAtivos
                .AnyAsync(t => t.TenantId == ctx.TenantId && t.LayoutId == layoutId, ct);
            if (!ativo)
                return Results.BadRequest(new { erro = "Layout não está ativado para este tenant.",
                    codigo = "layout_nao_ativo" });

            // Enforcement de limite: lê plano do tenant
            int limite = await db.Tenants
                .Where(t => t.Id == ctx.TenantId && t.PlanoId != null)
                .Join(db.Planos, t => t.PlanoId, p => p.Id, (t, p) => p.LimiteImportacoesMes)
                .FirstOrDefaultAsync(ct);

            var anoMes = UsoMensal.AnoMesAtual();
            var usoAtual = await db.UsoMensal
                .Where(u => u.AnoMes == anoMes)
                .Select(u => u.ImportacoesCount)
                .FirstOrDefaultAsync(ct);

            if (limite != -1 && usoAtual >= limite)
                return Results.Json(new
                {
                    erro = $"Limite de {limite} importações/mês atingido. Faça upgrade do plano.",
                    codigo = "limite_plano_excedido",
                    limite, uso = usoAtual
                }, statusCode: StatusCodes.Status429TooManyRequests);

            // Cria o registro (gera Id) e usa o Id como pasta no storage
            var imp = ArquivoImportacao.Criar(ctx.TenantId, layoutId, ctx.UsuarioId,
                arquivo.FileName, storageKey: "", tamanhoBytes: arquivo.Length);

            await using var stream = arquivo.OpenReadStream();
            var key = await storage.SalvarAsync(ctx.TenantId, imp.Id, arquivo.FileName, stream, ct);
            // re-criar com storageKey final (Entidade não expõe setter)
            imp = ArquivoImportacao.CriarComId(imp.Id, ctx.TenantId, layoutId, ctx.UsuarioId,
                arquivo.FileName, key, arquivo.Length);

            await using var tx = await db.Database.BeginTransactionAsync(ct);
            db.ArquivoImportacoes.Add(imp);

            // Increment atômico em uso_mensal (Postgres UPSERT)
            var afetadas = await db.UsoMensal
                .Where(u => u.AnoMes == anoMes)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(u => u.ImportacoesCount, u => u.ImportacoesCount + 1)
                    .SetProperty(u => u.AtualizadoEm, DateTime.UtcNow), ct);

            if (afetadas == 0)
            {
                db.UsoMensal.Add(UsoMensal.Novo(ctx.TenantId, anoMes));
                await db.SaveChangesAsync(ct);
                await db.UsoMensal.Where(u => u.AnoMes == anoMes)
                    .ExecuteUpdateAsync(s => s.SetProperty(u => u.ImportacoesCount, 1), ct);
            }
            else
            {
                await db.SaveChangesAsync(ct);
            }
            await tx.CommitAsync(ct);

            await queue.EnqueueAsync(new ImportacaoCommand(imp.Id, ctx.TenantId, ctx.UsuarioId), ct);
            return Results.Accepted(value: new { id = imp.Id, status = "enfileirado" });
        }).WithName("CriarImportacao").DisableAntiforgery();

        grupo.MapGet("/", [HasPermission(Permissoes.Importacao.Visualizar)]
            async (SisConfDbContext db, int pagina = 1, int tamanho = 50, CancellationToken ct = default) =>
        {
            tamanho = Math.Clamp(tamanho, 1, 200);
            pagina = Math.Max(pagina, 1);

            var q = db.ArquivoImportacoes.AsQueryable();
            var total = await q.CountAsync(ct);
            var itens = await q
                .OrderByDescending(a => a.CriadoEm)
                .Skip((pagina - 1) * tamanho).Take(tamanho)
                .Select(a => new ImportacaoDto(
                    a.Id, a.NomeArquivo, a.LayoutId,
                    db.Layouts.IgnoreQueryFilters().Where(l => l.Id == a.LayoutId).Select(l => l.Nome).FirstOrDefault() ?? "",
                    a.Status.ToString().ToLowerInvariant(),
                    a.TotalLinhas, a.LinhasOk, a.LinhasErro,
                    a.IniciadoEm, a.FinalizadoEm, a.CriadoEm,
                    a.UsuarioId, a.MensagemErro))
                .ToListAsync(ct);
            return Results.Ok(new { total, pagina, tamanho, itens });
        }).WithName("ListarImportacoes");

        grupo.MapGet("/{id:guid}", [HasPermission(Permissoes.Importacao.Visualizar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var a = await db.ArquivoImportacoes.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (a is null) return Results.NotFound();
            var layoutNome = await db.Layouts.IgnoreQueryFilters()
                .Where(l => l.Id == a.LayoutId).Select(l => l.Nome).FirstOrDefaultAsync(ct) ?? "";
            return Results.Ok(new ImportacaoDto(
                a.Id, a.NomeArquivo, a.LayoutId, layoutNome,
                a.Status.ToString().ToLowerInvariant(),
                a.TotalLinhas, a.LinhasOk, a.LinhasErro,
                a.IniciadoEm, a.FinalizadoEm, a.CriadoEm,
                a.UsuarioId, a.MensagemErro));
        }).WithName("ObterImportacao");

        grupo.MapGet("/{id:guid}/erros", [HasPermission(Permissoes.Importacao.Visualizar)]
            async (Guid id, SisConfDbContext db, int pagina = 1, int tamanho = 100, CancellationToken ct = default) =>
        {
            tamanho = Math.Clamp(tamanho, 1, 500);
            pagina = Math.Max(pagina, 1);

            var existe = await db.ArquivoImportacoes.AnyAsync(a => a.Id == id, ct);
            if (!existe) return Results.NotFound();

            var q = db.ArquivoImportacaoErros.Where(e => e.ArquivoImportacaoId == id);
            var total = await q.CountAsync(ct);
            var itens = await q
                .OrderBy(e => e.NumeroLinha)
                .Skip((pagina - 1) * tamanho).Take(tamanho)
                .Select(e => new ImportacaoErroDto(e.NumeroLinha, e.Conteudo, e.Mensagem))
                .ToListAsync(ct);
            return Results.Ok(new { total, pagina, tamanho, itens });
        }).WithName("ListarErrosImportacao");

        grupo.MapPost("/{id:guid}/cancelar", [HasPermission(Permissoes.Importacao.Cancelar)]
            async (Guid id, SisConfDbContext db, CancellationToken ct) =>
        {
            var a = await db.ArquivoImportacoes.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (a is null) return Results.NotFound();
            try { a.Cancelar(); }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { erro = ex.Message, codigo = "estado_invalido" });
            }
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("CancelarImportacao");

        return app;
    }
}
