using ConferSystem.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ConferSystem.API.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config) => _config = config;

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ConferSystem-SuperSecret-Key-2024!"));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.Name),
            new Claim("companyId", user.CompanyId.ToString()),
            new Claim("branchId", user.BranchId?.ToString() ?? ""),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "ConferSystem",
            audience: _config["Jwt:Audience"] ?? "ConferSystemApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
