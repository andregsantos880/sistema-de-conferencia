using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boLayout
    {
        int conexao;

        public boLayout(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voLayout mvo)
        {
            daLayout da = new daLayout(conexao);
            return da.Consultar(mvo);
        }
        public void Alterar(voLayout mvo)
        {
            daLayout da = new daLayout(conexao);
            da.Alterar(mvo);
        }
    }
}
