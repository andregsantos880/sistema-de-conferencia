using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Persistencia
{
    public static class ApiExtensions
    {
        /// <summary>
        /// Inserção em Lote nativa do Supabase (Substitui o SqlBulkCopy).
        /// Envia a lista diretamente para: POST https://niapcemrcfmvsikvhlfd.supabase.co/rest/v1/{tabela}
        /// </summary>
        public static void InserirBulk<T>(this IApiConnection api, List<T> lista)
        {
            if (lista == null || lista.Count == 0)
                return;

            // Define a tabela de destino (ex: "PEDIDO")
            string tabela = typeof(T).Name.ToUpper();
            if (tabela == "PEDIDOIMPORT")
                tabela = "PEDIDO";

            var json = JsonConvert.SerializeObject(lista);
            using (var request = new HttpRequestMessage(HttpMethod.Post, tabela))
            {
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                // Header do Supabase para otimizar retorno de inserção em lote
                request.Headers.Add("Prefer", "return=minimal");

                var response = api.Client.SendAsync(request).GetAwaiter().GetResult();
                response.EnsureSuccessStatusCode();
            }
        }

        /// <summary>
        /// Executa queries SELECT no Supabase preservando a assinatura Query<T>.
        /// Suporta tanto o endpoint RPC quanto tabelas diretas.
        /// </summary>
        public static IEnumerable<T> Query<T>(this IApiConnection api, string sql, object param = null)
        {
            // Envia a query para a função RPC do Supabase que retorna os dados em JSON
            var payload = new { sql_query = sql };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("rpc/exec_sql", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<List<T>>(json) ?? new List<T>();
        }

        /// <summary>
        /// Executa comandos UPDATE / DELETE no Supabase preservando a assinatura Execute.
        /// </summary>
        public static int Execute(this IApiConnection api, string sql, object param = null)
        {
            var payload = new { sql_query = sql };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("rpc/exec_dml", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

            // Retorna a quantidade de linhas afetadas
            if (int.TryParse(json, out int linhasAfetadas))
                return linhasAfetadas;

            return 1;
        }

        /// <summary>
        /// Executa consultas escalares (ex: COUNT) preservando a assinatura ExecuteScalar<T>.
        /// </summary>
        public static T ExecuteScalar<T>(this IApiConnection api, string sql, object param = null)
        {
            var payload = new { sql_query = sql };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("rpc/exec_scalar", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<T>(json);
        }
    }
}