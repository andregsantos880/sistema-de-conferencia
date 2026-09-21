import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import {
  atualizarStatusPorEtiquetas,
  atualizarStatusPorId,
  buscarPedidosPorFiltro,
  buscarValores,
  listarPedidos,
  locaisDosPedidos,
  registrarLogBipagem,
  type DesfechoLog,
  type Empresa,
  type Fabrica,
  type ItemBusca,
  type Pedido,
  type UsuarioLogado,
} from '../lib/api';
import {
  COLUNAS_GRID,
  colunasVisiveis,
  diasRestantesTeste,
  OPCOES_BUSCA,
  PERFIL,
  STATUS,
} from '../lib/config';
import {
  calcularRestante,
  classificarLeitura,
  DS_STATUS,
  montarInfoBipagem,
  statusDe,
  type Alvo,
  type InfoBipagem,
  type Som,
} from '../lib/regrasConferencia';
import { compararValores } from '../lib/ordenacao';
import { ComboboxMultiplo } from '../lib/multiselecao';
import { Marca } from '../lib/marca';
import { useEstagios } from '../lib/estagios';
import {
  falarBox,
  somAirHorn,
  somBox,
  somError,
  somExclamation,
  somFechar,
  somRingout,
  somSuccess,
} from '../lib/audio';

type Props = {
  empresa: Empresa;
  usuario: UsuarioLogado;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onAbrirImportacao: () => void;
  onAbrirUsuarios: () => void;
  onAbrirFabricas: () => void;
  onAbrirImportacoes: () => void;
  onAbrirLogs: () => void;
  onAbrirLocais: () => void;
  onAbrirLocaisPecas: () => void;
  onAbrirEstagios: () => void;
  onAbrirAjuda: () => void;
  onSair: () => void;
};

type MenuContexto = { x: number; y: number; id: string } | null;

