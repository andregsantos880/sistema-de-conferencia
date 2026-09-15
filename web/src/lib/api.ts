/**
 * Camada de acesso ao Supabase (PostgREST) — equivalente web do
 * Persistencia/ApiExtensions.cs do app WinForms.
 *
 * Diferença importante: aqui não há tradução de SQL. As consultas usam
 * diretamente o Data API do PostgREST (`select=`, filtros `col=eq.valor`)
 * e o RPC `exec_sql` fica reservado para as agregações que o Data API não
 * expressa (aquelas com `+`, CAST e GROUP BY do legado).
 */
import { SUPABASE_KEY, SUPABASE_URL } from './config';

/** Linha da tabela PEDIDO (nomes das colunas do schema legado). */
export type Pedido = {
  id: number;
  arquivo: string | null;
  ordcompra: string | null;
  cliente: string | null;
  pecliente: string | null;
  produto: string | null;
  descricao1: string | null;
  qtde: number | string | null;
  etiqueta: string | null;
  volume: number | string | null;
  sequencia: number | string | null;
  status: number | string | null;
  datainc: string | null;
  idlayout: number | null;
  idbox: number | null;
  flbloqueio: boolean | null;
  pecomputador: string | null;
  /** Calculado no cliente (alias LAYOUT.Nome do JOIN do legado). */
  nmlayout?: string | null;
};

export type Fabrica = { controle: number; nome: string };

export type UsuarioLogado = { id: number; login: string; nome: string | null; nivel: string | null };

/** Campos aceitos no INSERT de PEDIDO (mesmos 19 do InserirBulk<PedidoImport>). */
export type PedidoNovo = Partial<
  Omit<Pedido, 'id' | 'nmlayout'> & { pecoletor: string | null; codcliente: string | null; volume2: number | null }
>;

const TAMANHO_PAGINA = 1000;

function cabecalhos(extra: Record<string, string> = {}): Record<string, string> {
  const base: Record<string, string> = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
  };
  if (SUPABASE_KEY) base.Authorization = `Bearer ${SUPABASE_KEY}`;
  return { ...base, ...extra };
}

async function lerResposta<T>(resposta: Response): Promise<T> {
  const texto = await resposta.text();

  if (!resposta.ok) {
    let mensagem = `${resposta.status} ${resposta.statusText}`;
    if (texto) {
      try {
        const json = JSON.parse(texto) as { message?: string; hint?: string };
        mensagem = json.message ? `${json.message}` : texto;
      } catch {
        mensagem = texto;
      }
    }
    throw new Error(mensagem);
  }

  if (!texto) return undefined as T;
  return JSON.parse(texto) as T;
}

/** GET simples no Data API. */
async function buscar<T>(consulta: string, cabecalhoExtra: Record<string, string> = {}): Promise<T> {
  const resposta = await fetch(`${SUPABASE_URL}${consulta}`, {
    method: 'GET',
    headers: cabecalhos(cabecalhoExtra),
  });
  return lerResposta<T>(resposta);
}

