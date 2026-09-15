/**
 * Camada de acesso ao Supabase (PostgREST) do app web.
 *
 * Multi-empresa: TODA consulta é filtrada por `empresa_id` (a empresa vem do
 * slug da URL). O login é feito pelo RPC `login_usuario(slug, login, senha)`.
 *
 * As agregações com `+`, CAST e GROUP BY do legado vão pelo RPC `exec_sql`
 * (o Data API não expressa essas consultas).
 */
import { SUPABASE_KEY, SUPABASE_URL } from './config';
import { temIntegracao } from './integracao';

export type Empresa = { id: number; slug: string; nome: string; ativo: number; trial_ate?: string | null };

export type Pedido = {
  id: number;
  empresa_id?: number | null;
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
  /** Alias de LAYOUT.Nome vindo do JOIN do legado. */
  nmlayout?: string | null;
};

/** Fábrica = LAYOUT da empresa. `integrada` vem da lista de integrações do legado. */
export type Fabrica = { controle: number; nome: string; integrada: boolean };

export type UsuarioLogado = {
  id: number;
  login: string;
  nome: string | null;
  perfil: string;
  empresa_id: number;
  empresa_slug: string;
  empresa_nome: string;
};

export type UsuarioEmpresa = {
  id: number;
  login: string;
  nome: string | null;
  perfil: string;
  ativo: boolean;
};

export type ItemBusca = { valor: string; descricao: string };

/** Campos aceitos no INSERT de PEDIDO (os 19 do InserirBulk legado + empresa). */
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
        const json = JSON.parse(texto) as { message?: string };
        mensagem = json.message ?? texto;
      } catch {
        mensagem = texto;
      }
    }
    throw new Error(mensagem);
  }

  if (!texto) return undefined as T;
  return JSON.parse(texto) as T;
}

async function buscar<T>(consulta: string, cabecalhoExtra: Record<string, string> = {}): Promise<T> {
  const resposta = await fetch(`${SUPABASE_URL}${consulta}`, {
    method: 'GET',
    headers: cabecalhos(cabecalhoExtra),
  });
  return lerResposta<T>(resposta);
}