/** Item do menu hambúrguer do topo (telas de administração). */
function ItemMenuTopo({
  rotulo,
  aoClicar,
  className = '',
}: {
  rotulo: string;
  aoClicar: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={aoClicar}
      className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-100 ${className}`}
    >
      {rotulo}
    </button>
  );
}

/*
 * TanStack Table v9: as features precisam ser registradas explicitamente — e o
 * ROW MODEL da ordenação também (`sortedRowModel`). Sem ele o cabeçalho até
 * mostra ▲/▼, mas as linhas não mudam de lugar.
 */
const features = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

/**
 * Colunas que ordenam como NÚMERO (as outras ordenam como texto, em pt-BR).
 * O `status` ordena pelo número do estágio (NORMAL → CONFERÊNCIA → SAÍDA →
 * ENTREGA) e não pelo rótulo.
 */
const COLUNAS_NUMERO = new Set(['qtde', 'volume', 'sequencia', 'idbox', 'status']);

/** Valor cru usado na ordenação (a coluna LOCAL não existe no pedido). */
function valorParaOrdenar(pedido: LinhaGrid, campo: string): unknown {
  if (campo === 'local') return pedido.local ?? '';
  return (pedido as unknown as Record<string, unknown>)[campo];
}

/**
 * Valor como aparece na tela (usado no grid e na exportação).
 * A coluna STATUS mostra o ESTÁGIO da conferência em vez do número:
 * 0 = NORMAL, 1 = CONFERÊNCIA (entrada), 2 = SAÍDA, 3 = ENTREGA.
 */
function valorExibicao(pedido: LinhaGrid, campo: string): string {
  const bruto = (pedido as unknown as Record<string, unknown>)[campo];

  /* LOCAL e o nome do ESTÁGIO vêm do cadastro, não da coluna crua do pedido */
  if (campo === 'local') return pedido.local ?? '';
  if (campo === 'status') {
    return pedido.statusNome ?? DS_STATUS[Number(bruto ?? 0)] ?? String(bruto ?? '');
  }
  if (campo === 'flbloqueio') return bruto ? 'SIM' : '';

  return String(bruto ?? '');
}

/**
 * Colunas do grid conforme o PERFIL do usuário logado:
 *  - a ETIQUETA (código de barras) só aparece para ADMIN;
 *  - ID, FÁBRICA, ID LAYOUT, ID BOX, BLOQUEIO e PC não aparecem para ninguém;
 *  - LOCAL não vem do pedido: é o local do estágio, calculado pela tela.
 */
type LinhaGrid = Pedido & { local?: string; statusNome?: string };

function montarColunas(perfil: string): Array<ColumnDef<typeof features, LinhaGrid>> {
  return colunasVisiveis(perfil).map((coluna) => ({
    id: coluna.campo,
    accessorFn: (linha: LinhaGrid) => valorExibicao(linha, coluna.campo),
    header: coluna.titulo,
    /* ordena pelo valor CRU do pedido (número como número, não como texto) */
    sortFn: (linhaA, linhaB) =>
      compararValores(
        valorParaOrdenar(linhaA.original, coluna.campo),
        valorParaOrdenar(linhaB.original, coluna.campo),
        COLUNAS_NUMERO.has(coluna.campo) ? 'numero' : 'texto',
      ),
  }));
}

/** Largura mínima por coluna (o `size` do TanStack v9 só existe com columnSizing registrado). */
const LARGURAS: Record<string, number> = Object.fromEntries(
  COLUNAS_GRID.map((coluna) => [coluna.campo, coluna.largura]),
);

function tocarSom(som: Som) {
  switch (som) {
    case 'success':
      somSuccess();
      break;
    case 'exclamation':
      somExclamation();
      break;
    case 'air_horn':
      somAirHorn();
      break;
    case 'ringout':
      somRingout();
      break;
    case 'box':
      somBox();
      break;
    default:
      somError();
  }
}

/**
 * Recriação do Form1 (conferência de peças de móveis planejados).
 *
 * Regras herdadas do legado (detalhadas em src/lib/regrasConferencia.ts):
 *  - o alvo da conferência é 1=CONFERENCIA, 2=SAIDA, 3=ENTREGA;
 *  - a etiqueta só avança um passo (precisa estar em alvo-1);
 *  - não existe baixa sem bipar a peça;
 *  - CADA BIPAGEM COM SUCESSO É GRAVADA NO BANCO na hora (decisão do cliente);
 *  - ao dar certo, o painel mostra o BOX de destino, a peça, a quantidade e o pedido.
 */
export default function Conferencia({
  empresa,
  usuario,
  fabricas,
  fabricaId,
  onTrocarFabrica,
  onAbrirImportacao,
  onAbrirUsuarios,
  onAbrirFabricas,
  onAbrirImportacoes,
  onAbrirLogs,
  onAbrirLocais,
  onAbrirLocaisPecas,
  onAbrirEstagios,
  onAbrirAjuda,
  onSair,
}: Props) {
  const administrador = usuario.perfil === PERFIL.ADMIN;
  /* Estágios cadastrados pela empresa (sem o cadastro, valem os três de sempre). */
  const { ativos, nome: nomeEstagio, cor: corEstagio } = useEstagios();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  /**
   * LOCAL de cada peça por estágio (migração 00110): id do pedido → estágio → nome do local.
   * Sem a migração o mapa fica vazio e a tela mostra "sem local" (não quebra nada).
   */
  const [locais, setLocais] = useState<Map<string, Map<number, string>>>(new Map());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [filtroUsado, setFiltroUsado] = useState('');

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  /** Ordenação das colunas (clique no cabeçalho: asc → desc → sem ordenação). */
  const [sorting, setSorting] = useState<SortingState>([]);
  /** Menu hambúrguer do topo (fecha ao clicar fora). */
  const [menuTopo, setMenuTopo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuContexto>(null);

  const [colunaBusca, setColunaBusca] = useState<string>('ORDCOMPRA');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [valoresBusca, setValoresBusca] = useState<ItemBusca[]>([]);
  const [valoresMarcados, setValoresMarcados] = useState<Set<string>>(new Set());
  const [campoBusca, setCampoBusca] = useState('');

  const [alvo, setAlvo] = useState<Alvo | null>(null);
  /** Estágio escolhido no seletor do topo — é o que o botão Conferir abre. */
  const [estagioEscolhido, setEstagioEscolhido] = useState(1);

  /**
   * FILTROS RÁPIDOS do grid. São aplicados na hora, no navegador, sobre a carga
   * que já está carregada — não consultam o banco de novo.
   * ATENÇÃO: a bipagem continua considerando TODAS as peças da carga; o filtro
   * é só o que a tela mostra (senão uma peça filtrada "não seria encontrada").
   */
  const [filtros, setFiltros] = useState<{
    texto: string;
    cliente: string;
    local: string;
    estagioLocal: number;
    situacoes: number[];
    semLocal: boolean;
    periodo: string;
  }>({
    texto: '',
    cliente: '',
    local: '',
    estagioLocal: 1,
    situacoes: [],
    semLocal: false,
    periodo: '',
  });
  const [campoEtiqueta, setCampoEtiqueta] = useState('');
  const [etiquetaLida, setEtiquetaLida] = useState('');
  const [info, setInfo] = useState<InfoBipagem | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [anunciarLocal, setAnunciarLocal] = useState(true);
  const [gravando, setGravando] = useState(false);

  const inputEtiqueta = useRef<HTMLInputElement>(null);
  const requisicaoAtual = useRef(0);

  const fabricaAtual = fabricas.find((f) => f.controle === fabricaId) ?? null;
  const nomeFabrica = fabricaAtual?.nome ?? '';
  /* Dias restantes do teste grátis do autocadastro (null = empresa sem prazo). */
  const diasTeste = diasRestantesTeste(empresa.trial_ate);
  /* Fábricas COM INTEGRAÇÃO ficam fixadas no topo do combo (ver lib/integracao.ts). */
  const fabricasIntegradas = fabricas.filter((f) => f.integrada);
  const fabricasSemIntegracao = fabricas.filter((f) => !f.integrada);

  const carregarPedidos = useCallback(
    async (idlayout: number) => {
      // Cada carga recebe um número; respostas atrasadas são descartadas.
      const requisicao = ++requisicaoAtual.current;

      setCarregando(true);
      setErro('');
      try {
        const lista = await listarPedidos(idlayout);
        if (requisicao !== requisicaoAtual.current) return;

        setPedidos(lista);
        setRowSelection({});
        setFiltroUsado('');
      } catch (falha) {
        if (requisicao !== requisicaoAtual.current) return;
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os pedidos.');
      } finally {
        if (requisicao === requisicaoAtual.current) setCarregando(false);
      }
    },
    [empresa.id],
  );

  useEffect(() => {
    if (fabricaId !== null) void carregarPedidos(fabricaId);
  }, [fabricaId, carregarPedidos]);

  /* troca de fábrica começa com o grid limpo (filtros são da carga anterior) */
  useEffect(() => {
    setFiltros((atual) => ({
      ...atual,
      texto: '',
      cliente: '',
      local: '',
      situacoes: [],
      semLocal: false,
      periodo: '',
    }));
  }, [fabricaId]);

  /* fecha o menu do topo ao clicar fora dele */
  useEffect(() => {
    function fechar(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setMenuTopo(false);
      }
    }

    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);

  /* o estágio escolhido precisa existir (cadastro pode mudar) */
  useEffect(() => {
    if (ativos.length === 0) return;
    if (!ativos.some((estagio) => estagio.numero === estagioEscolhido)) {
      setEstagioEscolhido(ativos[0].numero);
    }
  }, [ativos, estagioEscolhido]);

  useEffect(() => {
    if (fabricaId === null) {
      setLocais(new Map());
      return;
    }

    let cancelado = false;
    locaisDosPedidos(fabricaId)
      .then((lista) => {
        if (cancelado) return;
        const mapa = new Map<string, Map<number, string>>();
        lista.forEach((item) => {
          const chave = String(item.pedido_id);
          const porEstagio = mapa.get(chave) ?? new Map<number, string>();
          porEstagio.set(Number(item.estagio), item.nmbox);
          mapa.set(chave, porEstagio);
        });
        setLocais(mapa);
      })
      .catch(() => {
        if (!cancelado) setLocais(new Map());
      });

    return () => {
      cancelado = true;
    };
  }, [fabricaId]);

  useEffect(() => {
    function fecharMenu() {
      setMenu(null);
    }
    window.addEventListener('click', fecharMenu);
    return () => window.removeEventListener('click', fecharMenu);
  }, []);

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setMenu(null);
        setBuscaAberta(false);
        if (alvo !== null) {
          somFechar();
          setAlvo(null);
        }
      }
    }
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alvo]);

  /* ------------------------------------------------------------ derivados -- */
  /** Nome do local de uma peça em um estágio ('' quando ainda não foi definido). */
  const localDoEstagio = useCallback(
    (pedido: Pedido, estagio: number) => locais.get(String(pedido.id))?.get(estagio) ?? '',
    [locais],
  );

  /**
   * O que a coluna LOCAL mostra: o local do estágio em que o operador está
   * bipando (painel aberto) ou, com o painel fechado, o do próximo passo da
   * peça (status + 1) — que é onde ela precisa ser colocada agora.
   */
  const localDaColuna = useCallback(
    (pedido: Pedido) =>
      localDoEstagio(pedido, alvo ?? Math.min(statusDe(pedido) + 1, 3)) || 'sem local',
    [alvo, localDoEstagio],
  );

  const columns = useMemo(() => montarColunas(usuario.perfil), [usuario.perfil]);

  /** Clientes (lojas) que vieram na carga — alimenta o filtro de cliente. */
  const clientesDaCarga = useMemo(
    () =>
      [...new Set(pedidos.map((p) => String(p.cliente ?? '')))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [pedidos],
  );

  /** Nomes de local usados no estágio escolhido para o filtro de local. */
  const locaisDoFiltro = useMemo(
    () =>
      [...new Set(pedidos.map((p) => localDoEstagio(p, filtros.estagioLocal)))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [pedidos, localDoEstagio, filtros.estagioLocal],
  );

  /** As peças que passam nos filtros (é isto que o grid mostra). */
  const pedidosFiltrados = useMemo(() => {
    const texto = filtros.texto.trim().toLowerCase();
    const dias = filtros.periodo ? Number(filtros.periodo) : 0;
    const limite = dias > 0 ? Date.now() - dias * 24 * 60 * 60 * 1000 : null;

    return pedidos.filter((pedido) => {
      if (filtros.situacoes.length > 0 && !filtros.situacoes.includes(statusDe(pedido))) {
        return false;
      }
      if (filtros.cliente && String(pedido.cliente ?? '') !== filtros.cliente) return false;

      const local = localDoEstagio(pedido, filtros.estagioLocal);
      if (filtros.local && local !== filtros.local) return false;
      if (filtros.semLocal && local) return false;

      if (limite !== null) {
        const entrada = Date.parse(String(pedido.datainc ?? ''));
        if (Number.isFinite(entrada) && entrada < limite) return false;
      }

      if (texto) {
        const campos = [
          pedido.etiqueta,
          pedido.produto,
          pedido.descricao1,
          pedido.ordcompra,
          pedido.pecliente,
          pedido.cliente,
        ]
          .map((valor) => String(valor ?? '').toLowerCase())
          .join(' ');
        if (!campos.includes(texto)) return false;
      }

      return true;
    });
  }, [pedidos, filtros, localDoEstagio]);

  const filtrosAtivos =
    (filtros.texto.trim() ? 1 : 0) +
    (filtros.cliente ? 1 : 0) +
    (filtros.local ? 1 : 0) +
    (filtros.semLocal ? 1 : 0) +
    (filtros.periodo ? 1 : 0) +
    (filtros.situacoes.length > 0 ? 1 : 0);

  /** Filtro por situação: usado nos botões da barra e nos contadores do topo. */
  function alternarSituacao(situacao: number) {
    setFiltros((f) => ({
      ...f,
      situacoes: f.situacoes.includes(situacao)
        ? f.situacoes.filter((s) => s !== situacao)
        : [...f.situacoes, situacao],
    }));
  }

  /** Ação do menu do topo: fecha o menu e abre a tela. */
  function aoClicarMenu(acao: () => void) {
    return () => {
      setMenuTopo(false);
      acao();
    };
  }

  /**
   * O grid recebe os pedidos JÁ com o local calculado. O valor precisa vir pelo
   * `data`: o TanStack v9 não recalcula as células quando só as colunas mudam
   * (era o sintoma de a coluna LOCAL ficar "sem local" até a próxima interação).
   */
  const linhasDoGrid = useMemo<LinhaGrid[]>(
    () =>
      pedidosFiltrados.map((pedido) => ({
        ...pedido,
        local: localDaColuna(pedido),
        statusNome: nomeEstagio(statusDe(pedido)),
      })),
    [pedidosFiltrados, localDaColuna, nomeEstagio],
  );

  const contadores = useMemo(() => {
    /* quantidade por situação (0 = NORMAL, 1..N = estágios cadastrados) */
    const porStatus = new Map<number, number>();
    pedidos.forEach((pedido) => {
      const situacao = statusDe(pedido);
      porStatus.set(situacao, (porStatus.get(situacao) ?? 0) + 1);
    });

    const doEstagio = (s: number) => porStatus.get(s) ?? 0;

    return {
      total: pedidos.length,
      porStatus,
      normal: porStatus.get(0) ?? 0,
      conferido: doEstagio(1),
      saida: doEstagio(2),
      entrega: doEstagio(3),
    };
  }, [pedidos]);

  const restante = useMemo(
    () => (alvo === null ? null : calcularRestante(pedidos, alvo)),
    [pedidos, alvo],
  );

  const idsSelecionados = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  );

  const table = useTable({
    key: 'conferencia',
    features,
    columns,
    data: linhasDoGrid,
    getRowId: (linha: LinhaGrid) => String(linha.id),
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
  });

  /* -------------------------------------------------------- conferência ---- */
  function abrirPainel(novoAlvo: Alvo) {
    if (pedidos.length === 0) return;

    setAlvo(novoAlvo);
    setCampoEtiqueta('');
    setInfo(null);
    setEtiquetaLida('');
    setMensagem('');
    setTimeout(() => inputEtiqueta.current?.focus(), 50);
  }

  function fecharPainel() {
    somFechar();
    setAlvo(null);
    setInfo(null);
    setMensagem('');
  }

  /**
   * Registra no log de conferência a leitura que acabou de acontecer.
   * É "fire and forget": se o banco não tiver a migração 00109 o log é
   * ignorado e a bipagem segue normal — a conferência nunca pára por causa do log.
   */
  function registrarLeitura(
    valor: string,
    desfecho: DesfechoLog,
    pedidoId: number | null,
    mensagem: string,
  ) {
    void registrarLogBipagem({
      controle: fabricaId,
      estagio: alvo ?? 0,
      desfecho,
      valorLido: valor,
      pedidoId,
      mensagem,
    }).catch(() => {
      /* sem a migração 00109 (ou sem rede) o log é simplesmente ignorado */
    });
  }

  /**
   * Bipagem: aplica as regras do legado e, no sucesso, GRAVA NO BANCO na hora.
   */
  async function conferirEtiqueta(valor: string) {
    if (alvo === null) return;

    const resultado = classificarLeitura(pedidos, valor, alvo, nomeEstagio);

    if (resultado.tipo === 'vazio') return;

    setCampoEtiqueta('');

    if (resultado.tipo === 'naoEncontrada') {
      tocarSom(resultado.som);
      setInfo(null);
      setMensagem(resultado.mensagem);
      registrarLeitura(valor, 'nao_encontrada', null, resultado.mensagem);
      return;
    }

    if (resultado.tipo === 'jaLida') {
      tocarSom(resultado.som);
      setEtiquetaLida(String(resultado.linha.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linha, localDoEstagio(resultado.linha, alvo)));
      setMensagem(resultado.mensagem);
      registrarLeitura(valor, 'ja_lida', Number(resultado.linha.id), resultado.mensagem);
      return;
    }

    if (resultado.tipo === 'bloqueada') {
      tocarSom(resultado.som);
      setEtiquetaLida(String(resultado.linha.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linha, localDoEstagio(resultado.linha, alvo)));
      setMensagem(resultado.mensagem);
      registrarLeitura(valor, 'bloqueada', Number(resultado.linha.id), resultado.mensagem);
      return;
    }

    // Sucesso: baixa na hora (regra definida pelo cliente — não espera o Fechar).
    setGravando(true);
    try {
      // o valor lido vai junto: é o que o log guarda como "valor lido" do sucesso
      await atualizarStatusPorId(resultado.linha.id, alvo, valor);

      setPedidos((atual) =>
        atual.map((linha) => (linha.id === resultado.linha.id ? resultado.linhaAtualizada : linha)),
      );

      const local = localDoEstagio(resultado.linhaAtualizada, alvo);
      setEtiquetaLida(String(resultado.linhaAtualizada.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linhaAtualizada, local));
      setMensagem(resultado.mensagem);

      tocarSom(resultado.som);

      // O legado toca o recurso "BOX"; aqui mostramos o LOCAL do estágio e (opcionalmente) falamos.
      tocarSom('box');
      if (anunciarLocal && local) falarBox(local);
    } catch (falha) {
      tocarSom('error');
      setMensagem(falha instanceof Error ? falha.message : 'Falha ao gravar a bipagem.');
    } finally {
      setGravando(false);
    }
  }

  /* ------------------------------------------------------- menu contexto --- */
  async function alterarStatusSelecionados(status: number) {
    const linhas = table.getSelectedRowModel().rows.map((r) => r.original);
    if (linhas.length === 0) return;

    const etiquetas = linhas.map((l) => String(l.etiqueta ?? '').trim()).filter(Boolean);

    setPedidos((atual) =>
      atual.map((l) => (etiquetas.includes(String(l.etiqueta ?? '').trim()) ? { ...l, status } : l)),
    );
    setRowSelection({});

    try {
      await atualizarStatusPorEtiquetas(etiquetas, status); // legado: UPDATE ... WHERE ETIQUETA IN(...)
      tocarSom('success');
      setMensagem(`${etiquetas.length} etiqueta(s) alterada(s) para ${nomeEstagio(status)}.`);
    } catch (falha) {
      tocarSom('error');
      setErro(falha instanceof Error ? falha.message : 'Falha ao alterar o status.');
      if (fabricaId !== null) void carregarPedidos(fabricaId);
    }
  }

  function cliqueLinha(id: string, evento: React.MouseEvent, etiqueta: string) {
    if (evento.ctrlKey || evento.metaKey) {
      // RowSelectionState no v9 guarda apenas `true` — desmarcar é remover a chave.
      setRowSelection((atual) => {
        const novo = { ...atual };
        if (novo[id]) delete novo[id];
        else novo[id] = true;
        return novo;
      });
    } else {
      setRowSelection({ [id]: true });
    }
    setEtiquetaLida(etiqueta);
    setMensagem('');
  }

  /* ----------------------------------------------------------------- busca -- */
  async function abrirBusca() {
    if (fabricaId === null) return;
    try {
      setValoresBusca(await buscarValores(fabricaId, colunaBusca));
      setValoresMarcados(new Set());
      setCampoBusca('');
      setBuscaAberta(true);
    } catch (falha) {
      tocarSom('error');
      setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os valores da busca.');
    }
  }

  const valoresVisiveis = useMemo(
    () =>
      campoBusca
        ? valoresBusca.filter((v) => v.descricao.includes(campoBusca))
        : valoresBusca,
    [valoresBusca, campoBusca],
  );

  async function aplicarBusca() {
    if (fabricaId === null) return;

    const valores = [...valoresMarcados];
    if (valores.length === 0) {
      setBuscaAberta(false);
      return;
    }

    setBuscaAberta(false);
    setCarregando(true);
    try {
      const encontrados = await buscarPedidosPorFiltro(fabricaId, colunaBusca, valores);
      if (encontrados.length === 0) {
        setMensagem('Nada encontrado.');
        tocarSom('exclamation');
        return;
      }

      setPedidos(encontrados); // legado: MontarGrid(pedidos) — substitui o conteúdo do grid
      setRowSelection({});
      setFiltroUsado(`${colunaBusca}: ${valores.join(', ')}`);
      setMensagem(`${encontrados.length} registro(s) encontrado(s).`);
    } catch (falha) {
      tocarSom('error');
      setErro(falha instanceof Error ? falha.message : 'Falha na busca.');
    } finally {
      setCarregando(false);
    }
  }

  /* -------------------------------------------------------------- exportação */
  function exportarCsv() {
    if (pedidos.length === 0) {
      setMensagem('Nada para exportar.');
      return;
    }

    const visiveis = colunasVisiveis(usuario.perfil);
    /* exporta na MESMA ordem que está no grid (a ordenação escolhida no cabeçalho) */
    const paraExportar = table.getSortedRowModel().rows.map((row) => row.original);
    const linhas = [
      visiveis.map((c) => c.titulo).join(';'),
      ...paraExportar.map((p) =>
        visiveis
          .map((c) => valorExibicao(p, c.campo).replace(/;/g, ','))
          .join(';'),
      ),
    ];

    const blob = new Blob([`\uFEFF${linhas.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-${nomeFabrica || 'fabrica'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    /* h-screen + overflow-hidden: só o grid rola; topo e contadores ficam fixos. */
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex shrink-0 items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <div className="flex items-center gap-3">
          <Marca />
          <span className="rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold" title={`/sysconf/${empresa.slug}`}>
            {empresa.nome}
          </span>
          <span
            className="rounded bg-slate-700 px-2 py-0.5 text-[11px]"
            title={
              fabricaAtual?.integrada
                ? 'Fábrica com integração instalada de leitura de arquivo'
                : 'Fábrica sem integração instalada'
            }
          >
            {fabricaAtual?.integrada ? '★ ' : ''}
            {nomeFabrica || 'sem fábrica'}
          </span>

          {diasTeste !== null && (
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                diasTeste > 0 ? 'bg-emerald-700' : 'bg-red-700'
              }`}
              title={
                empresa.trial_ate
                  ? `Teste grátis até ${new Date(empresa.trial_ate).toLocaleDateString('pt-BR')}`
                  : 'Teste grátis'
              }
            >
              {diasTeste > 0
                ? `Teste grátis: ${diasTeste} dia${diasTeste === 1 ? '' : 's'}`
                : 'Teste encerrado'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-300">
            Usuário: <strong className="text-white">{usuario.login}</strong>
            <span className="ml-2 hidden rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase sm:inline">
              {usuario.perfil === PERFIL.ADMIN ? 'Administrador' : 'Operador'}
            </span>
          </span>

          {/* As telas de administração ficam no menu (☰), para o topo ficar enxuto. */}
          {administrador && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuTopo((aberto) => !aberto)}
                title="Telas de administração"
                className={`rounded border px-2 py-1 ${
                  menuTopo ? 'border-white bg-slate-700' : 'border-slate-600 hover:bg-slate-700'
                }`}
              >
                ☰ Menu
              </button>

              {menuTopo && (
                <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded border border-slate-300 bg-white py-1 text-left text-slate-700 shadow-xl">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Cadastros
                  </p>
                  <ItemMenuTopo rotulo="Fábricas e layout" aoClicar={aoClicarMenu(onAbrirFabricas)} />
                  {administrador && (
                    <ItemMenuTopo
                      rotulo="Estágios da conferência"
                      aoClicar={aoClicarMenu(onAbrirEstagios)}
                    />
                  )}
                  <ItemMenuTopo rotulo="Locais" aoClicar={aoClicarMenu(onAbrirLocais)} />
                  <ItemMenuTopo rotulo="Locais das peças" aoClicar={aoClicarMenu(onAbrirLocaisPecas)} />
                  <ItemMenuTopo rotulo="Usuários" aoClicar={aoClicarMenu(onAbrirUsuarios)} />

                  <p className="mt-1 border-t border-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Operação
                  </p>
                  <ItemMenuTopo rotulo="Arquivos importados" aoClicar={aoClicarMenu(onAbrirImportacoes)} />
                  <ItemMenuTopo rotulo="Logs de conferência" aoClicar={aoClicarMenu(onAbrirLogs)} />

                  <p className="mt-1 border-t border-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Ajuda
                  </p>
                  <ItemMenuTopo
                    rotulo="Manual do sistema"
                    aoClicar={aoClicarMenu(onAbrirAjuda)}
                    className="font-semibold text-emerald-800"
                  />
                </div>
              )}
            </div>
          )}

          <button onClick={onSair} className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-700">
            Sair
          </button>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-200 px-3 py-2 text-xs">
        <button
          onClick={onAbrirImportacao}
          className="rounded border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50"
        >
          Importar
        </button>
        <label className="flex items-center gap-1">
          Estágio
          <select
            value={estagioEscolhido}
            onChange={(e) => setEstagioEscolhido(Number(e.target.value))}
            className="rounded border border-slate-400 bg-white px-2 py-1 font-semibold"
            title="Estágio em que você vai bipar agora"
          >
            {ativos.map((estagio) => (
              <option key={estagio.numero} value={estagio.numero}>
                {estagio.nome}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => abrirPainel(estagioEscolhido)}
          className="rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
          title="Abrir a bipagem no estágio escolhido"
        >
          Conferir
        </button>
        <button
          onClick={exportarCsv}
          className="rounded border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50"
        >
          Exportar CSV
        </button>

        <span className="mx-1 h-5 w-px bg-slate-400" />

        <label className="flex items-center gap-1">
          Fábrica
          <select
            value={fabricaId ?? ''}
            onChange={(e) => onTrocarFabrica(Number(e.target.value))}
            className="rounded border border-slate-400 bg-white px-2 py-1"
            title="As fábricas com integração instalada aparecem fixadas no topo da lista"
          >
            {fabricasIntegradas.length > 0 && (
              <optgroup label="★ Com integração instalada">
                {fabricasIntegradas.map((f) => (
                  <option key={f.controle} value={f.controle}>
                    ★ {f.nome}
                  </option>
                ))}
              </optgroup>
            )}
            {fabricasSemIntegracao.length > 0 && (
              <optgroup label="Demais fábricas (sem integração)">
                {fabricasSemIntegracao.map((f) => (
                  <option key={f.controle} value={f.controle}>
                    {f.nome}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <label className="flex items-center gap-1">
          Buscar em
          <select
            value={colunaBusca}
            onChange={(e) => setColunaBusca(e.target.value)}
            className="rounded border border-slate-400 bg-white px-2 py-1"
          >
            {OPCOES_BUSCA.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.titulo}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => void abrirBusca()}
          className="rounded border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50"
        >
          Buscar
        </button>

        {filtroUsado && (
          <span className="rounded bg-blue-600 px-2 py-0.5 text-[11px] text-white">
            filtro: {filtroUsado}
            <button
              onClick={() => fabricaId !== null && void carregarPedidos(fabricaId)}
              className="ml-2 underline"
            >
              limpar
            </button>
          </span>
        )}

        <span className="ml-auto text-slate-600">
          {carregando
            ? 'Carregando...'
            : pedidosFiltrados.length === pedidos.length
              ? `${pedidos.length} registro(s)`
              : `${pedidosFiltrados.length} de ${pedidos.length} registro(s)`}
        </span>
      </div>

      {/* ------------------------------------------------- filtros rápidos */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-3 py-2 text-xs">
        <label className="flex items-center gap-1">
          <input
            value={filtros.texto}
            onChange={(e) => setFiltros((f) => ({ ...f, texto: e.target.value }))}
            placeholder="procurar etiqueta, peça, ORD.COMPRA, cliente..."
            className="w-64 rounded border border-slate-400 px-2 py-1"
          />
          {filtros.texto && (
            <button
              onClick={() => setFiltros((f) => ({ ...f, texto: '' }))}
              title="Limpar a procura"
              className="rounded border border-slate-300 px-1.5 hover:bg-slate-100"
            >
              ✕
            </button>
          )}
        </label>

        {/* Situação/estágios: combobox de múltipla seleção (padrão = todos) */}
        <ComboboxMultiplo
          rotulo="Situação"
          titulo="Filtrar por situação/estágio (pode marcar vários)"
          placeholder="todos"
          largura="w-64"
          selecionados={filtros.situacoes}
          aoMudar={(novos) => setFiltros((f) => ({ ...f, situacoes: novos }))}
          opcoes={[
            {
              valor: 0,
              rotulo: nomeEstagio(0),
              contagem: contadores.porStatus.get(0) ?? 0,
              cor: '#ffffff',
            },
            ...ativos.map((estagio) => ({
              valor: estagio.numero,
              rotulo: estagio.nome,
              cor: corEstagio(estagio.numero),
              contagem: contadores.porStatus.get(estagio.numero) ?? 0,
            })),
          ]}
        />

        <label className="flex items-center gap-1">
          Cliente
          <select
            value={filtros.cliente}
            onChange={(e) => setFiltros((f) => ({ ...f, cliente: e.target.value }))}
            className="max-w-[220px] rounded border border-slate-400 bg-white px-2 py-1"
          >
            <option value="">todos</option>
            {clientesDaCarga.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1">
          Local em
          <select
            value={filtros.estagioLocal}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, estagioLocal: Number(e.target.value), local: '' }))
            }
            className="rounded border border-slate-400 bg-white px-2 py-1"
          >
            {ativos.map((estagio) => (
              <option key={estagio.numero} value={estagio.numero}>
                {estagio.nome}
              </option>
            ))}
          </select>
          <select
            value={filtros.local}
            onChange={(e) => setFiltros((f) => ({ ...f, local: e.target.value }))}
            className="max-w-[190px] rounded border border-slate-400 bg-white px-2 py-1"
            title="Mostra só as peças que vão para este lugar"
          >
            <option value="">todos</option>
            {locaisDoFiltro.map((local) => (
              <option key={local} value={local}>
                {local}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1" title="Peças sem local definido no estágio escolhido">
          <input
            type="checkbox"
            checked={filtros.semLocal}
            onChange={(e) => setFiltros((f) => ({ ...f, semLocal: e.target.checked }))}
          />
          sem local
        </label>

        <label className="flex items-center gap-1">
          Entrada
          <select
            value={filtros.periodo}
            onChange={(e) => setFiltros((f) => ({ ...f, periodo: e.target.value }))}
            className="rounded border border-slate-400 bg-white px-2 py-1"
          >
            <option value="">tudo</option>
            <option value="1">hoje</option>
            <option value="7">últimos 7 dias</option>
            <option value="30">últimos 30 dias</option>
          </select>
        </label>

        {filtrosAtivos > 0 && (
          <button
            onClick={() =>
              setFiltros((f) => ({
                ...f,
                texto: '',
                cliente: '',
                local: '',
                situacoes: [],
                semLocal: false,
                periodo: '',
              }))
            }
            className="rounded border border-blue-500 bg-blue-50 px-2 py-1 font-semibold text-blue-700 hover:bg-blue-100"
          >
            Limpar filtros ({filtrosAtivos})
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-slate-300 bg-white px-4 py-2 text-xs font-semibold">
            {[0, ...ativos.map((estagio) => estagio.numero)].map((situacao) => {
              const quantidade = contadores.porStatus.get(situacao) ?? 0;
              const ativa = filtros.situacoes.includes(situacao);
              const cor = situacao === 0 ? null : corEstagio(situacao);
              const classe = cor ? '' : (STATUS[situacao]?.contador ?? '');

              return (
                <button
                  key={situacao}
                  onClick={() => alternarSituacao(situacao)}
                  title={`Clique para mostrar somente ${nomeEstagio(situacao)}`}
                  style={cor ? { background: cor } : undefined}
                  className={`${classe} rounded px-2 py-0.5 ${
                    ativa ? 'ring-2 ring-slate-700' : 'hover:brightness-95'
                  }`}
                >
                  {nomeEstagio(situacao)}: {quantidade}
                </button>
              );
            })}
        <span className="text-slate-500">Total: {contadores.total}</span>
        <span className="ml-auto text-slate-500">
          {idsSelecionados.length > 0 ? `${idsSelecionados.length} selecionado(s)` : 'nenhum selecionado'}
        </span>
      </div>

      {erro && (
        <div className="shrink-0 border-b border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700">{erro}</div>
      )}
      {mensagem && !alvo && (
        <div className="shrink-0 border-b border-blue-300 bg-blue-50 px-4 py-2 text-xs text-blue-800">
          {mensagem}
        </div>
      )}

      {/* Só esta área rola. */}
      <div className="tabela-scroll min-h-0 flex-1 overflow-auto">
        <table className="sem-selecao w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-700 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const direcao = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      style={{ minWidth: LARGURAS[header.column.id] }}
                      onClick={header.column.getToggleSortingHandler() as undefined | (() => void)}
                      title={
                        direcao
                          ? direcao === 'asc'
                            ? 'Ordenado do menor para o maior (clique para inverter)'
                            : 'Ordenado do maior para o menor (clique para tirar a ordenação)'
                          : 'Clique para ordenar'
                      }
                      className="cursor-pointer select-none border border-slate-600 px-2 py-1.5 text-left font-semibold hover:bg-slate-600"
                    >
                      <span className="inline-flex items-center gap-1">
                        {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                        <span className={direcao ? 'text-emerald-300' : 'text-slate-400'}>
                          {direcao === 'asc' ? '▲' : direcao === 'desc' ? '▼' : '↕'}
                        </span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getSortedRowModel().rows.map((row) => {
              const status = statusDe(row.original);
              const cor = corEstagio(status);
              const classe = cor ? '' : (STATUS[status]?.classe ?? 'linha-0');

              return (
                <tr
                  key={row.id}
                  style={cor ? { background: cor } : undefined}
                  className={`${classe} ${row.getIsSelected() ? 'selecionada' : ''} cursor-pointer`}
                  onClick={(e) => cliqueLinha(row.id, e, String(row.original.etiqueta ?? '').trim())}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!row.getIsSelected()) setRowSelection({ [row.id]: true });
                    setMenu({ x: e.clientX, y: e.clientY, id: row.id });
                  }}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="truncate border border-slate-300 px-2 py-1">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              );
            })}
            {!carregando && pedidos.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-500">
                  Nenhum pedido para esta fábrica. Use <strong>Importar</strong> para carregar um arquivo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {menu && (
        <div
          className="fixed z-30 w-60 rounded border border-slate-300 bg-white py-1 text-xs shadow-xl"
          style={{ left: menu.x, top: menu.y }}
        >
          {[0, ...ativos.map((estagio) => estagio.numero)].map((status) => (
            <button
              key={status}
              className="block w-full px-3 py-1.5 text-left hover:bg-slate-100"
              onClick={() => void alterarStatusSelecionados(status)}
            >
              Alterar para {nomeEstagio(status)}
            </button>
          ))}
        </div>
      )}

      {buscaAberta && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="overlay-surgir w-full max-w-[560px] rounded-lg border border-slate-300 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <span className="text-sm font-semibold">Buscar por {colunaBusca}</span>
              <span className="text-xs text-slate-500">{valoresMarcados.size} selecionado(s)</span>
            </div>

            <div className="border-b border-slate-200 px-4 py-2">
              <input
                autoFocus
                value={campoBusca}
                onChange={(e) => setCampoBusca(e.target.value)}
                placeholder="filtrar a lista..."
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
              />
            </div>

            <div className="max-h-[45vh] overflow-auto p-4 text-xs">
              {valoresVisiveis.length === 0 && <p className="text-slate-500">Nenhum valor encontrado.</p>}
              {valoresVisiveis.map((item) => (
                <label key={item.valor} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={valoresMarcados.has(item.valor)}
                    onChange={(e) =>
                      setValoresMarcados((atual) => {
                        const novo = new Set(atual);
                        if (e.target.checked) novo.add(item.valor);
                        else novo.delete(item.valor);
                        return novo;
                      })
                    }
                  />
                  {item.descricao}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-2">
              <button
                onClick={() => setBuscaAberta(false)}
                className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
              >
                Fechar
              </button>
              <button
                onClick={() => void aplicarBusca()}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Incluir lojas selecionadas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ painel de conferência */}
      {alvo !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-800/95 p-4 text-white">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-600 pb-2">
            <div className="text-sm font-semibold">
              {nomeEstagio(alvo)} — {nomeFabrica}
              <span className="ml-3 text-xs text-slate-300">
                Restante: {restante?.texto.replace('Restante: ', '')} · Normal: {contadores.normal} · Conferido:{' '}
                {contadores.conferido} · Saída: {contadores.saida} · Entrega: {contadores.entrega}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={anunciarLocal}
                  onChange={(e) => setAnunciarLocal(e.target.checked)}
                />
                anunciar local (voz)
              </label>
              <button
                onClick={fecharPainel}
                className="rounded border border-slate-500 px-3 py-1 text-xs hover:bg-slate-700"
              >
                Fechar (Esc)
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 pt-4">
            {/* LOCAL de destino do estágio */}
            <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/60 px-2">
              <span className="text-xs tracking-widest text-slate-400">LOCAL — {nomeEstagio(alvo)}</span>
              <span
                className={`truncate text-center leading-none font-bold ${info?.box ? 'text-[56px]' : 'text-[28px]'}`}
                title={info?.box ?? 'Nenhum local definido para este estágio'}
              >
                {info?.box || 'SEM LOCAL DEFINIDO'}
              </span>
              <span className="mt-2 text-center text-xs text-slate-400">
                {restante?.concluido ? 'conferência concluída' : 'aguardando bipagem'}
              </span>
            </div>

            {/* peça / quantidade / pedido da bipagem */}
            <div className="flex flex-col justify-center gap-3">
              <div>
                <div className="text-xs tracking-widest text-slate-400">PEÇA</div>
                <div className="text-2xl font-semibold">{info?.peca ?? '—'}</div>
              </div>
              <div className="flex gap-8">
                <div>
                  <div className="text-xs tracking-widest text-slate-400">QUANTIDADE</div>
                  <div className="text-2xl font-semibold">{info?.quantidade || '—'}</div>
                </div>
                <div>
                  <div className="text-xs tracking-widest text-slate-400">PEDIDO</div>
                  <div className="text-2xl font-semibold">{info?.pedido || '—'}</div>
                </div>
              </div>
              <div className="text-xs text-slate-300">
                Cliente: {info?.cliente || '—'}
                {administrador && <> · Etiqueta: {info?.etiqueta || etiquetaLida || '—'}</>}
              </div>
              {mensagem && (
                <div className="rounded border border-slate-500 bg-slate-900/60 px-3 py-2 text-sm">
                  {mensagem}
                </div>
              )}
            </div>

            {/* leitura */}
            <div className="flex flex-col justify-center rounded-lg bg-slate-900/60 p-4">
              <label className="mb-2 text-xs tracking-widest text-slate-400" htmlFor="etiqueta">
                LEITURA DA ETIQUETA ({nomeEstagio(alvo)})
              </label>
              <input
                id="etiqueta"
                ref={inputEtiqueta}
                value={campoEtiqueta}
                onChange={(e) => setCampoEtiqueta(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void conferirEtiqueta(campoEtiqueta);
                }}
                placeholder="passe o leitor / digite e pressione Enter"
                className="rounded border border-slate-500 bg-slate-900 px-3 py-3 text-lg text-white outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => void conferirEtiqueta(campoEtiqueta)}
                disabled={gravando}
                className="mt-4 rounded bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {gravando ? 'Gravando...' : 'Conferir etiqueta'}
              </button>
              <p className="mt-3 text-[11px] leading-snug text-slate-400">
                A baixa é gravada no banco a cada bipagem com sucesso. Sem bipar a peça não há baixa.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
