using Microsoft.EntityFrameworkCore;
using SisConf.Application.Common.Auth;
using SisConf.Domain.Identidade;

namespace SisConf.Infrastructure.Persistencia.Seeders;

public static class PermissaoSeeder
{
    public static async Task SemearAsync(SisConfDbContext db, CancellationToken ct = default)
    {
        var existentes = await db.Permissoes.Select(p => p.Codigo).ToListAsync(ct);
        var existentesSet = existentes.ToHashSet();

        foreach (var item in Permissoes.Catalogo)
        {
            if (!existentesSet.Contains(item.Codigo))
            {
                db.Permissoes.Add(Permissao.Criar(item.Codigo, item.Modulo, item.Acao, item.Descricao));
            }
        }

        if (db.ChangeTracker.HasChanges())
            await db.SaveChangesAsync(ct);
    }
}
