using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Persistencia
{
    /// <summary>
    /// Acesso ao Supabase Data API (PostgREST) preservando as assinaturas usadas pelo legado
    /// (Query/Execute/ExecuteScalar/InserirBulk). As instruções SQL simples são traduzidas para
    /// endpoints nativos de tabela; consultas complexas (GROUP BY/JOIN/agregação) caem em RPC.
    /// </summary>
    /// <remarks>
    /// CONVERSÃO DE NOMES (obrigatória): o SQL Server do legado é case-insensitive e escreve os
    /// identificadores em MAIÚSCULO/PascalCase, enquanto o PostgreSQL/PostgREST do Supabase exige
    /// os identificadores exatos do schema. O banco do Supabase FOI SUBSTITUÍDO pelo schema legado
    /// com os nomes apenas em minúsculo (<c>pedido</c>, <c>layout</c>, <c>usuario</c> com
    /// <c>controle</c>, <c>flativo</c>, <c>descricao1</c>, <c>idlayout</c>...), portanto a conversão
    /// é apenas "minusculizar", feita AQUI em um único ponto:
    /// <list type="bullet">
    /// <item>ENTRADA (cliente -&gt; banco): nomes de tabela e coluna na URL/body passam por
    /// <see cref="TabelaParaBanco"/> e <see cref="ColunaParaBanco"/>.</item>
    /// <item>SAÍDA (banco -&gt; cliente): o JSON devolvido é lido com o
    /// <see cref="LegacyNameContractResolver"/>, aplicando a mesma conversão, de modo que
    /// <c>nmlayout</c>/<c>idlayout</c> cheguem nas propriedades NmLayout/IdLayout.</item>
    /// </list>
    /// Exceções pontuais de nome ficam nas tabelas <see cref="_tabelas"/> e <see cref="_colunas"/>.
    /// </remarks>
    public static class ApiExtensions
    {
        #region Conversão de nomes (cliente <-> banco)

        /// <summary>
        /// De-para de TABELAS: nome usado pelo legado -> tabela real do schema.
        /// A chave é comparada sem separadores e sem diferenciar maiúsculas, de modo que
        /// "PedidoImport", "PEDIDO_IMPORT" e "pedidoimport" caem no mesmo alvo.
        /// O schema atual só possui <c>pedido</c>, <c>layout</c> e <c>usuario</c>;
        /// qualquer outro nome é apenas minusculizado.
        /// </summary>
        private static readonly Dictionary<string, string> _tabelas = new Dictionary<string, string>
        {
            { "pedido", "pedido" },          // SQL legado: PEDIDO
            { "pedidoimport", "pedido" },    // DTO Entidade.PedidoImport  (InserirBulk)
            { "pedidoimportbulk", "pedido" },
            { "vopedido", "pedido" },        // DTO Entidade.voPedido
            { "layout", "layout" },          // SQL legado: LAYOUT
            { "usuario", "usuario" },        // SQL legado: USUARIO
        };

        /// <summary>
        /// De-para de COLUNAS para exceções de nome. Vazio de propósito: o schema do Supabase
        /// usa os MESMOS nomes do legado, apenas em minúsculo, então a conversão padrão
        /// (minusculizar) já resolve tudo (CONTROLE -> controle, IdLayout -> idlayout).
        /// Use este dicionário apenas se alguma coluna for renomeada no futuro.
        /// </summary>
        private static readonly Dictionary<string, string> _colunas = new Dictionary<string, string>
        {
        };

        /// <summary>
        /// SAÍDA (banco -> cliente): o JSON do PostgREST vem com os nomes em minúsculo e os modelos
        /// do legado são PascalCase/MAIÚSCULO. O resolver aplica a MESMA conversão, então
        /// "idlayout" volta para IdLayout, "nmlayout" para NmLayout e "descricao1" para Descricao1.
        /// </summary>
        private sealed class LegacyNameContractResolver : DefaultContractResolver
        {
            protected override string ResolvePropertyName(string propertyName)
            {
                return ColunaParaBanco(propertyName);
            }

            protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
            {
                JsonProperty propriedade = base.CreateProperty(member, memberSerialization);

                // Os modelos do legado declaram as propriedades com setter `internal`
                // (ex.: App/Models/Pedido.cs -> "public string Etiqueta { get; internal set; }").
                // O Json.NET considera esses membros NÃO graváveis e simplesmente os ignora, o que
                // faria toda leitura voltar zerada. Habilitando os setters não públicos, o
                // PostgREST/Supabase preenche normalmente Id, Etiqueta, Produto, IdLayout etc.
                if (!propriedade.Writable)
                {
                    var infoPropriedade = member as PropertyInfo;
                    if (infoPropriedade != null && infoPropriedade.GetSetMethod(true) != null)
                        propriedade.Writable = true;
                }

                return propriedade;
            }
        }

        /// <summary>
        /// Números do banco -> inteiros dos modelos do legado.
        /// Colunas como PEDIDO.QTDE são numeric(18,3) e chegam no JSON como 2.000; o Json.NET
        /// recusa converter isso para int/long e o valor acabaria 0. No legado o Dapper fazia
        /// a conversão (Convert.ChangeType), então este conversor reproduz o mesmo comportamento,
        /// inclusive o arredondamento.
        /// </summary>
        private sealed class NumeroParaInteiroConverter : JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(int) || objectType == typeof(long) ||
                       objectType == typeof(short) || objectType == typeof(int?) ||
                       objectType == typeof(long?);
            }

            public override bool CanWrite { get { return false; } }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                if (reader.TokenType == JsonToken.Null || reader.Value == null)
                    return null;

                object valor = reader.Value;
                Type destino = Nullable.GetUnderlyingType(objectType) ?? objectType;

                if (valor is string)
                {
                    decimal numero;
                    if (!decimal.TryParse((string)valor, NumberStyles.Any, CultureInfo.InvariantCulture, out numero))
                        return null;
                    valor = numero;
                }

                return Convert.ChangeType(valor, destino, CultureInfo.InvariantCulture);
            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                writer.WriteValue(value);
            }
        }

        private static readonly JsonSerializerSettings _jsonSaida = new JsonSerializerSettings
        {
            ContractResolver = new LegacyNameContractResolver(),
            Converters = { new NumeroParaInteiroConverter() },
            // Rede de segurança: se algum valor do banco não puder ser convertido para o tipo do
            // modelo legado (ex.: nulo em propriedade int), mantém o valor padrão do membro em vez
            // de abortar a consulta inteira.
            Error = (sender, args) => { args.ErrorContext.Handled = true; }
        };

        /// <summary>ENTRADA: tabela do legado -> tabela do banco (minúsculo).</summary>
        private static string TabelaParaBanco(string tabela)
        {
            if (string.IsNullOrWhiteSpace(tabela))
                return tabela;

            string alvo;
            if (_tabelas.TryGetValue(Compactar(tabela), out alvo))
                return alvo;

            return ParaMinusculo(tabela);
        }

        /// <summary>ENTRADA/SAÍDA: coluna do legado -> coluna do banco (minúsculo).</summary>
        private static string ColunaParaBanco(string coluna)
        {
            if (string.IsNullOrWhiteSpace(coluna))
                return coluna;

            string alvo;
            if (_colunas.TryGetValue(Compactar(coluna), out alvo))
                return alvo;

            return ParaMinusculo(coluna);
        }

        /// <summary>Remove prefixo de tabela (TABELA.COLUNA) e delimitadores ([ ], " ").</summary>
        private static string LimparIdentificador(string identificador)
        {
            string nome = StripTablePrefix(identificador.Trim());
            return nome.Trim(' ', '[', ']', '"', '`');
        }

        /// <summary>Chave de busca do de-para: minúscula e sem separadores.</summary>
        private static string Compactar(string identificador)
        {
            return LimparIdentificador(identificador).Replace("_", string.Empty).ToLowerInvariant();
        }

        /// <summary>
        /// Conversão padrão: MAIÚSCULO/PascalCase -> minúsculo (ex.: CONTROLE -> controle,
        /// IdLayout -> idlayout). É exatamente o que o PostgreSQL faz ao dobrar identificadores
        /// não citados, e o que o schema legado do Supabase espera.
        /// </summary>
        private static string ParaMinusculo(string identificador)
        {
            string nome = LimparIdentificador(identificador);
            return nome == null ? null : nome.ToLowerInvariant();
        }

        #endregion

        /// <summary>
        /// Inserção em Lote nativa do Supabase (Substitui o SqlBulkCopy).
        /// Envia a lista diretamente para: POST {base}/rest/v1/{tabela}
        /// </summary>
        public static void InserirBulk<T>(this IApiConnection api, List<T> lista)
        {
            if (lista == null || lista.Count == 0)
                return;

            // Tabela de destino convertida para o schema real (ex: "PedidoImport" -> "pedido")
            string tabela = TabelaParaBanco(typeof(T).Name);

            // Conversão ENTRADA: cada propriedade do DTO vira o nome de coluna do banco
            // (ex: DATAINC -> datainc, PECLIENTE -> pecliente, IdLayout -> idlayout).
            var registros = new List<Dictionary<string, object>>(lista.Count);
            var propriedades = typeof(T).GetProperties();
            foreach (var item in lista)
            {
                var registro = new Dictionary<string, object>(propriedades.Length);
                foreach (var prop in propriedades)
                {
                    if (!prop.CanRead)
                        continue;

                    object valor = prop.GetValue(item, null);
                    registro[ColunaParaBanco(prop.Name)] = valor;
                }
                registros.Add(registro);
            }

            var json = JsonConvert.SerializeObject(registros);
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
        /// Executa SELECT no Supabase Data API preservando a assinatura Query&lt;T&gt;.
        /// Traduz a SQL para o endpoint nativo de tabela; se não for suportado, usa RPC.
        /// </summary>
        public static IEnumerable<T> Query<T>(this IApiConnection api, string sql, object param = null)
        {
            string url;
            if (TryBuildSelectUrl(sql, out url))
            {
                var respGet = api.Client.GetAsync(url).GetAwaiter().GetResult();
                respGet.EnsureSuccessStatusCode();
                var jsonGet = respGet.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                return JsonConvert.DeserializeObject<List<T>>(jsonGet, _jsonSaida) ?? new List<T>();
            }

            // Fallback: consultas complexas (GROUP BY/JOIN/agregação) via função RPC
            var json = PostRpc(api, "rpc/exec_sql", sql);
            return JsonConvert.DeserializeObject<List<T>>(json, _jsonSaida) ?? new List<T>();
        }

        /// <summary>
        /// Executa UPDATE/DELETE no Supabase Data API preservando a assinatura Execute.
        /// Traduz para PATCH/DELETE nativo; se não for suportado, usa RPC.
        /// </summary>
        public static int Execute(this IApiConnection api, string sql, object param = null)
        {
            HttpRequestMessage request;
            if (TryBuildDmlRequest(sql, out request))
            {
                using (request)
                {
                    var resp = api.Client.SendAsync(request).GetAwaiter().GetResult();
                    resp.EnsureSuccessStatusCode();

                    int afetadas;
                    if (TryGetContentRangeCount(resp, out afetadas))
                        return afetadas;

                    var body = resp.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    var arr = SafeDeserializeArrayCount(body);
                    return arr >= 0 ? arr : 0;
                }
            }

            // Fallback: comandos complexos via função RPC
            var json = PostRpc(api, "rpc/exec_dml", sql);
            int linhas;
            if (int.TryParse(json, out linhas))
                return linhas;
            return 1;
        }

        /// <summary>
        /// Executa consultas escalares (ex: COUNT) preservando a assinatura ExecuteScalar&lt;T&gt;.
        /// Traduz COUNT(*) para contagem nativa do PostgREST; senão usa RPC.
        /// </summary>
        public static T ExecuteScalar<T>(this IApiConnection api, string sql, object param = null)
        {
            string countUrl;
            if (TryBuildCountUrl(sql, out countUrl))
            {
                using (var request = new HttpRequestMessage(HttpMethod.Get, countUrl))
                {
                    // count=exact no header Prefer + Range mínimo => Content-Range traz o total.
                    // ATENÇÃO: "Range" é um header conhecido do .NET e exige "unit=from-to"
                    // (o valor cru "0-0" lança FormatException antes de qualquer requisição).
                    request.Headers.Add("Prefer", "count=exact");
                    request.Headers.Add("Range-Unit", "items");
                    request.Headers.Add("Range", "items=0-0");

                    var resp = api.Client.SendAsync(request).GetAwaiter().GetResult();
                    resp.EnsureSuccessStatusCode();

                    int total;
                    if (TryGetContentRangeCount(resp, out total))
                        return (T)Convert.ChangeType(total, typeof(T));

                    return (T)Convert.ChangeType(0, typeof(T));
                }
            }

            // Fallback: escalares complexos via função RPC
            var json = PostRpc(api, "rpc/exec_scalar", sql);
            return JsonConvert.DeserializeObject<T>(json, _jsonSaida);
        }

        #region Tradutor SQL -> PostgREST

        private static readonly Regex _complexo = new Regex(
            @"\bGROUP\s+BY\b|\bJOIN\b|\bDISTINCT\b|\b(COUNT|SUM|AVG|MIN|MAX)\s*\(|\bCAST\s*\(|\bTRIM\s*\(|\bUPPER\s*\(|\bLOWER\s*\(|\+\s*'|'\s*\+|\bAS\s+[A-Za-z_\[]|\s+OR\s+|\(\s*SELECT\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static bool TryBuildSelectUrl(string sql, out string url)
        {
            url = null;
            if (string.IsNullOrWhiteSpace(sql))
                return false;

            string s = sql.Trim().TrimEnd(';').Trim();

            if (_complexo.IsMatch(s))
                return false;

            var m = Regex.Match(
                s,
                @"^SELECT\s+(?<cols>.+?)\s+FROM\s+(?<table>[A-Za-z0-9_\.]+)(?:\s+WHERE\s+(?<where>.+?))?(?:\s+ORDER\s+BY\s+(?<order>.+?))?$",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (!m.Success)
                return false;

            string table = TabelaParaBanco(m.Groups["table"].Value);
            var query = new List<string>();

            string cols = m.Groups["cols"].Value.Trim();
            if (cols != "*")
            {
                var colList = cols.Split(',')
                    .Select(c => ColunaParaBanco(c))
                    .Where(c => c.Length > 0);
                query.Add("select=" + string.Join(",", colList));
            }

            if (m.Groups["where"].Success)
            {
                List<string> filtros;
                if (!TryBuildFilters(m.Groups["where"].Value, out filtros))
                    return false;
                query.AddRange(filtros);
            }

            if (m.Groups["order"].Success)
            {
                var orderCols = m.Groups["order"].Value
                    .Split(',')
                    .Select(o => o.Trim())
                    .Where(o => o.Length > 0)
                    .Select(o =>
                    {
                        var parts = o.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        string col = ColunaParaBanco(parts[0]);
                        if (parts.Length > 1 && parts[1].Equals("DESC", StringComparison.OrdinalIgnoreCase))
                            return col + ".desc";
                        return col;
                    });
                query.Add("order=" + string.Join(",", orderCols));
            }

            url = table + (query.Count > 0 ? "?" + string.Join("&", query) : string.Empty);
            return true;
        }

        private static bool TryBuildDmlRequest(string sql, out HttpRequestMessage request)
        {
            request = null;
            if (string.IsNullOrWhiteSpace(sql))
                return false;

            string s = sql.Trim().TrimEnd(';').Trim();

            // UPDATE <tabela> SET c1=v1[, c2=v2] WHERE <cond>
            var mUpd = Regex.Match(
                s,
                @"^UPDATE\s+(?<table>[A-Za-z0-9_\.]+)\s+SET\s+(?<set>.+?)(?:\s+WHERE\s+(?<where>.+?))?$",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (mUpd.Success)
            {
                if (_complexo.IsMatch(mUpd.Groups["set"].Value))
                    return false;

                var body = new Dictionary<string, object>();
                foreach (var atrib in SplitTopLevel(mUpd.Groups["set"].Value, ','))
                {
                    var kv = atrib.Split(new[] { '=' }, 2);
                    if (kv.Length != 2)
                        return false;
                    body[ColunaParaBanco(kv[0])] = ParseValue(kv[1].Trim());
                }

                var query = new List<string>();
                if (mUpd.Groups["where"].Success)
                {
                    List<string> filtros;
                    if (!TryBuildFilters(mUpd.Groups["where"].Value, out filtros))
                        return false;
                    query.AddRange(filtros);
                }

                string table = TabelaParaBanco(mUpd.Groups["table"].Value);
                string url = table + (query.Count > 0 ? "?" + string.Join("&", query) : string.Empty);

                request = new HttpRequestMessage(new HttpMethod("PATCH"), url)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json")
                };
                request.Headers.Add("Prefer", "count=exact");
                return true;
            }

            // DELETE FROM <tabela> WHERE <cond>
            var mDel = Regex.Match(
                s,
                @"^DELETE\s+FROM\s+(?<table>[A-Za-z0-9_\.]+)(?:\s+WHERE\s+(?<where>.+?))?$",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (mDel.Success)
            {
                var query = new List<string>();
                if (mDel.Groups["where"].Success)
                {
                    List<string> filtros;
                    if (!TryBuildFilters(mDel.Groups["where"].Value, out filtros))
                        return false;
                    query.AddRange(filtros);
                }

                string table = TabelaParaBanco(mDel.Groups["table"].Value);
                string url = table + (query.Count > 0 ? "?" + string.Join("&", query) : string.Empty);

                request = new HttpRequestMessage(HttpMethod.Delete, url);
                request.Headers.Add("Prefer", "count=exact");
                return true;
            }

            return false;
        }

        private static bool TryBuildCountUrl(string sql, out string url)
        {
            url = null;
            if (string.IsNullOrWhiteSpace(sql))
                return false;

            string s = sql.Trim().TrimEnd(';').Trim();

            var m = Regex.Match(
                s,
                @"^SELECT\s+COUNT\s*\(\s*\*\s*\)\s+FROM\s+(?<table>[A-Za-z0-9_\.]+)(?:\s+WHERE\s+(?<where>.+?))?$",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (!m.Success)
                return false;

            var query = new List<string>();
            if (m.Groups["where"].Success)
            {
                List<string> filtros;
                if (!TryBuildFilters(m.Groups["where"].Value, out filtros))
                    return false;
                query.AddRange(filtros);
            }

            string table = TabelaParaBanco(m.Groups["table"].Value);
            // select mínimo para reduzir payload; a contagem vem no Content-Range
            query.Insert(0, "select=" + FirstFilterColumn(query));
            url = table + "?" + string.Join("&", query);
            return true;
        }

        private static string FirstFilterColumn(List<string> query)
        {
            // Usa a primeira coluna de filtro para o select mínimo; senão, "*"
            foreach (var q in query)
            {
                int eq = q.IndexOf('=');
                if (eq > 0)
                {
                    string col = q.Substring(0, eq);
                    if (col != "select" && col != "order")
                        return col;
                }
            }
            return "*";
        }

        private static bool TryBuildFilters(string where, out List<string> filtros)
        {
            filtros = new List<string>();
            if (string.IsNullOrWhiteSpace(where))
                return true;

            if (Regex.IsMatch(where, @"\s+OR\s+", RegexOptions.IgnoreCase))
                return false;

            foreach (var cond in SplitByAnd(where))
            {
                string c = cond.Trim();
                if (c.Length == 0)
                    continue;

                // col IN (v1, v2, ...)
                var mIn = Regex.Match(c, @"^(?<col>[A-Za-z0-9_\.]+)\s+IN\s*\((?<vals>.+)\)$", RegexOptions.IgnoreCase | RegexOptions.Singleline);
                if (mIn.Success)
                {
                    var vals = SplitTopLevel(mIn.Groups["vals"].Value, ',')
                        .Select(v => FormatInValue(v.Trim()));
                    filtros.Add(ColunaParaBanco(mIn.Groups["col"].Value) + "=in.(" + string.Join(",", vals) + ")");
                    continue;
                }

                // col <op> value  (>=, <=, <>, !=, >, <, =)
                var mOp = Regex.Match(c, @"^(?<col>[A-Za-z0-9_\.]+)\s*(?<op>>=|<=|<>|!=|>|<|=)\s*(?<val>.+)$", RegexOptions.Singleline);
                if (mOp.Success)
                {
                    string op = MapOperador(mOp.Groups["op"].Value);
                    string val = UnquoteValue(mOp.Groups["val"].Value.Trim());
                    filtros.Add(ColunaParaBanco(mOp.Groups["col"].Value) + "=" + op + "." + val);
                    continue;
                }

                return false;
            }

            return true;
        }

        private static string MapOperador(string op)
        {
            switch (op)
            {
                case "=": return "eq";
                case ">": return "gt";
                case "<": return "lt";
                case ">=": return "gte";
                case "<=": return "lte";
                case "<>":
                case "!=": return "neq";
                default: return "eq";
            }
        }

        private static string StripTablePrefix(string identifier)
        {
            if (string.IsNullOrEmpty(identifier))
                return identifier;
            int dot = identifier.LastIndexOf('.');
            return dot >= 0 ? identifier.Substring(dot + 1) : identifier;
        }

        private static object ParseValue(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("'") && raw.EndsWith("'") && raw.Length >= 2)
                return raw.Substring(1, raw.Length - 2).Replace("''", "'");
            int i;
            if (int.TryParse(raw, out i))
                return i;
            double d;
            if (double.TryParse(raw, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out d))
                return d;
            if (raw.Equals("NULL", StringComparison.OrdinalIgnoreCase))
                return null;
            return raw;
        }

        private static string UnquoteValue(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("'") && raw.EndsWith("'") && raw.Length >= 2)
                return raw.Substring(1, raw.Length - 2).Replace("''", "'");
            return raw;
        }

        private static string FormatInValue(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("'") && raw.EndsWith("'") && raw.Length >= 2)
            {
                string inner = raw.Substring(1, raw.Length - 2).Replace("''", "'");
                return "\"" + inner.Replace("\"", "\\\"") + "\"";
            }
            return raw;
        }

        private static IEnumerable<string> SplitByAnd(string where)
        {
            // Split por " AND " no nível superior (fora de parênteses e aspas)
            return SplitTopLevelKeyword(where, "AND");
        }

        private static IEnumerable<string> SplitTopLevel(string input, char separator)
        {
            var parts = new List<string>();
            int depth = 0;
            bool inStr = false;
            var sb = new StringBuilder();
            foreach (char ch in input)
            {
                if (ch == '\'')
                    inStr = !inStr;
                if (!inStr)
                {
                    if (ch == '(') depth++;
                    else if (ch == ')') depth--;
                    else if (ch == separator && depth == 0)
                    {
                        parts.Add(sb.ToString());
                        sb.Clear();
                        continue;
                    }
                }
                sb.Append(ch);
            }
            if (sb.Length > 0)
                parts.Add(sb.ToString());
            return parts;
        }

        private static IEnumerable<string> SplitTopLevelKeyword(string input, string keyword)
        {
            var parts = new List<string>();
            int depth = 0;
            bool inStr = false;
            int i = 0;
            int start = 0;
            while (i < input.Length)
            {
                char ch = input[i];
                if (ch == '\'')
                    inStr = !inStr;
                if (!inStr)
                {
                    if (ch == '(') depth++;
                    else if (ch == ')') depth--;
                    else if (depth == 0 &&
                             i + keyword.Length <= input.Length &&
                             string.Compare(input, i, keyword, 0, keyword.Length, StringComparison.OrdinalIgnoreCase) == 0 &&
                             (i == 0 || char.IsWhiteSpace(input[i - 1])) &&
                             (i + keyword.Length == input.Length || char.IsWhiteSpace(input[i + keyword.Length])))
                    {
                        parts.Add(input.Substring(start, i - start));
                        i += keyword.Length;
                        start = i;
                        continue;
                    }
                }
                i++;
            }
            parts.Add(input.Substring(start));
            return parts;
        }

        private static bool TryGetContentRangeCount(HttpResponseMessage resp, out int count)
        {
            count = 0;
            IEnumerable<string> values;
            if ((resp.Content != null && resp.Content.Headers.TryGetValues("Content-Range", out values)) ||
                resp.Headers.TryGetValues("Content-Range", out values))
            {
                var header = values.FirstOrDefault();
                if (!string.IsNullOrEmpty(header))
                {
                    int slash = header.LastIndexOf('/');
                    if (slash >= 0)
                    {
                        string totalStr = header.Substring(slash + 1);
                        if (int.TryParse(totalStr, out count))
                            return true;
                    }
                }
            }
            return false;
        }

        private static int SafeDeserializeArrayCount(string body)
        {
            if (string.IsNullOrWhiteSpace(body))
                return -1;
            try
            {
                var arr = JsonConvert.DeserializeObject<List<object>>(body);
                return arr != null ? arr.Count : -1;
            }
            catch
            {
                return -1;
            }
        }

        private static string PostRpc(IApiConnection api, string endpoint, string sql)
        {
            var payload = new { sql_query = sql };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            var response = api.Client.PostAsync(endpoint, content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();
            return response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
        }

        #endregion
    }
}