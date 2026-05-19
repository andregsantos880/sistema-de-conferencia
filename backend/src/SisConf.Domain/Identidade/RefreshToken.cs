using SisConf.Domain.Common;

namespace SisConf.Domain.Identidade;

public class RefreshToken : Entidade, IPertenceTenant
{
    public Guid TenantId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string TokenHash { get; private set; } = null!;
    public DateTime ExpiraEm { get; private set; }
    public DateTime? RevogadoEm { get; private set; }
    public string? IpOrigem { get; private set; }
    public string? UserAgent { get; private set; }
    public Guid? SubstituidoPorId { get; private set; }

    private RefreshToken() { }

    public static RefreshToken Criar(Guid tenantId, Guid usuarioId, string tokenHash, DateTime expiraEm,
        string? ipOrigem, string? userAgent)
    {
        return new RefreshToken
        {
            TenantId = tenantId,
            UsuarioId = usuarioId,
            TokenHash = tokenHash,
            ExpiraEm = expiraEm,
            IpOrigem = ipOrigem,
            UserAgent = userAgent
        };
    }

    public void Revogar(Guid? substituidoPorId = null)
    {
        RevogadoEm = DateTime.UtcNow;
        SubstituidoPorId = substituidoPorId;
        AtualizadoEm = DateTime.UtcNow;
    }

    public bool EstaAtivo => RevogadoEm is null && ExpiraEm > DateTime.UtcNow;
}
