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
            var baseUrl = ConfigurationManager.AppSettings["ApiBaseUrl"] ?? "http://localhost:5000/api/";

            Client = new HttpClient
            {
                BaseAddress = new Uri(baseUrl),
                Timeout = TimeSpan.FromMinutes(5)
            };

            Client.DefaultRequestHeaders.Accept.Clear();
            Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public static class Conexao
    {
        private static readonly IApiConnection _instancia = new ApiConnection();

        // Permite chamar Api.RetornaConexao() ou Api.RetornaApi()
        public static IApiConnection RetornaConexao(int conexao = 0) => _instancia;
        public static IApiConnection RetornaApi() => _instancia;
    }
}