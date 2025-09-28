using Entidade;
using Persistencia;

namespace Negocio
{
    public class boSistema
    {
        public voSistema ConsultarConexao()
        {
            daSistema da = new daSistema();
            return da.ConsultarConexao();
        }
        public void AlterarConexao(voSistema mvo)
        {
            daSistema da = new daSistema();
            da.AlterarConexao(mvo);
        }

    }
}
