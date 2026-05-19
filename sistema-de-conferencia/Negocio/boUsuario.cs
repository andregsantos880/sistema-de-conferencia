using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boUsuario
    {
        int conexao;

        public boUsuario(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voUsuario mvo)
        {
            daUsuario da = new daUsuario(conexao);
            return da.Consultar(mvo);
        }
        public void Incluir(voUsuario mvo)
        {
            daUsuario da = new daUsuario(conexao);
            da.Incluir(mvo);
        }
        public void Alterar(voUsuario mvo)
        {
            daUsuario da = new daUsuario(conexao);
            da.Alterar(mvo);
        }
        public void Excluir(voUsuario mvo)
        {
            daUsuario da = new daUsuario(conexao);
            da.Excluir(mvo);
        }
    }
}
