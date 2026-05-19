namespace SisConf.Application.Common.Auth;

public interface IPasswordHasher
{
    string Hash(string senhaPlana);
    bool Verificar(string senhaPlana, string hashArmazenado);
}
