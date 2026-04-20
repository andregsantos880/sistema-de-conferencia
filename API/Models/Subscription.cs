namespace ConferSystem.API.Models;

public class SubscriptionPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public decimal? PriceMonthlyBRL { get; set; }
    public int? MaxBranches { get; set; }
    public int? MaxUsers { get; set; }
    public int? MaxInspectionsPerMonth { get; set; }
    public bool IsActive { get; set; } = true;
}

public enum SubscriptionStatus { Trial, Active, PastDue, Cancelled }

public class CompanySubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
    public DateTime TrialEndsAt { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? CurrentPeriodEnd { get; set; }
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public SubscriptionPlan Plan { get; set; } = null!;
}
