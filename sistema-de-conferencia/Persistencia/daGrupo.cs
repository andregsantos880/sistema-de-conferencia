using System;
using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daGrupo
    {
        int conexao;

        public daGrupo(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voGrupo mvo)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {
                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "sps_grupo";
                cmd.Connection = Conexao.RetornaConexao(conexao);

                cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.Id;

                cmd.ExecuteNonQuery();

                da.Fill(ds);

                return ds.Tables[0];
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public void Alterar(voGrupo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_grupo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.Id;
            cmd.Parameters.Add("@NmNome", SqlDbType.VarChar, 50).Value = mvo.NmNome;
            cmd.Parameters.Add("@usuarioId", SqlDbType.Int).Value = mvo.usuarioId;

            cmd.ExecuteNonQuery();
        }

        public void Excluir(voGrupo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spd_grupo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.Id;

            cmd.ExecuteNonQuery();
        }

        public void Incluir(voGrupo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_grupo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Direction = ParameterDirection.Output;
            cmd.Parameters.Add("@NmNome", SqlDbType.VarChar, 50).Value = mvo.NmNome;
            cmd.Parameters.Add("@usuarioId", SqlDbType.Int).Value = mvo.usuarioId;

            cmd.ExecuteNonQuery();

            mvo.Id = Convert.ToInt16(cmd.Parameters.Add("@id", SqlDbType.Int).Value);
        }
    }
}
