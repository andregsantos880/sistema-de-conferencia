using ConferSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ConferSystem.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<InspectionRecord> Inspections => Set<InspectionRecord>();
    public DbSet<InspectionStatusHistory> InspectionStatusHistories => Set<InspectionStatusHistory>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<CompanySubscription> CompanySubscriptions => Set<CompanySubscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasMany(c => c.Branches).WithOne(b => b.Company).HasForeignKey(b => b.CompanyId);
            e.HasMany(c => c.Users).WithOne(u => u.Company).HasForeignKey(u => u.CompanyId);
        });

        modelBuilder.Entity<Branch>(e =>
        {
            e.HasKey(b => b.Id);
        });

        modelBuilder.Entity<InspectionRecord>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Status).HasConversion<string>();
            e.HasMany(i => i.StatusHistory).WithOne(h => h.Inspection).HasForeignKey(h => h.InspectionId);
        });

        modelBuilder.Entity<CompanySubscription>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Company).WithOne(c => c.Subscription).HasForeignKey<CompanySubscription>(s => s.CompanyId);
        });

        // Seed subscription plans
        modelBuilder.Entity<SubscriptionPlan>().HasData(
            new SubscriptionPlan { Id = Guid.Parse("11111111-0000-0000-0000-000000000001"), Name = "Starter", PriceMonthlyBRL = 149m, MaxBranches = 1, MaxUsers = 5, MaxInspectionsPerMonth = 500 },
            new SubscriptionPlan { Id = Guid.Parse("11111111-0000-0000-0000-000000000002"), Name = "Professional", PriceMonthlyBRL = 399m, MaxBranches = 5, MaxUsers = 25, MaxInspectionsPerMonth = null },
            new SubscriptionPlan { Id = Guid.Parse("11111111-0000-0000-0000-000000000003"), Name = "Enterprise", PriceMonthlyBRL = null, MaxBranches = null, MaxUsers = null, MaxInspectionsPerMonth = null }
        );
    }
}
