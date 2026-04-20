namespace ConferSystem.API.Models;

public enum UserRole { Admin, Manager, Inspector, Viewer }

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }
    public Guid? BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Inspector;
    public bool EmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
}
