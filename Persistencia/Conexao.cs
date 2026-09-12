using System;
using System.Data.SqlClient;

namespace Persistencia
{
    //public static class Conexao
    //{
    //    private static SqlConnection instancia;

    //    public static SqlConnection RetornaConexao(int conexao = 0)
    //    {
    //        var connectionString = string.Format("Data Source={0};Initial Catalog={1};Persist Security Info=True;User ID={2};Password={3}", Properties.Settings.Default.servidor, Properties.Settings.Default.banco, Properties.Settings.Default.usuario, Properties.Settings.Default.senha);

    //        if (instancia == null)
    //            instancia = new SqlConnection(connectionString);

    //        if (instancia.State == System.Data.ConnectionState.Closed)
    //            instancia.Open();

    //        return instancia;
    //    }

    //}
}
