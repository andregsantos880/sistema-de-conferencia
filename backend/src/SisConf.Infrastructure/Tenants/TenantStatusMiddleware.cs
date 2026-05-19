using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SisConf.Application.Common.Tenants;
using SisConf.Domain.Tenants;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Tenants;

/// <summary>
/// Após autenticação, verifica se o tenant está ativo. Tenants suspensos recebem 402.
/// Endpoints públicos (não autenticados) e o módulo de billing/faturas passam direto.
/// </summary>
public class TenantStatusMiddleware
{
    private static readonly string[] CaminhosLiberadosParaTenantSuspenso =
    {
        "/api/faturas",
        "/api/assinatura",
        "/api/billing",
        "/api/auth",
        "/api/tenant",
        "/health",
        "/swagger"
    };

    private readonly RequestDelegate _next;

    public TenantStatusMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext ctx, ITenantContext tenantContext,
        SisConfDbContext db, IMemoryCache cache)
    {
        if (!tenantContext.EstaAutenticado)
        {
            await _next(ctx);
            return;
        }

        var caminho = ctx.Request.Path.Value ?? "";
        if (CaminhosLiberadosParaTenantSuspenso.Any(p => caminho.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(ctx);
            return;
        }

        var status = await cache.GetOrCreateAsync($"tenant:status:{tenantContext.TenantId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await db.Tenants
                .Where(t => t.Id == tenantContext.TenantId)
                .Select(t => (TenantStatus?)t.Status)
                .FirstOrDefaultAsync();
        });

        if (status is null)
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await ctx.Response.WriteAsJsonAsync(new { erro = "tenant_inexistente" });
            return;
        }

        if (status is TenantStatus.Suspenso or TenantStatus.Cancelado)
        {
            ctx.Response.StatusCode = StatusCodes.Status402PaymentRequired;
            await ctx.Response.WriteAsJsonAsync(new
            {
                erro = "tenant_suspenso",
                detalhe = "Acesso bloqueado. Regularize sua assinatura para continuar.",
                status = status.Value.ToString().ToLowerInvariant()
            });
            return;
        }

        await _next(ctx);
    }
}
