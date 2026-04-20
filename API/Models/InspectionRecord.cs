namespace ConferSystem.API.Models;

public enum InspectionStatus
{
    Pending,
    InProgress,
    Approved,
    Rejected,
    RequiresReview
}

public class InspectionRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReferenceCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public InspectionStatus Status { get; set; } = InspectionStatus.Pending;
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InspectionStatusHistory> StatusHistory { get; set; } = new List<InspectionStatusHistory>();
}

public class InspectionStatusHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InspectionId { get; set; }
    public InspectionStatus? FromStatus { get; set; }
    public InspectionStatus ToStatus { get; set; }
    public Guid ChangedByUserId { get; set; }
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public InspectionRecord Inspection { get; set; } = null!;
}
