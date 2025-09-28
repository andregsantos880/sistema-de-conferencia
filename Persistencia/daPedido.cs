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

            using (var connection = Conexao.CreateConnection())
            using (SqlBulkCopy bulkCopy = new SqlBulkCopy(connection))
            {
                bulkCopy.DestinationTableName = "dbo.Pedido";
                try
                {
                    bulkCopy.WriteToServer(reader);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    throw;
                }
                finally
                {
                    reader.Close();
                }
            }
        }
    }
}
