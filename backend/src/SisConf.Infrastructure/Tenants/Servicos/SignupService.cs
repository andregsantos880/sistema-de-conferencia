using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Resultados;
using SisConf.Application.Faturamento;
using SisConf.Application.Tenants;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Identidade;
using SisConf.Domain.Tenants;
using SisConf.Infrastructure.Persistencia;
using SisConf.Infrastructure.Persistencia.Seeders;

namespace SisConf.Infrastructure.Tenants.Servicos;

public class SignupService : ISignupService
{
    private readonly SisConfDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IStripeService _stripe;
    private readonly ILogger<SignupService> _log;

    public SignupService(SisConfDbContext db, IPasswordHasher hasher, IJwtTokenService jwt,
        IStripeService stripe, ILogger<SignupService> log)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _stripe = stripe;
        _log = log;
    }

    public async Task<Resultado<SignupResposta>> ExecutarAsync(SignupRequest req, string? ip, string? userAgent, CancellationToken ct)
    {
        if (req.SenhaAdmin.Length < 8)
            return Resultado<SignupResposta>.Falha("Senha deve ter ao menos 8 caracteres.", "senha_curta");

        var plano = await _db.Planos.FirstOrDefaultAsync(p => p.Codigo == req.PlanoCodigo && p.Ativo, ct);
        if (plano is null)
            return Resultado<SignupResposta>.Falha("Plano inválido.", "plano_invalido");

        var emailNormalizado = req.EmailAdmin.Trim().ToLowerInvariant();
        var slug = GerarSlug(req.RazaoSocial);
        slug = await GarantirSlugUnicoAsync(slug, ct);

        var tenant = Tenant.Criar(slug, req.RazaoSocial.Trim(), req.Documento.Trim(),
            emailNormalizado, string.IsNullOrWhiteSpace(req.Telefone) ? null : req.Telefone.Trim(),
            plano.Id);

        var usuario = Usuario.Criar(tenant.Id, emailNormalizado, _hasher.Hash(req.SenhaAdmin),
            req.NomeAdmin.Trim(), ehOwner: true);

        var roles = RolesTenantTemplate.CriarParaTenant(tenant.Id);
        var roleAdmin = roles.First(r => r.Nome == "Admin");

        // Atribui Admin ao owner
        var usuarioRoleAdmin = new UsuarioRole { UsuarioId = usuario.Id, RoleId = roleAdmin.Id };

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            _db.Tenants.Add(tenant);
            _db.Usuarios.Add(usuario);
            _db.Roles.AddRange(roles);
            _db.UsuarioRoles.Add(usuarioRoleAdmin);

            // Cadastros iniciais (status, boxes) — usuário customiza depois
            _db.Statuses.AddRange(CadastrosIniciaisTenant.CriarStatusIniciais(tenant.Id));
            _db.Boxes.AddRange(CadastrosIniciaisTenant.CriarBoxesIniciais(tenant.Id));

            await _db.SaveChangesAsync(ct);

            // Stripe: cria customer + subscription com trial 14d (sandbox/mock se SecretKey vazio)
            try
            {
                var customer = await _stripe.CriarCustomerAsync(usuario.Email, req.RazaoSocial, req.Documento, ct);
                tenant.VincularStripeCustomer(customer.CustomerId);

                Assinatura? assinatura = null;
                if (!string.IsNullOrEmpty(plano.StripePriceId))
                {
                    var sub = await _stripe.CriarSubscriptionAsync(customer.CustomerId, plano.StripePriceId, trialDays: 14, ct);
                    assinatura = Assinatura.Criar(tenant.Id, plano.Id, sub.SubscriptionId);
                }
                else
                {
                    assinatura = Assinatura.Criar(tenant.Id, plano.Id);
                }
                _db.Assinaturas.Add(assinatura);
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception stripeEx)
            {
                _log.LogWarning(stripeEx, "Falha na integração Stripe durante signup. Tenant prosseguiu sem assinatura.");
            }

            // Emite tokens já no signup (UX: faz login automático)
            var permissoes = Application.Common.Auth.Permissoes.TodasDoTenant.ToArray();
            var tokens = _jwt.Emitir(new DadosUsuarioToken(
                usuario.Id, tenant.Id, usuario.Email, usuario.Nome, true, permissoes));

            var refreshToken = RefreshToken.Criar(tenant.Id, usuario.Id,
                _jwt.HashRefreshToken(tokens.RefreshToken),
                tokens.RefreshTokenExpiraEm, ip, userAgent);

            _db.RefreshTokens.Add(refreshToken);
            await _db.SaveChangesAsync(ct);

            await tx.CommitAsync(ct);

            _log.LogInformation("Signup concluído: tenant {TenantId} slug={Slug} owner={Email}",
                tenant.Id, tenant.Slug, usuario.Email);

            return Resultado<SignupResposta>.Ok(new SignupResposta(
                tenant.Id, tenant.Slug, usuario.Id, usuario.Email, usuario.Nome, tokens));
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("ix_usuario_tenant_id_email") == true)
        {
            await tx.RollbackAsync(ct);
            return Resultado<SignupResposta>.Falha("Email já cadastrado.", "email_duplicado");
        }
    }

    private async Task<string> GarantirSlugUnicoAsync(string baseSlug, CancellationToken ct)
    {
        var slug = baseSlug;
        var sufixo = 1;
        while (await _db.Tenants.AnyAsync(t => t.Slug == slug, ct))
        {
            slug = $"{baseSlug}-{sufixo}";
            sufixo++;
        }
        return slug;
    }

    private static string GerarSlug(string entrada)
    {
        var semAcento = string.Concat(entrada.Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark));
        var lower = semAcento.ToLowerInvariant();
        var apenasValido = Regex.Replace(lower, @"[^a-z0-9\s-]", "");
        var sem2EspacoComTraco = Regex.Replace(apenasValido, @"\s+", "-").Trim('-');
        if (string.IsNullOrEmpty(sem2EspacoComTraco)) sem2EspacoComTraco = "tenant";
        return sem2EspacoComTraco.Length > 60 ? sem2EspacoComTraco[..60] : sem2EspacoComTraco;
    }
}
