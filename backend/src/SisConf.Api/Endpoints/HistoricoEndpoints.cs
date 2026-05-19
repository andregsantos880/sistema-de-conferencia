using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record EventoDto(
    Guid Id, Guid PedidoId, string Etiqueta,
    Guid? StatusAnteriorId, string? StatusAnteriorNome, string? StatusAnteriorCor,
    Guid StatusNovoId, string StatusNovoNome, string StatusNovoCor,
    Guid UsuarioId, string UsuarioNome,
    DateTime OcorreuEm, string Origem, Guid ClientEventId);

public static class HistoricoEndpoints
{
    public static IEndpointRouteBuilder MapHistoricoEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/eventos").WithTags("Historico").RequireAuthorization();

        grupo.MapGet("/", [HasPermission(Permissoes.Historico.Visualizar)]
            async (SisConfDbContext db,
                Guid? pedidoId, Guid? usuarioId, Guid? statusId,
                DateTime? de, DateTime? ate, string? origem, string? etiqueta,
                int pagina = 1, int tamanho = 100,
                CancellationToken ct = default) =>
        {
            tamanho = Math.Clamp(tamanho, 1, 500);
            pagina = Math.Max(pagina, 1);

            var q = db.PedidoEventos.AsQueryable();
            if (pedidoId.HasValue) q = q.Where(e => e.PedidoId == pedidoId.Value);
            if (usuarioId.HasValue) q = q.Where(e => e.UsuarioId == usuarioId.Value);
            if (statusId.HasValue) q = q.Where(e => e.StatusNovoId == statusId.Value);
            if (de.HasValue) q = q.Where(e => e.OcorreuEm >= de.Value);
            if (ate.HasValue) q = q.Where(e => e.OcorreuEm <= ate.Value);
            if (!string.IsNullOrWhiteSpace(origem) && Enum.TryParse<SisConf.Domain.Conferencia.OrigemEvento>(origem, true, out var or))
                q = q.Where(e => e.Origem == or);

            // Filtro por etiqueta exige join com pedido
            if (!string.IsNullOrWhiteSpace(etiqueta))
            {
                var pIds = await db.Pedidos.Where(p => p.Etiqueta.Contains(etiqueta!)).Select(p => p.Id).ToListAsync(ct);
                q = q.Where(e => pIds.Contains(e.PedidoId));
            }

            var total = await q.CountAsync(ct);

            var itens = await q
                .OrderByDescending(e => e.OcorreuEm)
                .Skip((pagina - 1) * tamanho).Take(tamanho)
                .Select(e => new EventoDto(
                    e.Id, e.PedidoId,
                    db.Pedidos.Where(p => p.Id == e.PedidoId).Select(p => p.Etiqueta).FirstOrDefault() ?? "",
                    e.StatusAnteriorId,
                    e.StatusAnteriorId == null ? null : db.Statuses.Where(s => s.Id == e.StatusAnteriorId).Select(s => s.Nome).FirstOrDefault(),
                    e.StatusAnteriorId == null ? null : db.Statuses.Where(s => s.Id == e.StatusAnteriorId).Select(s => s.CorHex).FirstOrDefault(),
                    e.StatusNovoId,
                    db.Statuses.Where(s => s.Id == e.StatusNovoId).Select(s => s.Nome).FirstOrDefault() ?? "",
                    db.Statuses.Where(s => s.Id == e.StatusNovoId).Select(s => s.CorHex).FirstOrDefault() ?? "",
                    e.UsuarioId,
                    db.Usuarios.Where(u => u.Id == e.UsuarioId).Select(u => u.Nome).FirstOrDefault() ?? "",
                    e.OcorreuEm, e.Origem.ToString(), e.ClientEventId))
                .ToListAsync(ct);

            return Results.Ok(new { total, pagina, tamanho, itens });
        }).WithName("ListarEventos");

        grupo.MapGet("/exportar.xlsx", [HasPermission(Permissoes.Historico.Exportar)]
            async (SisConfDbContext db,
                Guid? pedidoId, Guid? usuarioId, Guid? statusId,
                DateTime? de, DateTime? ate, string? origem, string? etiqueta,
                CancellationToken ct) =>
        {
            // Reutiliza o mesmo filtro do GET (limitado a 10k linhas pra evitar OOM)
            var q = db.PedidoEventos.AsQueryable();
            if (pedidoId.HasValue) q = q.Where(e => e.PedidoId == pedidoId.Value);
            if (usuarioId.HasValue) q = q.Where(e => e.UsuarioId == usuarioId.Value);
            if (statusId.HasValue) q = q.Where(e => e.StatusNovoId == statusId.Value);
            if (de.HasValue) q = q.Where(e => e.OcorreuEm >= de.Value);
            if (ate.HasValue) q = q.Where(e => e.OcorreuEm <= ate.Value);
            if (!string.IsNullOrWhiteSpace(origem) && Enum.TryParse<SisConf.Domain.Conferencia.OrigemEvento>(origem, true, out var or))
                q = q.Where(e => e.Origem == or);
            if (!string.IsNullOrWhiteSpace(etiqueta))
            {
                var pIds = await db.Pedidos.Where(p => p.Etiqueta.Contains(etiqueta!)).Select(p => p.Id).ToListAsync(ct);
                q = q.Where(e => pIds.Contains(e.PedidoId));
            }

            var dados = await q
                .OrderByDescending(e => e.OcorreuEm)
                .Take(10_000)
                .Select(e => new
                {
                    Data = e.OcorreuEm,
                    Etiqueta = db.Pedidos.Where(p => p.Id == e.PedidoId).Select(p => p.Etiqueta).FirstOrDefault() ?? "",
                    StatusAnterior = e.StatusAnteriorId == null ? "" :
                        db.Statuses.Where(s => s.Id == e.StatusAnteriorId).Select(s => s.Nome).FirstOrDefault() ?? "",
                    StatusNovo = db.Statuses.Where(s => s.Id == e.StatusNovoId).Select(s => s.Nome).FirstOrDefault() ?? "",
                    Usuario = db.Usuarios.Where(u => u.Id == e.UsuarioId).Select(u => u.Nome).FirstOrDefault() ?? "",
                    Origem = e.Origem.ToString(),
                })
                .ToListAsync(ct);

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Histórico");
            ws.Cell(1, 1).Value = "Data";
            ws.Cell(1, 2).Value = "Etiqueta";
            ws.Cell(1, 3).Value = "Status anterior";
            ws.Cell(1, 4).Value = "Status novo";
            ws.Cell(1, 5).Value = "Usuário";
            ws.Cell(1, 6).Value = "Origem";
            ws.Range(1, 1, 1, 6).Style.Font.Bold = true;

            for (int i = 0; i < dados.Count; i++)
            {
                var r = i + 2;
                ws.Cell(r, 1).Value = dados[i].Data;
                ws.Cell(r, 1).Style.DateFormat.Format = "dd/MM/yyyy HH:mm:ss";
                ws.Cell(r, 2).Value = dados[i].Etiqueta;
                ws.Cell(r, 3).Value = dados[i].StatusAnterior;
                ws.Cell(r, 4).Value = dados[i].StatusNovo;
                ws.Cell(r, 5).Value = dados[i].Usuario;
                ws.Cell(r, 6).Value = dados[i].Origem;
            }
            ws.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            wb.SaveAs(ms);
            var bytes = ms.ToArray();
            var nome = $"historico_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            return Results.File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nome);
        }).WithName("ExportarHistoricoXlsx");

        return app;
    }
}
