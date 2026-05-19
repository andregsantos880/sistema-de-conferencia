using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daArquivo
    {
        int conexao;

        public daArquivo(int conexao)
        {
            this.conexao = conexao;
        }
        
        public void CarregarArquivo(voArquivo mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "CARREGA_ARQUIVO_SPI";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@layout", SqlDbType.Int).Value = mvo.layout;
            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar,8000).Value = mvo.caminho;

            cmd.ExecuteNonQuery();

        }
    }
}
