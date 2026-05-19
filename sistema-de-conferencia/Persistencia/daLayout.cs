using System;
using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daLayout
    {
        int conexao;

        public daLayout(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voLayout mvo)
        {
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_Layout";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            try
            {
                cmd.ExecuteNonQuery();
                da.Fill(ds);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ds.Tables[0];
        }

        public void Alterar(voLayout mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_Layout";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@Nome", SqlDbType.VarChar, 50).Value = mvo.Nome;
            cmd.Parameters.Add("@ConfOrder", SqlDbType.Int).Value = mvo.ConfOrder;


            cmd.ExecuteNonQuery();
        }
    }
}
