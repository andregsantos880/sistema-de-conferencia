using Newtonsoft.Json;
using Persistencia;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace Persistencia
{
    public static class ApiExtensions
    {
        /// <summary>
        /// Mantém a assinatura: Query<T>(sql, param) -> IEnumerable<T>
        /// </summary>
        public static IEnumerable<T> Query<T>(this IApiConnection api, string sql, object param = null)
        {
            var payload = new { Query = sql, Param = param };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("dados/query", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<List<T>>(json) ?? new List<T>();
        }

        /// <summary>
        /// Mantém a assinatura: Execute(sql, param) -> int
        /// </summary>
        public static int Execute(this IApiConnection api, string sql, object param = null)
        {
            var payload = new { Sql = sql, Param = param };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("dados/execute", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<int>(json);
        }

        /// <summary>
        /// Mantém a assinatura: ExecuteScalar<T>(sql, param) -> T
        /// </summary>
        public static T ExecuteScalar<T>(this IApiConnection api, string sql, object param = null)
        {
            var payload = new { Sql = sql, Param = param };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync("dados/execute-scalar", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<T>(json);
        }

        /// <summary>
        /// Mantém a assinatura: InserirBulk<T>(lista) -> void
        /// </summary>
        public static void InserirBulk<T>(this IApiConnection api, List<T> lista)
        {
            if (lista == null || lista.Count == 0)
                return;

            string tipoEntidade = typeof(T).Name;
            var json = JsonConvert.SerializeObject(lista);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = api.Client.PostAsync($"pedidos/inserir-bulk?tipo={tipoEntidade}", content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();
        }
    }
}