/** Chama uma função RPC (`exec_sql` para agregações, `login_usuario` para o login). */
async function rpc<T>(nome: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${SUPABASE_URL}rpc/${nome}`, {
    method: 'POST',
    headers: cabecalhos(),
    body: JSON.stringify(corpo),
  });
  return lerResposta<T>(resposta);
}

/** Formata lista de textos para o filtro `in` do PostgREST: ("A","B"). */
function listaTexto(valores: string[]): string {
  return `(${valores.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')})`;
}

function listaNumero(valores: Array<number | string>): string {
  return `(${valores.join(',')})`;
}

/* ------------------------------------------------------------------------ */
/* Login                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Autentica via RPC `login_usuario` (SECURITY DEFINER), de forma que a senha
 * nunca precise ser enviada em uma consulta à tabela e o hash/coluna `senha`
 * não seja lido pelo navegador.
 * Ver supabase/migrations/20260914000005_rpc_login_usuario.sql.
 */
export async function login(usuario: string, senha: string): Promise<UsuarioLogado | null> {
  const linhas = await rpc<UsuarioLogado[]>('login_usuario', {
    p_login: usuario.trim(),
    p_senha: senha,
  });
  if (!Array.isArray(linhas) || linhas.length === 0) return null;
  return linhas[0];
}

/* ------------------------------------------------------------------------ */
/* Cadastros                                                                 */
/* ------------------------------------------------------------------------ */

/** Fábricas ativas (equivalente ao SELECT NOME, CONTROLE FROM LAYOUT WHERE FlAtivo = 1). */
export async function listarFabricas(): Promise<Fabrica[]> {
  const fabricas = await buscar<Fabrica[]>('layout?select=controle,nome&flativo=eq.1&order=nome');
  return [...fabricas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Nomes dos boxes ativos (tabela BOX, incluída para o grid). */
export async function listarBoxes(): Promise<Array<{ idbox: number; nmbox: string }>> {
  return buscar<Array<{ idbox: number; nmbox: string }>>('box?select=idbox,nmbox&ativo=eq.1&order=nmbox');
}

/* ------------------------------------------------------------------------ */
/* Pedidos                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Carrega todos os pedidos de uma fábrica, paginando de 1000 em 1000
 * (limite padrão de linhas do PostgREST).
 */
export async function listarPedidos(idlayout: number): Promise<Pedido[]> {
  const todos: Pedido[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const fim = inicio + TAMANHO_PAGINA - 1;
    const pagina = await buscar<Pedido[]>(`pedido?select=*&idlayout=eq.${idlayout}&order=id`, {
      Range: `${inicio}-${fim}`,
      'Range-Unit': 'items',
    });

    todos.push(...pagina);
    if (pagina.length < TAMANHO_PAGINA) break;
    if (todos.length >= 50000) break; // trava de segurança
  }

  return todos;
}

/** Atualiza o status por ID (Form1.AlterarStatus). Devolve a quantidade de linhas. */
export async function atualizarStatusPorIds(ids: Array<number | string>, status: number): Promise<number> {
  if (ids.length === 0) return 0;
  const resposta = await fetch(`${SUPABASE_URL}pedido?id=in.${listaNumero(ids)}`, {
    method: 'PATCH',
    headers: cabecalhos({ Prefer: 'count=exact,return=minimal' }),
    body: JSON.stringify({ status }),
  });
  await lerResposta<unknown>(resposta);
  return ids.length;
}

/** Atualiza o status por etiqueta (Form1: UPDATE ... WHERE ETIQUETA IN(...)). */
export async function atualizarStatusPorEtiquetas(etiquetas: string[], status: number): Promise<number> {
  const validas = etiquetas.map((e) => e.trim()).filter(Boolean);
  if (validas.length === 0) return 0;

  const resposta = await fetch(`${SUPABASE_URL}pedido?etiqueta=in.${listaTexto(validas)}`, {
    method: 'PATCH',
    headers: cabecalhos({ Prefer: 'count=exact,return=minimal' }),
    body: JSON.stringify({ status }),
  });
  await lerResposta<unknown>(resposta);
  return validas.length;
}

/** Insere pedidos (substitui o InserirBulk do WinForms). */
export async function inserirPedidos(linhas: PedidoNovo[]): Promise<number> {
  if (linhas.length === 0) return 0;

  for (let i = 0; i < linhas.length; i += TAMANHO_PAGINA) {
    const lote = linhas.slice(i, i + TAMANHO_PAGINA);
    const resposta = await fetch(`${SUPABASE_URL}pedido`, {
      method: 'POST',
      headers: cabecalhos({ Prefer: 'return=minimal' }),
      body: JSON.stringify(lote),
    });
    await lerResposta<unknown>(resposta);
  }

  return linhas.length;
}

/* ------------------------------------------------------------------------ */
/* Busca (combo "buscar em" do Form1)                                        */
/* ------------------------------------------------------------------------ */

export type ItemBusca = { valor: string; descricao: string };

/**
 * Reproduz as consultas do Form1.cs (linhas 436/439/442), que usam concatenação
 * com `+`, CAST e GROUP BY — por isso vão pelo RPC exec_sql.
 */
export async function buscarValores(idlayout: number, coluna: string): Promise<ItemBusca[]> {
  const colunaSegura = ['ORDCOMPRA', 'PECLIENTE', 'ARQUIVO'].includes(coluna) ? coluna : 'ORDCOMPRA';
  const filtroData = colunaSegura === 'ARQUIVO' ? ` AND DATAINC >= '2023-12-10 00:00:00.000'` : '';

  const sql =
    `SELECT ${colunaSegura} + ' (' + CAST(COUNT(${colunaSegura}) AS VARCHAR(5)) + ')' AS Descricao, ` +
    `${colunaSegura} AS Valor FROM PEDIDO WHERE Idlayout = ${Number(idlayout)}${filtroData} ` +
    `GROUP BY ${colunaSegura} ORDER BY ${colunaSegura}`;

  const bruto = await rpc<unknown>('exec_sql', { sql_query: sql });

  // exec_sql devolve json_agg; dependendo do driver chega como array ou string JSON.
  const linhas = typeof bruto === 'string' ? (JSON.parse(bruto) as Array<Record<string, string>>) : (bruto as Array<Record<string, string>>);

  return (linhas ?? []).map((l) => ({
    valor: String(l.Valor ?? l.valor ?? ''),
    descricao: String(l.Descricao ?? l.descricao ?? ''),
  }));
}

export { listaTexto, listaNumero };