async function enviar<T>(
  consulta: string,
  metodo: 'POST' | 'PATCH' | 'DELETE',
  corpo?: unknown,
  cabecalhoExtra: Record<string, string> = {},
): Promise<T> {
  const resposta = await fetch(`${SUPABASE_URL}${consulta}`, {
    method: metodo,
    headers: cabecalhos(cabecalhoExtra),
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return lerResposta<T>(resposta);
}

async function rpc<T>(nome: string, corpo: unknown): Promise<T> {
  return enviar<T>(`rpc/${nome}`, 'POST', corpo);
}

/** Formata lista de textos para o filtro `in` do PostgREST: ("A","B"). */
function listaTexto(valores: string[]): string {
  return `(${valores.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')})`;
}

function listaNumero(valores: Array<number | string>): string {
  return `(${valores.join(',')})`;
}

/* ------------------------------------------------------------------------ */
/* Empresa                                                                   */
/* ------------------------------------------------------------------------ */

/** Resolve a empresa pelo slug da URL (cadastro é feito pelo banco). */
export async function obterEmpresa(slug: string): Promise<Empresa | null> {
  const empresas = await buscar<Empresa[]>(
    `empresa?select=id,slug,nome,ativo,trial_ate&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  return empresas[0] ?? null;
}

/** Lista as empresas ativas — usada apenas na tela de aviso quando falta o slug. */
export async function listarEmpresas(): Promise<Empresa[]> {
  return buscar<Empresa[]>('empresa?select=id,slug,nome,ativo&ativo=eq.1&order=nome');
}

/* ------------------------------------------------------------------------ */
/* Login                                                                     */
/* ------------------------------------------------------------------------ */

/** Login validado dentro da empresa (RPC login_usuario). */
export async function login(slug: string, usuario: string, senha: string): Promise<UsuarioLogado | null> {
  const linhas = await rpc<UsuarioLogado[]>('login_usuario', {
    p_empresa: slug,
    p_login: usuario.trim(),
    p_senha: senha,
  });
  if (!Array.isArray(linhas) || linhas.length === 0) return null;
  return linhas[0];
}

/* ------------------------------------------------------------------------ */
/* Autocadastro (landing)                                                    */
/* ------------------------------------------------------------------------ */

export type DadosRegistro = {
  /** Nome da empresa (aparece no sistema). */
  empresa: string;
  /** Endereco que vai na URL: /sysconf/<slug>/login */
  slug: string;
  login: string;
  senha: string;
  nome?: string;
  email?: string;
};

/**
 * Cria a empresa + o primeiro usuario ADMIN (30 dias de teste) e devolve a
 * sessao pronta. As regras ficam no RPC `registrar_empresa` (SECURITY DEFINER):
 * a tabela `empresa` nao aceita mais escrita pela chave publishable.
 */
export async function registrarEmpresa(dados: DadosRegistro): Promise<UsuarioLogado> {
  const linhas = await rpc<UsuarioLogado[]>('registrar_empresa', {
    p_empresa: dados.empresa.trim(),
    p_slug: dados.slug.trim().toLowerCase(),
    p_login: dados.login.trim(),
    p_senha: dados.senha,
    p_nome: dados.nome?.trim() || null,
    p_email: dados.email?.trim() || null,
  });

  const criado = Array.isArray(linhas) ? linhas[0] : undefined;
  if (!criado) throw new Error('O cadastro foi aceito, mas a sessao nao foi devolvida. Entre com o usuario criado.');
  return criado;
}

/* ------------------------------------------------------------------------ */
/* Cadastros da empresa                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Fábricas da empresa. As que TÊM INTEGRAÇÃO ficam fixadas no topo da lista
 * (ver `lib/integracao.ts`); as demais seguem em ordem alfabética abaixo.
 */
export async function listarFabricas(empresaId: number): Promise<Fabrica[]> {
  const fabricas = await buscar<Array<{ controle: number; nome: string }>>(
    `layout?select=controle,nome&empresa_id=eq.${empresaId}&flativo=eq.1&order=nome`,
  );
  return fabricas
    .map((fabrica) => ({ ...fabrica, integrada: temIntegracao(fabrica.nome) }))
    .sort(
      (a, b) =>
        Number(b.integrada) - Number(a.integrada) || a.nome.localeCompare(b.nome, 'pt-BR'),
    );
}

export async function listarBoxes(empresaId: number): Promise<Array<{ idbox: number; nmbox: string }>> {
  return buscar<Array<{ idbox: number; nmbox: string }>>(
    `box?select=idbox,nmbox&empresa_id=eq.${empresaId}&ativo=eq.1&order=nmbox`,
  );
}

/* ------------------------------------------------------------------------ */
/* Pedidos                                                                   */
/* ------------------------------------------------------------------------ */

export async function listarPedidos(empresaId: number, idlayout: number): Promise<Pedido[]> {
  const todos: Pedido[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const fim = inicio + TAMANHO_PAGINA - 1;
    const pagina = await buscar<Pedido[]>(
      `pedido?select=*&empresa_id=eq.${empresaId}&idlayout=eq.${idlayout}&order=id`,
      { Range: `${inicio}-${fim}`, 'Range-Unit': 'items' },
    );

    todos.push(...pagina);
    if (pagina.length < TAMANHO_PAGINA) break;
    if (todos.length >= 50000) break;
  }

  return todos;
}

/** Baixa de UMA etiqueta — gravada na hora a cada bipagem com sucesso. */
export async function atualizarStatusPorId(
  empresaId: number,
  id: number | string,
  status: number,
): Promise<void> {
  await enviar<unknown>(`pedido?id=eq.${id}&empresa_id=eq.${empresaId}`, 'PATCH', { status }, {
    Prefer: 'return=minimal',
  });
}

/** Alteração do menu de contexto — o legado grava por ETIQUETA. */
export async function atualizarStatusPorEtiquetas(
  empresaId: number,
  etiquetas: string[],
  status: number,
): Promise<number> {
  const validas = etiquetas.map((e) => e.trim()).filter(Boolean);
  if (validas.length === 0) return 0;

  await enviar<unknown>(
    `pedido?empresa_id=eq.${empresaId}&etiqueta=in.${listaTexto(validas)}`,
    'PATCH',
    { status },
    { Prefer: 'return=minimal' },
  );
  return validas.length;
}

/** Importação em lote (as linhas já vêm com empresa_id e idlayout). */
export async function inserirPedidos(linhas: PedidoNovo[]): Promise<number> {
  if (linhas.length === 0) return 0;

  for (let i = 0; i < linhas.length; i += TAMANHO_PAGINA) {
    const lote = linhas.slice(i, i + TAMANHO_PAGINA);
    await enviar<unknown>('pedido', 'POST', lote, { Prefer: 'return=minimal' });
  }

  return linhas.length;
}

/* ------------------------------------------------------------------------ */
/* Busca (combo "buscar em" do Form1)                                        */
/* ------------------------------------------------------------------------ */

/** Reproduz as consultas do Form1 (GROUP BY + CAST + concatenação `+`) via exec_sql. */
export async function buscarValores(
  empresaId: number,
  idlayout: number,
  coluna: string,
): Promise<ItemBusca[]> {
  const colunaSegura = ['ORDCOMPRA', 'PECLIENTE', 'ARQUIVO'].includes(coluna) ? coluna : 'ORDCOMPRA';
  const filtroData = colunaSegura === 'ARQUIVO' ? ` AND DATAINC >= '2023-12-10 00:00:00.000'` : '';

  const sql =
    `SELECT ${colunaSegura} + ' (' + CAST(COUNT(${colunaSegura}) AS VARCHAR(5)) + ')' AS Descricao, ` +
    `${colunaSegura} AS Valor FROM PEDIDO WHERE EMPRESA_ID = ${Number(empresaId)} ` +
    `AND Idlayout = ${Number(idlayout)}${filtroData} GROUP BY ${colunaSegura} ORDER BY ${colunaSegura}`;

  const bruto = await rpc<unknown>('exec_sql', { sql_query: sql });
  const linhas = typeof bruto === 'string' ? (JSON.parse(bruto) as Array<Record<string, string>>) : (bruto as Array<Record<string, string>>);

  return (linhas ?? []).map((l) => ({
    valor: String(l.Valor ?? l.valor ?? ''),
    descricao: String(l.Descricao ?? l.descricao ?? ''),
  }));
}

/** Busca do legado (btnBuscar_Click): substitui o conteúdo do grid. */
export async function buscarPedidosPorFiltro(
  empresaId: number,
  idlayout: number,
  coluna: string,
  valores: string[],
): Promise<Pedido[]> {
  const colunaSegura = ['ORDCOMPRA', 'PECLIENTE', 'ARQUIVO'].includes(coluna) ? coluna : 'ORDCOMPRA';
  const limpos = valores.map((v) => v.trim()).filter(Boolean);
  if (limpos.length === 0) return [];

  const lista = limpos.map((v) => `'${v.replace(/'/g, "''")}'`).join(',');
  const sql =
    `SELECT PEDIDO.*, LAYOUT.Nome AS Nmlayout FROM PEDIDO JOIN LAYOUT ON PEDIDO.Idlayout=LAYOUT.CONTROLE ` +
    `WHERE PEDIDO.EMPRESA_ID = ${Number(empresaId)} AND Idlayout = ${Number(idlayout)} AND TRIM(${colunaSegura}) IN(${lista})`;

  const bruto = await rpc<unknown>('exec_sql', { sql_query: sql });
  const linhas = typeof bruto === 'string' ? (JSON.parse(bruto) as Pedido[]) : (bruto as Pedido[]);
  return linhas ?? [];
}

/* ------------------------------------------------------------------------ */
/* Usuários da empresa (gestão feita pela própria empresa logada)            */
/* ------------------------------------------------------------------------ */

export async function listarUsuarios(empresaId: number): Promise<UsuarioEmpresa[]> {
  return buscar<UsuarioEmpresa[]>(
    `usuario?select=id,login,nome,perfil,ativo&empresa_id=eq.${empresaId}&order=login`,
  );
}

export async function criarUsuario(dados: {
  empresa_id: number;
  login: string;
  nome: string;
  senha: string;
  perfil: string;
}): Promise<void> {
  await enviar<unknown>('usuario', 'POST', { ...dados, nivel: dados.perfil }, { Prefer: 'return=minimal' });
}

export async function atualizarUsuario(
  id: number,
  dados: Partial<{ login: string; nome: string; senha: string; perfil: string; ativo: boolean }>,
): Promise<void> {
  const corpo: Record<string, unknown> = { ...dados };
  if (dados.perfil) corpo.nivel = dados.perfil;
  await enviar<unknown>(`usuario?id=eq.${id}`, 'PATCH', corpo, { Prefer: 'return=minimal' });
}

export async function excluirUsuario(id: number): Promise<void> {
  await enviar<unknown>(`usuario?id=eq.${id}`, 'DELETE', undefined, { Prefer: 'return=minimal' });
}

export { listaTexto, listaNumero };
