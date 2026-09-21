/**
 * Camada de acesso ao Supabase (PostgREST) do app web.
 *
 * O navegador NÃO fala com as tabelas: tudo passa por RPCs que resolvem a
 * empresa e o perfil a partir do TOKEN de sessão (12 horas), guardado em
 * sessionStorage (sobrevive ao F5, morre ao fechar a aba).
 *
 * MOTIVO: com a chave publishable (que vai no bundle de qualquer usuário) dava
 * para `select login, senha from usuario`, ler pedido de outra empresa, criar um
 * usuário ADMIN, apagar pedidos e até rodar SQL arbitrário pelos RPCs
 * exec_sql/exec_dml. Depois desta mudança, a empresa usada em toda consulta vem
 * da SESSÃO no servidor — nunca de um parâmetro enviado pelo navegador.
 */
import { SUPABASE_KEY, SUPABASE_URL } from './config';
import { temIntegracao } from './integracao';

export type Empresa = { id: number; slug: string; nome: string; ativo: number; trial_ate?: string | null };

/** Empresa como ela aparece no diretório público (campo "Empresa" de /entrar). */
export type EmpresaPublica = { slug: string; nome: string };

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
  token?: string;
};

export type UsuarioEmpresa = {
  id: number;
  login: string;
  nome: string | null;
  perfil: string;
  ativo: boolean;
};

export type ItemBusca = { valor: string; descricao: string };

/** Campos aceitos no INSERT de PEDIDO (os 19 do InserirBulk legado). */
export type PedidoNovo = Partial<
  Omit<Pedido, 'id' | 'nmlayout'> & {
    pecoletor: string | null;
    codcliente: string | null;
    volume2: number | null;
    idgrupo: number | null;
  }
>;

const CHAVE_TOKEN = 'sysconf.token';

const TAMANHO_LOTE = 1000;

/* --------------------------------------------------------------------- base -- */

function lerTokenGuardado(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null; /* sessionStorage bloqueado (modo privado) */
  }
}

let token: string | null = lerTokenGuardado();

/** Token da sessão atual, se houver. */
export function tokenSessao(): string | null {
  return token;
}

function definirToken(novo: string | null | undefined): void {
  token = novo ?? null;
  try {
    if (token) sessionStorage.setItem(CHAVE_TOKEN, token);
    else sessionStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* segue sem persistir */
  }
}

function cabecalhos(): Record<string, string> {
  const base: Record<string, string> = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
  };
  if (SUPABASE_KEY) base.Authorization = `Bearer ${SUPABASE_KEY}`;
  return base;
}

async function lerResposta<T>(resposta: Response): Promise<T> {
  const texto = await resposta.text();

  if (!resposta.ok) {
    let mensagem = `${resposta.status} ${resposta.statusText}`;
    let codigo = '';
    if (texto) {
      try {
        const json = JSON.parse(texto) as { message?: string; code?: string };
        mensagem = json.message ?? texto;
        codigo = json.code ?? '';
      } catch {
        mensagem = texto;
      }
    }
    /* sessão morta no servidor: descarta o token para a próxima ação pedir login */
    if (codigo === 'P0002' || /sess[aã]o/i.test(mensagem)) definirToken(null);
    throw new Error(mensagem);
  }

  if (!texto) return undefined as T;
  return JSON.parse(texto) as T;
}

/**
 * Chama um RPC. Por padrão envia o token da sessão (`p_token`), que é o que
 * permite ao servidor saber a empresa — nunca passamos empresa_id daqui.
 */
async function rpc<T>(nome: string, corpo: Record<string, unknown> = {}, comToken = true): Promise<T> {
  const dados = comToken ? { p_token: token, ...corpo } : corpo;
  const resposta = await fetch(`${SUPABASE_URL}rpc/${nome}`, {
    method: 'POST',
    headers: cabecalhos(),
    body: JSON.stringify(dados),
  });
  return lerResposta<T>(resposta);
}

/* ------------------------------------------------------------------ empresa -- */

