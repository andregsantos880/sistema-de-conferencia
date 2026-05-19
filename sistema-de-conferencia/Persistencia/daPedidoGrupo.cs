using System;
using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daPedidoGrupo
    {
        int conexao;

        public daPedidoGrupo(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voPedidoGrupo mvo)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {
                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "sps_pedidoGrupo";
                cmd.Connection = Conexao.RetornaConexao(conexao);

                cmd.ExecuteNonQuery();

                da.Fill(ds);

                return ds.Tables[0];
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public void Excluir(voPedidoGrupo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spd_pedidoGrupo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@IdGrupo", SqlDbType.Int).Value = mvo.IdGrupo;

            cmd.ExecuteNonQuery();
        }

        public void Incluir(voPedidoGrupo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_pedidoGrupo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@IdGrupo", SqlDbType.Int).Value = mvo.IdGrupo;
            cmd.Parameters.Add("@IdPedido", SqlDbType.Int).Value = mvo.IdPedido;

            cmd.ExecuteNonQuery();

        }
    }
}
