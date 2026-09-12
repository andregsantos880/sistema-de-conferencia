using System.Data;
using Entidade;
using System.Data.SqlClient;
using System;
using System.Collections.Generic;

namespace Persistencia
{
    public class daPedido
    {
        int conexao;

        public daPedido(int conexao)
        {
            this.conexao = conexao;
        }

        public void InserirBulk<T>(List<T> _listVoPedido)
        {
            Conexao.RetornaConexao().InserirBulk(_listVoPedido);
        }
    }
}
