using System.Data.SqlClient;

namespace Persistencia
{
    public class Conexao
    {
        private static SqlConnection instancia;

        public static SqlConnection RetornaConexao(int conexao)
        {

            string local = Properties.Settings.Default.localDataConnectionString;
            string remoto = string.Format("Data Source={0};Initial Catalog={1};Persist Security Info=True;User ID={2};Password={3}", Properties.Settings.Default.servidor, Properties.Settings.Default.banco, Properties.Settings.Default.usuario, Properties.Settings.Default.senha);

            if (instancia == null)
                instancia = new SqlConnection();

            if (instancia.State == System.Data.ConnectionState.Open)
                if ((instancia.ConnectionString != local && conexao == 1) || (instancia.ConnectionString != remoto  && conexao == 0))
                    instancia.Close();

            if (instancia.State == System.Data.ConnectionState.Closed)
            {
                if (conexao == 0)
                    instancia.ConnectionString = remoto;
                else
                    instancia.ConnectionString = local;

                instancia.Open();
            }

            return instancia;
        }

    }
}
