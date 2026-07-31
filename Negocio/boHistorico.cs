using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boHistorico 
    {
        int conexao;

        public boHistorico(int conexao)
        {
            this.conexao = conexao;
        }
        public void Inserir(voHistorico mvo)
        {
            daHistorico da = new daHistorico(conexao);
            da.Inserir(mvo);
        }
        public DataTable Consultar(voHistorico mvo)
        {
            daHistorico da = new daHistorico(conexao);
            return da.Consultar(mvo);
        }
    }
}
