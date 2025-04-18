using System.Data;
using Entidade;
using System.Data.SqlClient;
using System;
using System.Collections.Generic;

namespace Persistencia
{
    public class daPedido
    {
        int conexao;

        public daPedido(int conexao)
        {
            this.conexao = conexao;
        }

        public void InserirBulk<T>(List<T> _listVoPedido)
        {
            DataTableReader reader = CollectionHelper
                       .ConvertTo<T>(_listVoPedido).CreateDataReader();

            using (SqlBulkCopy bulkCopy =
           new SqlBulkCopy(Conexao.RetornaConexao(conexao)))
            {
                bulkCopy.DestinationTableName =
                    "dbo.Pedido";
                try
                {
                    // Write from the source to the destination.
                    bulkCopy.WriteToServer(reader);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    throw ex;
                }
                finally
                {
                    reader.Close();
                }
            }
        }
    }
}
