using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Entidade.Models;
using Newtonsoft.Json; // ou System.Text.Json se for .NET Core/.NET 6+

namespace Sysconf.Persistencia
{
    public static class ApiService
    {
        private static readonly HttpClient _httpClient;
        private static readonly string _baseUrl;

        static ApiService()
        {
            // Lê do App.config ou define uma URL padrão
            _baseUrl = ConfigurationManager.AppSettings["ApiBaseUrl"] ?? "http://localhost:5000/api/";

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl),
                Timeout = TimeSpan.FromSeconds(30)
            };

            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        #region Helpers de Envio e Desserialização

        private static T Get<T>(string endpoint)
        {
            var response = _httpClient.GetAsync(endpoint).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();
            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<T>(json);
        }

        private static TResponse Post<TRequest, TResponse>(string endpoint, TRequest data)
        {
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var response = _httpClient.PostAsync(endpoint, content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();
            var json = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<TResponse>(json);
        }

        private static void Put<TRequest>(string endpoint, TRequest data)
        {
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var response = _httpClient.PutAsync(endpoint, content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();
        }

        #endregion

        #region Métodos de Negócio

        // 1. Autenticação (Substitui FormLogin.cs:113)
        public static int AutenticarUsuario(string login, string senha)
        {
            var payload = new { Login = login, Senha = senha };
            return Post<object, int>("usuario/autenticar", payload);
        }

        // 2. Listagem de Fábricas (Substitui Form1.cs:230 e TabeLayo.cs:31)
        public static List<Fabrica> ObterFabricas(bool apenasAtivas = true, bool ordenarPorNome = true)
        {
            return Get<List<Fabrica>>($"layout/fabricas?ativo={apenasAtivas}&ordenar={ordenarPorNome}");
        }

        // 3. Atualizar Status por IDs (Substitui Form1.cs:301)
        public static void AtualizarStatusPedidosPorIds(int status, IEnumerable<string> ids)
        {
            var payload = new { Status = status, Ids = ids };
            Put("pedidos/status-por-ids", payload);
        }

        // 4. Atualizar Status por Etiquetas (Substitui Form1.cs:332)
        public static void AtualizarStatusPedidosPorEtiquetas(int status, IEnumerable<string> etiquetas)
        {
            var payload = new { Status = status, Etiquetas = etiquetas };
            Put("pedidos/status-por-etiquetas", payload);
        }

        // 5. Consulta de Resumo/Itens (Substitui Form1.cs:448)
        public static List<ItemValue> ObterResumoItens(object queryParam)
        {
            return Post<object, List<ItemValue>>("pedidos/resumo-itens", queryParam);
        }

        // 6. Consulta de Pedidos com Filtros (Substitui Form1.cs:521)
        public static List<Pedido> ConsultarPedidos(object filtro)
        {
            return Post<object, List<Pedido>>("pedidos/consultar", filtro);
        }

        // 7. Importação em Lote / Bulk (Substitui daPedido.cs:24)
        public static void ImportarPedidosBulk(object dadosImportacao)
        {
            Post<object, bool>("pedidos/importar-bulk", dadosImportacao);
        }

        // 8. Health Check / Conexão (Substitui daSistema.cs:11-12)
        public static bool TestarConexaoApi()
        {
            try
            {
                var response = _httpClient.GetAsync("sistema/status").GetAwaiter().GetResult();
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }
}