using Persistencia;

namespace Negocio
{
    public class boSincronizarMobile
    {
        public boSincronizarMobile()
        {
           
        }
        public void Executar(bool sincronizarStatusApenas = false)
        {
            new daSincronizarMobile().Executar(sincronizarStatusApenas);
        }
    }
}
