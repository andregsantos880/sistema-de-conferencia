using System.Text.Encodings.Web;
using System.Text.Unicode;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using SisConf.Api.Endpoints;
using SisConf.Infrastructure;
using SisConf.Infrastructure.Conferencia.Realtime;
using SisConf.Infrastructure.Importacao.Realtime;
using SisConf.Infrastructure.Persistencia;
using SisConf.Infrastructure.Persistencia.Seeders;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console());

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(o =>
{
    o.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new() { Title = "SisConf API", Version = "v1" });
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole o JWT (sem o prefixo 'Bearer ')."
    });
    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:5173", "http://localhost:5174")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("Postgres")!,
        name: "postgres",
        tags: new[] { "db" });

var app = builder.Build();

// Aplica migrations pendentes + seeders no startup (dev)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<SisConfDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.ExecutarAsync(app.Services);
}

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.UseAuthentication();
app.UseTenantStatusGuard();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapGet("/", () => Results.Ok(new { service = "SisConf API", status = "ok", time = DateTime.UtcNow }));

app.MapGet("/api/test/db", async (SisConfDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();
    var planos = await db.Planos.CountAsync();
    var tenants = await db.Tenants.CountAsync();
    var permissoes = await db.Permissoes.CountAsync();
    return Results.Ok(new { canConnect, planos, tenants, permissoes });
});

app.MapPublicEndpoints();
app.MapAuthEndpoints();
app.MapStatusEndpoints();
app.MapBoxEndpoints();
app.MapGrupoEndpoints();
app.MapLayoutEndpoints();
app.MapRoleEndpoints();
app.MapUsuarioEndpoints();
app.MapPedidoEndpoints();
app.MapConferenciaEndpoints();
app.MapImportacaoEndpoints();
app.MapHistoricoEndpoints();
app.MapRelatorioEndpoints();
app.MapBillingEndpoints();

app.MapHub<ConferenciaHub>("/hubs/conferencia");
app.MapHub<ImportacaoHub>("/hubs/importacao");

app.Run();
