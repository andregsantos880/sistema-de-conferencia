using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Storage;
using SisConf.Application.Common.Tenants;
using SisConf.Application.Conferencia;
using SisConf.Application.Identidade;
using SisConf.Application.Importacao;
using SisConf.Application.Relatorios;
using SisConf.Application.Tenants;
using SisConf.Infrastructure.Auth;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Conferencia;
using SisConf.Infrastructure.Conferencia.Realtime;
using SisConf.Infrastructure.Identidade.Servicos;
using SisConf.Infrastructure.Importacao;
using SisConf.Infrastructure.Importacao.Parsers;
using SisConf.Infrastructure.Importacao.Realtime;
using SisConf.Infrastructure.Faturamento;
using SisConf.Infrastructure.Relatorios;
using SisConf.Infrastructure.Persistencia;
using SisConf.Infrastructure.Storage;
using SisConf.Infrastructure.Tenants;
using SisConf.Infrastructure.Tenants.Servicos;

namespace SisConf.Infrastructure;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("ConnectionStrings:Postgres não configurado.");

        services.AddDbContext<SisConfDbContext>(opt =>
        {
            opt.UseNpgsql(connectionString, npg =>
            {
                npg.MigrationsAssembly(typeof(SisConfDbContext).Assembly.FullName);
            });
        });

        services.AddMemoryCache();

        // Auth
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.SecaoConfig));
        services.AddSingleton<IPasswordHasher, Argon2idPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Tenant context (lê do HttpContext, escopo do request)
        services.AddHttpContextAccessor();
        services.AddScoped<ITenantContext, TenantContext>();

        // Use cases / serviços de aplicação
        services.AddScoped<ISignupService, SignupService>();
        services.AddScoped<IAuthService, AuthService>();

        // Conferência (assíncrona)
        services.AddSingleton<IConferenciaQueue, ConferenciaQueue>();
        services.AddScoped<IConferenciaPublisher, ConferenciaPublisher>();
        services.AddHostedService<ConferenciaProcessor>();
        services.AddHostedService<LockGcService>();

        // Importação (assíncrona)
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddSingleton<IPedidoImportParser, CsvPadraoParser>();
        services.AddSingleton<IPedidoImportParser, BartzenParser>();
        services.AddSingleton<IPedidoImportParserRegistry, PedidoImportParserRegistry>();
        services.AddSingleton<IImportacaoQueue, ImportacaoQueue>();
        services.AddScoped<IImportacaoPublisher, ImportacaoPublisher>();
        services.AddHostedService<ImportacaoProcessor>();

        // Stripe (billing)
        services.Configure<StripeOptions>(config.GetSection(StripeOptions.SecaoConfig));
        services.AddSingleton<SisConf.Application.Faturamento.IStripeService, StripeService>();
        services.AddScoped<StripeWebhookHandler>();

        // Relatórios (assíncrono via Channel + QuestPDF)
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        services.AddSingleton<IRelatorioQueue, RelatorioQueue>();
        services.AddHostedService<RelatorioProcessor>();

        services.AddSignalR();

        // Authorization por permissão
        services.AddSingleton<IAuthorizationPolicyProvider, PermissaoPolicyProvider>();
        services.AddSingleton<IAuthorizationHandler, PermissaoHandler>();
        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var opts = config.GetSection(JwtOptions.SecaoConfig).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Seção 'Jwt' não configurada.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(o =>
            {
                o.RequireHttpsMetadata = false; // dev: HTTPS off
                o.SaveToken = true;
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = opts.Issuer,
                    ValidateAudience = true,
                    ValidAudience = opts.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Secret)),
                    ClockSkew = TimeSpan.FromSeconds(30)
                };

                // SignalR WebSocket passa o token via query string ?access_token=...
                o.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
                {
                    OnMessageReceived = ctx =>
                    {
                        var accessToken = ctx.Request.Query["access_token"];
                        var path = ctx.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                            ctx.Token = accessToken;
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }

    public static IApplicationBuilder UseTenantStatusGuard(this IApplicationBuilder app)
        => app.UseMiddleware<TenantStatusMiddleware>();
}
