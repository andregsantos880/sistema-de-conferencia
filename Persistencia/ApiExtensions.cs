using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace Persistencia
{
    /// <summary>
    /// Acesso ao Supabase Data API (PostgREST) preservando as assinaturas usadas pelo legado
    /// (Query/Execute/ExecuteScalar/InserirBulk). As instruções SQL simples são traduzidas para
    /// endpoints nativos de tabela; consultas complexas (GROUP BY/JOIN/agregação) caem em RPC.
    /// </summary>
    public static class ApiExtensions
    {
        /// <summary>
        /// Inserção em Lote nativa do Supabase (Substitui o SqlBulkCopy).
        /// Envia a lista diretamente para: POST {base}/rest/v1/{tabela}
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
                return JsonConvert.DeserializeObject<List<T>>(jsonGet) ?? new List<T>();
            }

            // Fallback: consultas complexas (GROUP BY/JOIN/agregação) via função RPC
            var json = PostRpc(api, "rpc/exec_sql", sql);
            return JsonConvert.DeserializeObject<List<T>>(json) ?? new List<T>();
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
                    // count=exact no header Prefer + Range mínimo => Content-Range traz o total
                    request.Headers.Add("Prefer", "count=exact");
                    request.Headers.Add("Range-Unit", "items");
                    request.Headers.Add("Range", "0-0");

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
            return JsonConvert.DeserializeObject<T>(json);
        }

        #region Tradutor SQL -> PostgREST

        private static readonly Regex _complexo = new Regex(
            @"\bGROUP\s+BY\b|\bJOIN\b|\bDISTINCT\b|\b(COUNT|SUM|AVG|MIN|MAX)\s*\(|\bCAST\s*\(|\bTRIM\s*\(|\bUPPER\s*\(|\bLOWER\s*\(|\+\s*'|'\s*\+|\s+OR\s+|\(\s*SELECT\b",
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

            string table = StripTablePrefix(m.Groups["table"].Value.Trim());
            var query = new List<string>();

            string cols = m.Groups["cols"].Value.Trim();
            if (cols != "*")
            {
                var colList = cols.Split(',')
                    .Select(c => StripTablePrefix(c.Trim()))
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
                        string col = StripTablePrefix(parts[0]);
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
                    body[StripTablePrefix(kv[0].Trim())] = ParseValue(kv[1].Trim());
                }

                var query = new List<string>();
                if (mUpd.Groups["where"].Success)
                {
                    List<string> filtros;
                    if (!TryBuildFilters(mUpd.Groups["where"].Value, out filtros))
                        return false;
                    query.AddRange(filtros);
                }

                string table = StripTablePrefix(mUpd.Groups["table"].Value.Trim());
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

                string table = StripTablePrefix(mDel.Groups["table"].Value.Trim());
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

            string table = StripTablePrefix(m.Groups["table"].Value.Trim());
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
                    filtros.Add(StripTablePrefix(mIn.Groups["col"].Value) + "=in.(" + string.Join(",", vals) + ")");
                    continue;
                }

                // col <op> value  (>=, <=, <>, !=, >, <, =)
                var mOp = Regex.Match(c, @"^(?<col>[A-Za-z0-9_\.]+)\s*(?<op>>=|<=|<>|!=|>|<|=)\s*(?<val>.+)$", RegexOptions.Singleline);
                if (mOp.Success)
                {
                    string op = MapOperador(mOp.Groups["op"].Value);
                    string val = UnquoteValue(mOp.Groups["val"].Value.Trim());
                    filtros.Add(StripTablePrefix(mOp.Groups["col"].Value) + "=" + op + "." + val);
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