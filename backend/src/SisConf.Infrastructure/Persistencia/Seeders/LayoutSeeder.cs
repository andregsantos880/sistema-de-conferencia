using Microsoft.EntityFrameworkCore;
using SisConf.Domain.Cadastros;

namespace SisConf.Infrastructure.Persistencia.Seeders;

public static class LayoutSeeder
{
    /// <summary>
    /// Catálogo global de layouts. Cada parser será implementado em SisConf.Infrastructure/Parsers
    /// na fase F4. Aqui só registramos os metadados; cada parser_key tem que bater
    /// com um IPedidoImportParser registrado no DI.
    /// </summary>
    private static readonly (string Nome, string ParserKey, string Descricao)[] Catalogo =
    {
        ("CSV Padrão", "csv-padrao", "Formato CSV genérico com cabeçalho (etiqueta,cliente,pe_cliente,produto,descricao,qtde,volume,sequencia,ordem_compra)."),
        ("Todeschini", "todeschini", "Layout TXT da Todeschini Móveis."),
        ("Criare",     "criare",     "Layout TXT da Criare Móveis."),
        ("Italinea",   "italinea",   "Layout TXT da Italinea Móveis."),
        ("Unicasa",    "unicasa",    "Layout TXT da Unicasa (Dell Anno / Favorita)."),
        ("DalMobile",  "dalmobile",  "Layout TXT da DalMobile."),
        ("Romanzza",   "romanzza",   "Layout TXT da Romanzza."),
        ("SCA",        "sca",        "Layout TXT da SCA Móveis."),
        ("Marel",      "marel",      "Layout TXT da Marel."),
        ("Kasak",      "kasak",      "Layout TXT da Kasak."),
        ("Bartzen",    "bartzen",    "Layout TXT da Bartzen."),
        ("Simonetto",  "simonetto",  "Layout TXT da Simonetto."),
        ("Vivatto",    "vivatto",    "Layout TXT da Vivatto."),
        ("HRM",        "hrm",        "Layout TXT da HRM."),
        ("Manfroi",    "manfroi",    "Layout TXT da Manfroi."),
        ("Jaeli",      "jaeli",      "Layout TXT da Jaeli."),
        ("Evviva",     "evviva",     "Layout TXT da Evviva."),
    };

    public static async Task SemearAsync(SisConfDbContext db, CancellationToken ct = default)
    {
        var existentes = await db.Layouts.IgnoreQueryFilters().Select(l => l.ParserKey).ToListAsync(ct);
        var set = existentes.ToHashSet();

        foreach (var (nome, key, desc) in Catalogo)
        {
            if (!set.Contains(key))
                db.Layouts.Add(Layout.Criar(nome, key, desc));
        }

        if (db.ChangeTracker.HasChanges())
            await db.SaveChangesAsync(ct);
    }
}
