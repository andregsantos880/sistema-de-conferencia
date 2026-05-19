using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boBox
    {
        int conexao;

        public boBox(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable ConsultarDisponivel(voBox mvo)
        {
            daBox da = new daBox(conexao);
            return da.ConsultarDisponivel(mvo);
        }
    }
}
