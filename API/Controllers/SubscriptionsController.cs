using ConferSystem.API.Data;
using ConferSystem.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubscriptionsController(AppDbContext db) => _db = db;

    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _db.SubscriptionPlans.Where(p => p.IsActive).ToListAsync();
        return Ok(plans);
    }

    [HttpGet("status")]
    [Authorize]
    public async Task<IActionResult> GetStatus()
    {
        var companyId = Guid.Parse(User.FindFirst("companyId")?.Value ?? Guid.Empty.ToString());
        var sub = await _db.CompanySubscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);

        if (sub is null) return NotFound();

        return Ok(new
        {
            sub.Status,
            sub.TrialEndsAt,
            sub.CurrentPeriodEnd,
            plan = new { sub.Plan.Name, sub.Plan.PriceMonthlyBRL },
            isTrialActive = sub.Status == SubscriptionStatus.Trial && sub.TrialEndsAt > DateTime.UtcNow,
            trialDaysLeft = sub.Status == SubscriptionStatus.Trial
                ? Math.Max(0, (int)(sub.TrialEndsAt - DateTime.UtcNow).TotalDays)
                : 0,
        });
    }

    /// <summary>Activate subscription with payment (Stripe payment method ID).</summary>
    [HttpPost("activate")]
    [Authorize]
    public async Task<IActionResult> Activate([FromBody] ActivateSubscriptionRequest req)
    {
        var companyId = Guid.Parse(User.FindFirst("companyId")?.Value ?? Guid.Empty.ToString());
        var sub = await _db.CompanySubscriptions
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);

        if (sub is null) return NotFound();

        // In production: call Stripe API to create/update subscription with req.PaymentMethodId
        sub.Status = SubscriptionStatus.Active;
        sub.CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Subscription activated successfully" });
    }
}

public record ActivateSubscriptionRequest(string PaymentMethodId, Guid PlanId);
