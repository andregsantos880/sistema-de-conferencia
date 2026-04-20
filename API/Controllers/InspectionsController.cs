using ConferSystem.API.Data;
using ConferSystem.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InspectionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public InspectionsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? branchId,
        [FromQuery] InspectionStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var companyId = GetCompanyId();
        var query = _db.Inspections
            .Where(i => i.CompanyId == companyId);

        if (branchId.HasValue) query = query.Where(i => i.BranchId == branchId.Value);
        if (status.HasValue) query = query.Where(i => i.Status == status.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var companyId = GetCompanyId();
        var inspection = await _db.Inspections
            .Include(i => i.StatusHistory)
            .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

        if (inspection is null) return NotFound();
        return Ok(inspection);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInspectionRequest req)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var inspection = new InspectionRecord
        {
            CompanyId = companyId,
            BranchId = req.BranchId,
            Title = req.Title,
            Description = req.Description,
            AssignedToUserId = req.AssignedToUserId,
            ScheduledAt = req.ScheduledAt,
            Notes = req.Notes,
            ReferenceCode = $"INS-{DateTime.UtcNow:yyyy}-{new Random().Next(1000, 9999)}",
        };

        inspection.StatusHistory.Add(new InspectionStatusHistory
        {
            ToStatus = InspectionStatus.Pending,
            ChangedByUserId = userId,
        });

        _db.Inspections.Add(inspection);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = inspection.Id }, inspection);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
    {
        var companyId = GetCompanyId();
        var userId = GetUserId();

        var inspection = await _db.Inspections
            .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

        if (inspection is null) return NotFound();

        var history = new InspectionStatusHistory
        {
            InspectionId = inspection.Id,
            FromStatus = inspection.Status,
            ToStatus = req.NewStatus,
            ChangedByUserId = userId,
            Reason = req.Reason,
        };

        inspection.Status = req.NewStatus;
        inspection.UpdatedAt = DateTime.UtcNow;
        if (req.NewStatus == InspectionStatus.Approved || req.NewStatus == InspectionStatus.Rejected)
            inspection.CompletedAt = DateTime.UtcNow;

        _db.InspectionStatusHistories.Add(history);
        await _db.SaveChangesAsync();

        return Ok(inspection);
    }

    private Guid GetCompanyId() =>
        Guid.Parse(User.FindFirst("companyId")?.Value ?? Guid.Empty.ToString());

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
}

public record CreateInspectionRequest(
    string Title,
    string Description,
    Guid BranchId,
    Guid? AssignedToUserId,
    DateTime? ScheduledAt,
    string? Notes);

public record UpdateStatusRequest(InspectionStatus NewStatus, string? Reason);
