using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Conferencia;

/// <summary>
/// Limpa locks expirados a cada minuto. Evita "fantasmas" caso o operador
/// caia/feche o browser sem desconectar do SignalR.
/// </summary>
public class LockGcService : BackgroundService
{
    private static readonly TimeSpan Intervalo = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LockGcService> _log;

    public LockGcService(IServiceScopeFactory scopeFactory, ILogger<LockGcService> log)
    {
        _scopeFactory = scopeFactory;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("LockGcService iniciado.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();

                var liberados = await db.Pedidos.IgnoreQueryFilters()
                    .Where(p => p.LockExpiresAt != null && p.LockExpiresAt < DateTime.UtcNow)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.LockSessionId, (string?)null)
                        .SetProperty(p => p.LockUsuarioId, (Guid?)null)
                        .SetProperty(p => p.LockExpiresAt, (DateTime?)null), stoppingToken);

                if (liberados > 0)
                    _log.LogInformation("LockGc liberou {Qtd} locks expirados.", liberados);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Falha no LockGc.");
            }

            await Task.Delay(Intervalo, stoppingToken);
        }
    }
}
