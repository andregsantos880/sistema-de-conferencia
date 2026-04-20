using ConferSystem.API.Data;
using ConferSystem.API.Models;
using ConferSystem.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _token;
    private readonly IEmailService _email;

    public AuthController(AppDbContext db, ITokenService token, IEmailService email)
    {
        _db = db;
        _token = token;
        _email = email;
    }

    /// <summary>List all active companies (for company selection on login screen).</summary>
    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies()
    {
        var companies = await _db.Companies
            .Where(c => c.IsActive)
            .Select(c => new { c.Id, c.Name, c.Slug, hasBranches = c.Branches.Any() })
            .ToListAsync();
        return Ok(companies);
    }

    /// <summary>List branches for a company.</summary>
    [HttpGet("companies/{companyId}/branches")]
    public async Task<IActionResult> GetBranches(Guid companyId)
    {
        var branches = await _db.Branches
            .Where(b => b.CompanyId == companyId && b.IsActive)
            .Select(b => new { b.Id, b.Name })
            .ToListAsync();
        return Ok(branches);
    }

    /// <summary>Login: companyId + branchId (optional) + credentials.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.CompanyId == req.CompanyId && u.Email == req.Email && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { error = "Invalid credentials" });

        if (!user.EmailConfirmed)
            return Unauthorized(new { error = "Please confirm your email before logging in" });

        var sub = await _db.CompanySubscriptions
            .FirstOrDefaultAsync(s => s.CompanyId == req.CompanyId);

        if (sub is not null && sub.Status == SubscriptionStatus.Trial && sub.TrialEndsAt < DateTime.UtcNow)
            return Unauthorized(new { error = "trial_expired", redirectTo = "/auth/subscribe" });

        var jwt = _token.GenerateToken(user);
        return Ok(new { token = jwt, user = new { user.Id, user.Name, user.Email, user.Role, companyName = user.Company.Name } });
    }

    /// <summary>Register a new company + admin user.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { error = "Email already registered" });

        var plan = await _db.SubscriptionPlans.FindAsync(req.PlanId)
            ?? await _db.SubscriptionPlans.FirstAsync();

        var company = new Company { Name = req.CompanyName, Slug = req.CompanyName.ToLowerInvariant().Replace(" ", "-") };
        var confirmToken = Guid.NewGuid().ToString("N");
        var user = new User
        {
            Name = req.AdminName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = UserRole.Admin,
            EmailConfirmationToken = confirmToken,
            Company = company,
        };
        var subscription = new CompanySubscription { Company = company, PlanId = plan.Id, Status = SubscriptionStatus.Trial };

        _db.Companies.Add(company);
        _db.Users.Add(user);
        _db.CompanySubscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        await _email.SendConfirmationEmailAsync(req.Email, req.AdminName, confirmToken);

        return Ok(new { message = "Account created. Please check your email to confirm." });
    }

    /// <summary>Confirm email via token.</summary>
    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmailConfirmationToken == token);
        if (user is null) return BadRequest(new { error = "Invalid or expired token" });

        user.EmailConfirmed = true;
        user.EmailConfirmationToken = null;
        await _db.SaveChangesAsync();

        return Redirect("/email-confirmed");
    }
}

public record LoginRequest(Guid CompanyId, Guid? BranchId, string Email, string Password);
public record RegisterRequest(string CompanyName, string AdminName, string Email, string Password, Guid PlanId);
