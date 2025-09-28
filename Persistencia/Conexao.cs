using System;
using System.Data.SqlClient;

namespace Persistencia
{
    public static class Conexao
    {
        public static SqlConnection CreateConnection()
        {
            var builder = new SqlConnectionStringBuilder
            {
                DataSource = Properties.Settings.Default.servidor,
                InitialCatalog = Properties.Settings.Default.banco,
                PersistSecurityInfo = true,
                UserID = Properties.Settings.Default.usuario,
                Password = Properties.Settings.Default.senha
            };

            var connection = new SqlConnection(builder.ConnectionString);
            connection.Open();
            return connection;
        }
    }
}
