using System;
using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daBox
    {
        int conexao;

        public daBox(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable ConsultarDisponivel(voBox mvo)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {
                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "sps_box";
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
    }
}
