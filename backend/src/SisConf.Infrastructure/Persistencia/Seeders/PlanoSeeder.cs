using Microsoft.EntityFrameworkCore;
using SisConf.Domain.Faturamento;

namespace SisConf.Infrastructure.Persistencia.Seeders;

public static class PlanoSeeder
{
    public static async Task SemearAsync(SisConfDbContext db, CancellationToken ct = default)
    {
        var existentes = await db.Planos.Select(p => p.Codigo).ToListAsync(ct);
        var set = existentes.ToHashSet();

        var planos = new[]
        {
            ("Basic", "basic", 9900, 10, 1),         // R$ 99,00 — 10 importações/mês
            ("Pro", "pro", 24900, 50, 2),            // R$ 249,00 — 50 importações/mês
            ("Enterprise", "enterprise", 59900, -1, 3) // R$ 599,00 — ilimitado
        };

        foreach (var (nome, codigo, preco, limite, ordem) in planos)
        {
            if (!set.Contains(codigo))
                db.Planos.Add(Plano.Criar(nome, codigo, preco, limite, ordem));
        }

        if (db.ChangeTracker.HasChanges())
            await db.SaveChangesAsync(ct);
    }
}
