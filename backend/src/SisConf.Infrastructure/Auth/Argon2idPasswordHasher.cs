using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using SisConf.Application.Common.Auth;

namespace SisConf.Infrastructure.Auth;

/// <summary>
/// Hash de senha com Argon2id seguindo recomendações OWASP.
/// Formato armazenado: $argon2id$v=19$m=65536,t=3,p=4$<salt_b64>$<hash_b64>
/// </summary>
public class Argon2idPasswordHasher : IPasswordHasher
{
    private const int SaltBytes = 16;
    private const int HashBytes = 32;
    private const int MemoryKb = 65536;   // 64 MB
    private const int Iterations = 3;
    private const int Parallelism = 4;

    public string Hash(string senhaPlana)
    {
        ArgumentException.ThrowIfNullOrEmpty(senhaPlana);

        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var hash = ComputarHash(senhaPlana, salt);

        return $"$argon2id$v=19$m={MemoryKb},t={Iterations},p={Parallelism}$"
             + $"{Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public bool Verificar(string senhaPlana, string hashArmazenado)
    {
        if (string.IsNullOrEmpty(senhaPlana) || string.IsNullOrEmpty(hashArmazenado))
            return false;

        var partes = hashArmazenado.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (partes.Length != 5 || partes[0] != "argon2id") return false;

        try
        {
            var salt = Convert.FromBase64String(partes[3]);
            var hashEsperado = Convert.FromBase64String(partes[4]);
            var hashCalculado = ComputarHash(senhaPlana, salt);
            return CryptographicOperations.FixedTimeEquals(hashCalculado, hashEsperado);
        }
        catch
        {
            return false;
        }
    }

    private static byte[] ComputarHash(string senha, byte[] salt)
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(senha))
        {
            Salt = salt,
            DegreeOfParallelism = Parallelism,
            Iterations = Iterations,
            MemorySize = MemoryKb
        };
        return argon2.GetBytes(HashBytes);
    }
}
