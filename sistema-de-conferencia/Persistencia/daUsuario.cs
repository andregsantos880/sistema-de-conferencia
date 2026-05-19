using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daUsuario
    {
        int conexao;

        public daUsuario(int conexao)
        {
            this.conexao = conexao;
        }
        public DataTable Consultar(voUsuario mvo)
        {
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_usuario";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@login", SqlDbType.VarChar, 10).Value = mvo.LOGIN;
            cmd.Parameters.Add("@senha", SqlDbType.VarChar, 10).Value = mvo.SENHA;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public void Alterar(voUsuario mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_usuario";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@nome", SqlDbType.VarChar, 30).Value = mvo.NOME;
            cmd.Parameters.Add("@nivel", SqlDbType.VarChar, 30).Value = mvo.NIVEL;
            cmd.Parameters.Add("@login", SqlDbType.VarChar, 10).Value = mvo.LOGIN;
            cmd.Parameters.Add("@senha", SqlDbType.VarChar, 10).Value = mvo.SENHA;

            cmd.ExecuteNonQuery();
        }

        public void Excluir(voUsuario mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spd_usuario";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;

            cmd.ExecuteNonQuery();
        }

        public void Incluir(voUsuario mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_usuario";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@nome", SqlDbType.VarChar, 30).Value = mvo.NOME;
            cmd.Parameters.Add("@nivel", SqlDbType.VarChar, 30).Value = mvo.NIVEL;
            cmd.Parameters.Add("@login", SqlDbType.VarChar, 10).Value = mvo.LOGIN;
            cmd.Parameters.Add("@senha", SqlDbType.VarChar, 10).Value = mvo.SENHA;

            cmd.ExecuteNonQuery();
        }
    }
}