/** Resolve a empresa pelo slug da URL (roda antes do login, por isso é público). */
export async function obterEmpresa(slug: string): Promise<Empresa | null> {
  const empresas = await rpc<Empresa[]>('empresa_por_slug', { p_slug: slug }, false);
  return empresas[0] ?? null;
}

/** Diretório público de empresas ativas — campo "Empresa" da tela /entrar. */
export async function listarEmpresas(): Promise<EmpresaPublica[]> {
  return rpc<EmpresaPublica[]>('empresas_publicas', {}, false);
}

/** Dados cadastrais da empresa logada (tela "Dados da empresa"). */
export type DadosEmpresa = {
  id: number;
  /** Link de acesso: /sysconf/<slug> — NÃO é alterável pela tela. */
  slug: string;
  nome: string;
  ativo: number;
  criado_em: string | null;
  responsavel: string | null;
  email_contato: string | null;
  trial_ate: string | null;
  log_retencao_dias: number | null;
  usuarios: number;
  fabricas: number;
  pedidos: number;
};

/** Aviso quando a migração 00113 ainda não foi aplicada no banco. */
export const AVISO_EMPRESA =
  'Os dados da empresa precisam da migração 00113 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260921000113_empresa_dados.sql no SQL Editor do Supabase.';

/** Dados da empresa da sessão (só ADMIN). */
export async function dadosDaEmpresa(): Promise<DadosEmpresa> {
  const linhas = await rpc<DadosEmpresa[]>('empresa_dados');
  return linhas[0];
}

/**
 * Grava nome, responsável, e-mail de contato e, quando informado, o ENDEREÇO
 * (slug). O endereço antigo fica como apelido no banco: o link velho continua
 * abrindo o sistema (o app redireciona para o endereço novo).
 * A RPC devolve 1 (dados) ou 2 (dados + endereço trocado).
 */
export async function atualizarDadosEmpresa(dados: {
  nome: string;
  responsavel: string;
  emailContato: string;
  /** Só quando o administrador trocou o endereço. */
  slug?: string;
}): Promise<number> {
  return rpc<number>('empresa_atualizar', {
    p_nome: dados.nome,
    p_responsavel: dados.responsavel,
    p_email_contato: dados.emailContato,
    p_slug: dados.slug ?? null,
  });
}

/* -------------------------------------------------------------------- login -- */

/** Login validado dentro da empresa; guarda o token da sessão. */
export async function login(slug: string, usuario: string, senha: string): Promise<UsuarioLogado | null> {
  const linhas = await rpc<UsuarioLogado[]>(
    'login_usuario',
    { p_empresa: slug, p_login: usuario.trim(), p_senha: senha },
    false,
  );
  const logado = Array.isArray(linhas) ? linhas[0] : undefined;
  if (!logado) return null;

  definirToken(logado.token);
  return logado;
}

/** Ao carregar a página: valida o token guardado e devolve a sessão. */
export async function restaurarSessao(): Promise<UsuarioLogado | null> {
  if (!token) return null;
  try {
    const linhas = await rpc<UsuarioLogado[]>('sessao_atual');
    return Array.isArray(linhas) ? (linhas[0] ?? null) : null;
  } catch {
    definirToken(null);
    return null;
  }
}

/** Encerra a sessão no servidor e esquece o token. */
export async function sair(): Promise<void> {
  try {
    await rpc<number>('sair_usuario');
  } catch {
    /* se a sessão já morreu, só limpa localmente */
  }
  definirToken(null);
}

/* ------------------------------------------------------- autocadastro (SaaS) -- */

export type DadosRegistro = {
  /** Nome da empresa (aparece no sistema). */
  empresa: string;
  /** Endereço que vai na URL: /sysconf/<slug>/login */
  slug: string;
  login: string;
  senha: string;
  nome?: string;
  email?: string;
};

/**
 * Cria a empresa + o primeiro ADMIN (30 dias de teste) e devolve a sessão
 * pronta. As regras ficam no RPC `registrar_empresa` (SECURITY DEFINER): a
 * tabela `empresa` não aceita escrita pela chave publishable.
 */
