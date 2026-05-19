using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daHistorico
    {
        int conexao;

        public daHistorico(int conexao)
        {
            this.conexao = conexao;
        }
        public void Inserir(voHistorico mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_historico";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@PEDIDOID", SqlDbType.Int).Value = mvo.PEDIDOID;
            cmd.Parameters.Add("@DATA", SqlDbType.DateTime).Value = mvo.DATA;
            cmd.Parameters.Add("@STATUS", SqlDbType.Int).Value = mvo.STATUS;
            cmd.Parameters.Add("@USUARIO", SqlDbType.Int).Value = mvo.USUARIO;

            cmd.ExecuteNonQuery();

        }
        public DataTable Consultar(voHistorico mvo)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_historico";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@PEDIDOID", SqlDbType.Int).Value = mvo.PEDIDOID;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];

        }
    }
}
