using Entidade;
using Persistencia;
using System.Data;

namespace Negocio
{
    public class boPedidoGrupo
    {
        int conexao;

        public boPedidoGrupo(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voPedidoGrupo mvo)
        {
            daPedidoGrupo da = new daPedidoGrupo(conexao);
            return da.Consultar(mvo);
        }

        public void Incluir(voPedidoGrupo mvo)
        {
            daPedidoGrupo da = new daPedidoGrupo(conexao);
            da.Incluir(mvo);
        }
        public void Excluir(voPedidoGrupo mvo)
        {
            daPedidoGrupo da = new daPedidoGrupo(conexao);
            da.Excluir(mvo);
        }
    }
}