export async function registrarEmpresa(dados: DadosRegistro): Promise<UsuarioLogado> {
  const linhas = await rpc<UsuarioLogado[]>(
    'registrar_empresa',
    {
      p_empresa: dados.empresa.trim(),
      p_slug: dados.slug.trim().toLowerCase(),
      p_login: dados.login.trim(),
      p_senha: dados.senha,
      p_nome: dados.nome?.trim() || null,
      p_email: dados.email?.trim() || null,
    },
    false,
  );

  const criado = Array.isArray(linhas) ? linhas[0] : undefined;
  if (!criado) {
    throw new Error('O cadastro foi aceito, mas a sessão não foi devolvida. Entre com o usuário criado.');
  }

  definirToken(criado.token);
  return criado;
}

/* -------------------------------------------------- cadastros da empresa ---- */

/**
 * Fábricas da empresa. As que TÊM INTEGRAÇÃO ficam fixadas no topo da lista
 * (ver `lib/integracao.ts`); as demais seguem em ordem alfabética abaixo.
 */
export async function listarFabricas(): Promise<Fabrica[]> {
  const fabricas = await rpc<Array<{ controle: number; nome: string }>>('fabricas_listar');
  return fabricas
    .map((fabrica) => ({ ...fabrica, integrada: temIntegracao(fabrica.nome) }))
    .sort((a, b) => Number(b.integrada) - Number(a.integrada) || a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function listarBoxes(): Promise<Array<{ idbox: number; nmbox: string }>> {
  return rpc<Array<{ idbox: number; nmbox: string }>>('boxes_listar');
}

/* ------------------------------------------------------------------ pedidos -- */

export async function listarPedidos(idlayout: number): Promise<Pedido[]> {
  const pedidos = await rpc<Pedido[]>('pedidos_listar', { p_idlayout: idlayout });
  return pedidos ?? [];
}

/** Baixa de UMA etiqueta — gravada na hora a cada bipagem com sucesso. */
export async function atualizarStatusPorId(
  id: number | string,
  status: number,
  valorLido?: string,
): Promise<number> {
  return rpc<number>('pedido_status_id', {
    p_id: Number(id),
    p_status: status,
    p_valor_lido: valorLido ?? null,
  });
}

/** Alteração do menu de contexto — o legado grava por ETIQUETA. */
export async function atualizarStatusPorEtiquetas(etiquetas: string[], status: number): Promise<number> {
  const validas = etiquetas.map((e) => e.trim()).filter(Boolean);
  if (validas.length === 0) return 0;
  return rpc<number>('pedido_status_etiquetas', { p_etiquetas: validas, p_status: status });
}

/** Importação em lote (a empresa e a fábrica são resolvidas pela sessão). */
export async function inserirPedidos(
  idlayout: number,
  linhas: PedidoNovo[],
  importacaoId: number | null = null,
): Promise<number> {
  if (linhas.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < linhas.length; i += TAMANHO_LOTE) {
    const lote = linhas.slice(i, i + TAMANHO_LOTE);
    total += await rpc<number>('pedidos_inserir', {
      p_idlayout: idlayout,
      p_pedidos: lote,
      p_importacao_id: importacaoId,
    });
  }
  return total;
}

/* -------------------------------------------------------------------- busca -- */

/** Combo "buscar em": mesma consulta do Form1 (GROUP BY por coluna). */
export async function buscarValores(idlayout: number, coluna: string): Promise<ItemBusca[]> {
  const linhas = await rpc<Array<{ valor: string; descricao: string }>>('buscar_valores', {
    p_idlayout: idlayout,
    p_coluna: coluna,
  });
  return (linhas ?? []).map((l) => ({
    valor: String(l.valor ?? ''),
    descricao: String(l.descricao ?? ''),
  }));
}

/** Busca do legado (btnBuscar_Click): substitui o conteúdo do grid. */
export async function buscarPedidosPorFiltro(
  idlayout: number,
  coluna: string,
  valores: string[],
): Promise<Pedido[]> {
  const limpos = valores.map((v) => v.trim()).filter(Boolean);
  if (limpos.length === 0) return [];

  const linhas = await rpc<Pedido[]>('buscar_pedidos_filtro', {
    p_idlayout: idlayout,
    p_coluna: coluna,
    p_valores: limpos,
  });
  return linhas ?? [];
}

/* -------------------------------------- usuários da empresa (só o ADMIN) ---- */

export async function listarUsuarios(): Promise<UsuarioEmpresa[]> {
  return rpc<UsuarioEmpresa[]>('usuarios_listar');
}

export async function criarUsuario(dados: {
  login: string;
  nome: string;
  senha: string;
  perfil: string;
}): Promise<void> {
  await rpc<number>('usuario_criar', {
    p_login: dados.login,
    p_nome: dados.nome,
    p_senha: dados.senha,
    p_perfil: dados.perfil,
  });
}

/**
 * Atualiza um usuário da empresa. Login e nome são obrigatórios (o servidor
 * recebe o cadastro completo); senha em branco mantém a atual.
 */
export async function atualizarUsuario(
  id: number,
  dados: { login: string; nome: string; perfil: string; ativo: boolean; senha?: string },
): Promise<void> {
  await rpc<number>('usuario_atualizar', {
    p_id: id,
    p_login: dados.login,
    p_nome: dados.nome,
    p_perfil: dados.perfil,
    p_ativo: dados.ativo,
    p_senha: dados.senha && dados.senha.length > 0 ? dados.senha : null,
  });
}

export async function excluirUsuario(id: number): Promise<void> {
  await rpc<number>('usuario_excluir', { p_id: id });
}

/* --------------------------------------------- fábricas e layout (ADMIN) --- */

export type FabricaAdmin = {
  controle: number;
  nome: string;
  ativo: number;
  pedidos: number;
  tem_layout: boolean;
  layout_tipo: 'delimitado' | 'posicional' | null;
  layout_campos: Record<string, unknown> | null;
  layout_delim: string | null;
};

/** Como está gravado o layout de uma fábrica. */
export type LayoutSalvo = {
  /** `delimitado` (CSV/TXT separado) ou `posicional` (largura fixa). */
  tipo: 'delimitado' | 'posicional';
  delimitador: string;
  linha_inicial: number;
  tem_cabecalho: boolean;
  /** Posicional: ignora linhas menores que isto. */
  linha_minima: number;
  campos: Record<string, number | { pos: number; len: number; zeros?: boolean }>;
  /** Valor usado quando o campo vier vazio. */
  fixos: Record<string, string | number>;
  /** Campos montados a partir de outro (ex.: produto dentro da etiqueta). */
  derivados: Record<string, Record<string, unknown>>;
};

/**
 * A migração 00104 (fábricas + layout no banco) é aplicada pelo SQL Editor do
 * Supabase, não pelo deploy do site. Quando ela ainda não foi rodada, o RPC
 * responde "Could not find the function" — a tela avisa isso em português em
 * vez de mostrar o erro cru.
 */
export function migracaoPendente(falha: unknown): boolean {
  const texto = falha instanceof Error ? falha.message : String(falha);
  return /Could not find the function|PGRST202|schema cache/i.test(texto);
}

export const AVISO_MIGRACAO =
  'Este recurso precisa da migração 00104 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260916000104_fabricas_e_layout_mapa.sql no SQL Editor do Supabase.';

export async function listarFabricasAdmin(): Promise<FabricaAdmin[]> {
  return rpc<FabricaAdmin[]>('fabricas_admin');
}

/** Cria a fábrica e devolve o `controle` gerado. */
export async function criarFabrica(nome: string): Promise<number> {
  return rpc<number>('fabrica_criar', { p_nome: nome });
}

export async function atualizarFabrica(controle: number, nome: string, ativo: number): Promise<void> {
  await rpc<number>('fabrica_atualizar', { p_controle: controle, p_nome: nome, p_ativo: ativo });
}

export async function excluirFabrica(controle: number): Promise<void> {
  await rpc<number>('fabrica_excluir', { p_controle: controle });
}

/** Layout salvo da fábrica (usado pela importação; o operador também lê). */
export async function lerLayoutFabrica(controle: number): Promise<LayoutSalvo | null> {
  const linhas = await rpc<LayoutSalvo[]>('layout_da_fabrica', { p_controle: controle });
  return Array.isArray(linhas) ? (linhas[0] ?? null) : null;
}

export async function salvarLayoutFabrica(controle: number, layout: LayoutSalvo): Promise<void> {
  await rpc<number>('layout_salvar', {
    p_controle: controle,
    p_tipo: layout.tipo,
    p_delimitador: layout.delimitador,
    p_linha_inicial: layout.linha_inicial,
    p_tem_cabecalho: layout.tem_cabecalho,
    p_linha_minima: layout.linha_minima,
    p_campos: layout.campos,
    p_fixos: layout.fixos,
    p_derivados: layout.derivados,
  });
}

export async function excluirLayoutFabrica(controle: number): Promise<void> {
  await rpc<number>('layout_excluir', { p_controle: controle });
}

/* ---------------------------------------------------- importações feitas --- */

export type Importacao = {
  id: number;
  criado_em: string;
  fabrica: string;
  layout_controle: number;
  nome_arquivo: string;
  tamanho_bytes: number;
  codificacao: string;
  linhas_lidas: number;
  linhas_importadas: number;
  linhas_descartadas: number;
  usuario_login: string | null;
  pedidos: number;
  tem_arquivo: boolean;
};

export type DadosImportacao = {
  controle: number;
  nomeArquivo: string;
  tamanho: number;
  codificacao: string;
  linhasLidas: number;
  linhasImportadas: number;
  linhasDescartadas: number;
  /** Arquivo original em base64, para poder ser baixado depois. */
  conteudoBase64: string | null;
};

/**
 * As RPCs de importação são aplicadas pelo SQL Editor. Quando elas ainda não
 * existem, o RPC responde "Could not find the function" — a tela avisa isso em
 * português em vez de mostrar o erro cru.
 */
export const AVISO_IMPORTACOES =
  'Este recurso precisa da migração 00107 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260916000107_importacao_gerenciar.sql no SQL Editor do Supabase.';

export async function registrarImportacao(dados: DadosImportacao): Promise<number> {
  return rpc<number>('importacao_registrar', {
    p_controle: dados.controle,
    p_nome_arquivo: dados.nomeArquivo,
    p_tamanho_bytes: dados.tamanho,
    p_codificacao: dados.codificacao,
    p_linhas_lidas: dados.linhasLidas,
    p_linhas_importadas: dados.linhasImportadas,
    p_linhas_descartadas: dados.linhasDescartadas,
    p_conteudo_base64: dados.conteudoBase64,
  });
}

export async function listarImportacoes(): Promise<Importacao[]> {
  return rpc<Importacao[]>('importacoes_listar');
}

/** Devolve o arquivo original (base64) para o navegador baixar. */
export async function lerArquivoImportacao(
  id: number,
): Promise<{ nome_arquivo: string; conteudo: string | null } | null> {
  const linhas = await rpc<Array<{ nome_arquivo: string; conteudo: string | null }>>(
    'importacao_arquivo',
    { p_id: id },
  );
  return Array.isArray(linhas) ? (linhas[0] ?? null) : null;
}

/** Exclui a importação e, junto, os pedidos que vieram dela. */
export async function excluirImportacao(id: number): Promise<number> {
  const linhas = await rpc<Array<{ pedidos_apagados: number }>>('importacao_excluir', { p_id: id });
  const linha = Array.isArray(linhas) ? linhas[0] : null;
  return Number(linha?.pedidos_apagados ?? 0);
}

/* ------------------------------------------------------- log de conferência -- */

/**
 * Desfechos possíveis de uma leitura no painel de conferência:
 * `sucesso` avançou de estágio · `ja_lida` bipou de novo · `bloqueada` fora de
 * ordem · `nao_encontrada` código inexistente · `massa` alteração pelo menu.
 */
export type DesfechoLog = 'sucesso' | 'ja_lida' | 'bloqueada' | 'nao_encontrada' | 'massa';

export type LogConferencia = {
  id: number;
  criado_em: string;
  fabrica: string | null;
  layout_controle: number | null;
  estagio: number;
  desfecho: DesfechoLog;
  origem: string;
  valor_lido: string | null;
  usuario_login: string | null;
  pedido_id: number | null;
  etiqueta: string | null;
  ordcompra: string | null;
  produto: string | null;
  descricao1: string | null;
  qtde: number | string | null;
  cliente: string | null;
  pecliente: string | null;
  idbox: number | null;
  nmbox: string | null;
  status_antes: number | null;
  status_novo: number | null;
  mensagem: string | null;
};

export type ResumoLogs = {
  total: number;
  sucesso: number;
  ja_lida: number;
  bloqueada: number;
  nao_encontrada: number;
  massa: number;
  /** Leituras por estágio: {"1": 12, "2": 3, ...} (só estágios cadastrados). */
  estagios: Record<string, number>;
  operadores: number;
};

export type FiltrosLog = {
  de?: string;
  ate?: string;
  controle?: number | null;
  usuario?: string;
  desfecho?: string;
  texto?: string;
  ordcompra?: string;
  limite?: number;
};

/**
 * A tela de logs é servida pelas RPCs da migração 00109 (aplicada pelo SQL
 * Editor). Sem ela, o RPC responde "Could not find the function".
 */
export const AVISO_LOGS =
  'Os logs de conferência precisam da migração 00109 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260919000109_log_conferencia.sql no SQL Editor do Supabase.';

function corpoDosFiltros(filtros: FiltrosLog): Record<string, unknown> {
  return {
    p_de: filtros.de || null,
    p_ate: filtros.ate || null,
    p_controle: filtros.controle ?? null,
    p_usuario: filtros.usuario?.trim() || null,
    p_desfecho: filtros.desfecho || null,
    p_texto: filtros.texto?.trim() || null,
    p_ordcompra: filtros.ordcompra?.trim() || null,
  };
}

/**
 * Registra uma leitura que NÃO gerou baixa (não encontrada / já lida / bloqueada).
 * É chamada "fire and forget": se o banco não tiver a migração, a conferência
 * continua funcionando — só não fica o registro.
 */
export async function registrarLogBipagem(dados: {
  controle: number | null;
  estagio: number;
  desfecho: DesfechoLog;
  valorLido: string;
  pedidoId?: number | null;
  mensagem?: string | null;
}): Promise<number> {
  return rpc<number>('log_registrar', {
    p_controle: dados.controle,
    p_estagio: dados.estagio,
    p_desfecho: dados.desfecho,
    p_valor_lido: dados.valorLido,
    p_pedido_id: dados.pedidoId ?? null,
    p_mensagem: dados.mensagem ?? null,
  });
}

/** Logs da empresa (somente administrador). */
export async function listarLogs(filtros: FiltrosLog = {}): Promise<LogConferencia[]> {
  const linhas = await rpc<LogConferencia[]>('logs_listar', {
    ...corpoDosFiltros(filtros),
    p_limite: filtros.limite ?? 1000,
  });
  return linhas ?? [];
}

/** Totais do filtro (faixa de contadores da tela). Somente administrador. */
export async function resumoLogs(filtros: FiltrosLog = {}): Promise<ResumoLogs | null> {
  const linhas = await rpc<ResumoLogs[]>('logs_resumo', corpoDosFiltros(filtros));
  return Array.isArray(linhas) ? (linhas[0] ?? null) : null;
}

/** Dias de retenção configurados (0 = guardar para sempre). */
export async function lerRetencaoLogs(): Promise<number> {
  return rpc<number>('logs_retencao');
}

export async function definirRetencaoLogs(
  dias: number,
): Promise<{ dias: number; apagados: number }> {
  const linhas = await rpc<Array<{ dias: number; apagados: number }>>('logs_retencao_definir', {
    p_dias: dias,
  });
  return Array.isArray(linhas) ? (linhas[0] ?? { dias, apagados: 0 }) : { dias, apagados: 0 };
}

/** Apaga agora os logs que passaram da retenção configurada. */
export async function limparLogs(): Promise<number> {
  return rpc<number>('logs_limpar');
}

/* ------------------------------------------------------------- locais ----- */

/** Local = lugar físico onde a peça deve ficar (Box 01, Prateleira, Piso...). */
export type Local = { idbox: number; nmbox: string; ativo: number; pecas: number };

/** Local de UMA peça em UM estágio (1=CONFERENCIA, 2=SAIDA, 3=ENTREGA). */
export type LocalPedido = { pedido_id: number; estagio: number; idbox: number; nmbox: string };

/** Local mais usado de um grupo (ORD.COMPRA) em um estágio. */
export type LocalGrupo = {
  ordcompra: string;
  estagio: number;
  idbox: number;
  nmbox: string;
  pecas: number;
};

/* ------------------------------------------------------------- estágios --- */

/**
 * Estágio da conferência, cadastrado pela empresa. `numero` é a ORDEM do fluxo
 * (1, 2, 3...) e é o que fica gravado em PEDIDO.STATUS (0 = NORMAL, ainda não
 * bipado). Os três estágios que já existiam vêm pré-cadastrados.
 */
export type Estagio = {
  numero: number;
  nome: string;
  cor: string | null;
  ativo: number;
  /** Quantas peças estão paradas neste estágio hoje. */
  pecas: number;
};

/** A tela de estágios precisa da migração 00111 aplicada no banco. */
export const AVISO_ESTAGIOS =
  'O cadastro de estágios precisa da migração 00111 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260921000111_estagios.sql no SQL Editor do Supabase.';

export async function listarEstagios(): Promise<Estagio[]> {
  const linhas = await rpc<Estagio[]>('estagios_listar');
  return linhas ?? [];
}

/** Cria um estágio no FIM da sequência e devolve o número dele. Somente ADMIN. */
export async function criarEstagio(nome: string, cor: string | null): Promise<number> {
  return rpc<number>('estagio_criar', { p_nome: nome, p_cor: cor });
}

/** Renomeia / troca a cor / ativa / desativa. Somente ADMIN. */
export async function atualizarEstagio(
  numero: number,
  nome: string,
  cor: string | null,
  ativo: number,
): Promise<number> {
  return rpc<number>('estagio_atualizar', {
    p_numero: numero,
    p_nome: nome,
    p_cor: cor,
    p_ativo: ativo,
  });
}

/** Exclui o estágio (só o último da sequência, sem peças). Somente ADMIN. */
export async function excluirEstagio(numero: number): Promise<number> {
  return rpc<number>('estagio_excluir', { p_numero: numero });
}

/** Uma definição de local escolhida na importação (grupo + estágio + local). */
export type LocalEscolhido = { ordcompra: string; estagio: number; idbox: number };

/**
 * A tela de locais e o vínculo peça × estágio vêm da migração 00110
 * (aplicada pelo SQL Editor).
 */
export const AVISO_LOCAIS =
  'Os locais das peças precisam da migração 00110 aplicada no banco. Rode o arquivo ' +
  'supabase/migrations/20260919000110_locais_pecas.sql no SQL Editor do Supabase.';

export async function listarLocais(): Promise<Local[]> {
  const linhas = await rpc<Local[]>('locais_listar');
  return linhas ?? [];
}

/** Cria o local e devolve o `idbox` gerado. Somente ADMIN. */
export async function criarLocal(nome: string): Promise<number> {
  return rpc<number>('local_criar', { p_nome: nome });
}

/** Renomeia / ativa / desativa um local. Somente ADMIN. */
export async function atualizarLocal(
  idbox: number,
  nome: string,
  ativo: number,
): Promise<number> {
  return rpc<number>('local_atualizar', { p_idbox: idbox, p_nome: nome, p_ativo: ativo });
}

/** Exclui o local — o banco recusa se houver peça usando. Somente ADMIN. */
export async function excluirLocal(idbox: number): Promise<number> {
  return rpc<number>('local_excluir', { p_idbox: idbox });
}

/** Local de cada peça por estágio, na fábrica (mapa usado pelo grid). */
export async function locaisDosPedidos(idlayout: number): Promise<LocalPedido[]> {
  const linhas = await rpc<LocalPedido[]>('locais_dos_pedidos', { p_idlayout: idlayout });
  return linhas ?? [];
}

/** Local mais usado de cada grupo (ORD.COMPRA) — pré-preenche a importação. */
export async function locaisPorGrupo(idlayout: number): Promise<LocalGrupo[]> {
  const linhas = await rpc<LocalGrupo[]>('locais_por_grupo', { p_idlayout: idlayout });
  return linhas ?? [];
}

/**
 * Define o local de um estágio para TODAS as peças do filtro (somente ADMIN).
 * Os filtros vazios são ignorados pelo banco.
 */
export async function definirLocais(dados: {
  controle: number;
  estagio: number;
  idbox: number;
  ordcompra?: string;
  cliente?: string;
  etiqueta?: string;
  importacaoId?: number | null;
  status?: number | null;
  semLocal?: boolean;
}): Promise<number> {
  return rpc<number>('locais_definir', {
    p_idlayout: dados.controle,
    p_estagio: dados.estagio,
    p_idbox: dados.idbox,
    p_ordcompra: dados.ordcompra?.trim() || null,
    p_cliente: dados.cliente?.trim() || null,
    p_etiqueta: dados.etiqueta?.trim() || null,
    p_importacao_id: dados.importacaoId ?? null,
    p_status: dados.status ?? null,
    p_sem_local: dados.semLocal ?? false,
  });
}

/** Aplica, de uma vez, os locais escolhidos na importação (por grupo/ORD.COMPRA). */
export async function definirLocaisLote(
  idlayout: number,
  importacaoId: number | null,
  locais: LocalEscolhido[],
): Promise<number> {
  if (locais.length === 0) return 0;
  return rpc<number>('locais_definir_lote', {
    p_idlayout: idlayout,
    p_importacao_id: importacaoId,
    p_locais: locais,
  });
}

/** Uma peça com o local dos três estágios (tela "Locais das peças"). */
export type PecaComLocal = {
  pedido_id: number;
  etiqueta: string | null;
  ordcompra: string | null;
  cliente: string | null;
  pecliente: string | null;
  produto: string | null;
  descricao1: string | null;
  qtde: number | string | null;
  status: number;
  /** Local de cada estágio: {"1": "Box 01", "2": "Prateleira", ...}. */
  locais: Record<string, string> | null;
};

/** Peças da fábrica com os locais (somente ADMIN). */
export async function listarPecasComLocal(filtros: {
  controle: number;
  ordcompra?: string;
  cliente?: string;
  etiqueta?: string;
  status?: number | null;
  importacaoId?: number | null;
  semLocalEstagio?: number | null;
  limite?: number;
}): Promise<PecaComLocal[]> {
  const linhas = await rpc<PecaComLocal[]>('locais_pecas_listar', {
    p_idlayout: filtros.controle,
    p_ordcompra: filtros.ordcompra?.trim() || null,
    p_cliente: filtros.cliente?.trim() || null,
    p_etiqueta: filtros.etiqueta?.trim() || null,
    p_status: filtros.status ?? null,
    p_importacao_id: filtros.importacaoId ?? null,
    p_sem_local_estagio: filtros.semLocalEstagio ?? null,
    p_limite: filtros.limite ?? 500,
  });
  return linhas ?? [];
}
