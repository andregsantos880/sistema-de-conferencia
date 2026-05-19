using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace SisConf.Infrastructure.Persistencia.Seeders;

public static class DataSeeder
{
    /// <summary>
    /// Roda os seeders globais (permissões, planos). Chamado no startup da Api.
    /// </summary>
    public static async Task ExecutarAsync(IServiceProvider sp, CancellationToken ct = default)
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");

        logger.LogInformation("Seeding: permissões...");
        await PermissaoSeeder.SemearAsync(db, ct);

        logger.LogInformation("Seeding: planos...");
        await PlanoSeeder.SemearAsync(db, ct);

        logger.LogInformation("Seeding: catálogo de layouts...");
        await LayoutSeeder.SemearAsync(db, ct);

        logger.LogInformation("Seeding concluído.");
    }
}
