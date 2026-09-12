using System;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;

namespace Persistencia
{
    public interface IApiConnection
    {
        HttpClient Client { get; }
    }

    public class ApiConnection : IApiConnection
    {
        public HttpClient Client { get; }

        public ApiConnection()
        {
            // URL do seu projeto no Supabase
            var baseUrl = ConfigurationManager.AppSettings["SupabaseUrl"]
                          ?? "https://niapcemrcfmvsikvhlfd.supabase.co/rest/v1/";

            // Chave pública (anon) ou service_role do seu projeto Supabase
            var apiKey = ConfigurationManager.AppSettings["SupabaseKey"]
                         ?? "SUA_SUPABASE_KEY_AQUI";
            var jwt = ConfigurationManager.AppSettings["SupabaseJwt"];

            Client = new HttpClient
            {
                BaseAddress = new Uri(baseUrl),
                Timeout = TimeSpan.FromMinutes(5)
            };

            Client.DefaultRequestHeaders.Accept.Clear();
            Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Cabeçalhos obrigatórios do Supabase / PostgREST
            Client.DefaultRequestHeaders.Add("apikey", apiKey);
            if (!string.IsNullOrWhiteSpace(jwt))
                Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
        }
    }

    public static class Conexao
    {
        private static readonly IApiConnection _instancia = new ApiConnection();

        public static IApiConnection RetornaConexao(string conexao = null) => _instancia;
        public static IApiConnection RetornaApi() => _instancia;
    }
}