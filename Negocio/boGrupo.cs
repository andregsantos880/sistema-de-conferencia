using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boGrupo
    {
        int conexao;

        public boGrupo(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voGrupo mvo)
        {
            daGrupo da = new daGrupo(conexao);
            return da.Consultar(mvo);
        }
        public void Alterar(voGrupo mvo)
        {
            daGrupo da = new daGrupo(conexao);
            da.Alterar(mvo);
        }
        public void Incluir(voGrupo mvo)
        {
            daGrupo da = new daGrupo(conexao);
            da.Incluir(mvo);
        }
        public void Excluir(voGrupo mvo)
        {
            daGrupo da = new daGrupo(conexao);
            da.Excluir(mvo);
        }
    }
}
