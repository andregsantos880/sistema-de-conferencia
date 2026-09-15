import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  atualizarStatusPorEtiquetas,
  atualizarStatusPorId,
  buscarPedidosPorFiltro,
  buscarValores,
  listarBoxes,
  listarPedidos,
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
  ROTULO_MENU,
  STATUS,
  TITULO_BOX,
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
  onSair: () => void;
};

type MenuContexto = { x: number; y: number; id: string } | null;

/* TanStack Table v9: as features precisam ser registradas explicitamente. */
const features = tableFeatures({ rowSelectionFeature });

/**
 * Valor como aparece na tela (usado no grid e na exportação).
 * A coluna STATUS mostra o ESTÁGIO da conferência em vez do número:
 * 0 = NORMAL, 1 = CONFERÊNCIA (entrada), 2 = SAÍDA, 3 = ENTREGA.
 */
function valorExibicao(pedido: Pedido, campo: string): string {
  const bruto = (pedido as unknown as Record<string, unknown>)[campo];

  if (campo === 'flbloqueio') return bruto ? 'SIM' : '';
  if (campo === 'status') return DS_STATUS[Number(bruto ?? 0)] ?? String(bruto ?? '');

  return String(bruto ?? '');
}

/**
 * Colunas do grid conforme o PERFIL do usuário logado:
 *  - a ETIQUETA (código de barras) só aparece para ADMIN;
 *  - ID, FÁBRICA, ID LAYOUT, ID BOX, BLOQUEIO e PC não aparecem para ninguém.
 */
function montarColunas(perfil: string): Array<ColumnDef<typeof features, Pedido>> {
  return colunasVisiveis(perfil).map((coluna) => ({
    id: coluna.campo,
    accessorFn: (linha: Pedido) => valorExibicao(linha, coluna.campo),
    header: coluna.titulo,
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
  onSair,
}: Props) {
  const administrador = usuario.perfil === PERFIL.ADMIN;
  const columns = useMemo(() => montarColunas(usuario.perfil), [usuario.perfil]);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [boxes, setBoxes] = useState<Array<{ idbox: number; nmbox: string }>>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [filtroUsado, setFiltroUsado] = useState('');

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [menu, setMenu] = useState<MenuContexto>(null);

  const [colunaBusca, setColunaBusca] = useState<string>('ORDCOMPRA');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [valoresBusca, setValoresBusca] = useState<ItemBusca[]>([]);
  const [valoresMarcados, setValoresMarcados] = useState<Set<string>>(new Set());
  const [campoBusca, setCampoBusca] = useState('');

  const [alvo, setAlvo] = useState<Alvo | null>(null);
  const [campoEtiqueta, setCampoEtiqueta] = useState('');
  const [etiquetaLida, setEtiquetaLida] = useState('');
  const [info, setInfo] = useState<InfoBipagem | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [anunciarBox, setAnunciarBox] = useState(true);
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

  useEffect(() => {
    listarBoxes()
      .then(setBoxes)
      .catch(() => setBoxes([]));
  }, []);

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
  const nomeDoBox = useCallback(
    (pedido: Pedido) => boxes.find((b) => b.idbox === Number(pedido.idbox))?.nmbox,
    [boxes],
  );

  const contadores = useMemo(() => {
    const por = (s: number) => pedidos.filter((p) => statusDe(p) === s).length;
    return {
      total: pedidos.length,
      normal: por(0),
      conferido: por(1),
      saida: por(2),
      entrega: por(3),
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
    data: pedidos,
    getRowId: (linha: Pedido) => String(linha.id),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
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
   * Bipagem: aplica as regras do legado e, no sucesso, GRAVA NO BANCO na hora.
   */
  async function conferirEtiqueta(valor: string) {
    if (alvo === null) return;

    const resultado = classificarLeitura(pedidos, valor, alvo);

    if (resultado.tipo === 'vazio') return;

    setCampoEtiqueta('');

    if (resultado.tipo === 'naoEncontrada') {
      tocarSom(resultado.som);
      setInfo(null);
      setMensagem(resultado.mensagem);
      return;
    }

    if (resultado.tipo === 'jaLida') {
      tocarSom(resultado.som);
      setEtiquetaLida(String(resultado.linha.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linha, nomeDoBox(resultado.linha)));
      setMensagem(resultado.mensagem);
      return;
    }

    if (resultado.tipo === 'bloqueada') {
      tocarSom(resultado.som);
      setEtiquetaLida(String(resultado.linha.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linha, nomeDoBox(resultado.linha)));
      setMensagem(resultado.mensagem);
      return;
    }

    // Sucesso: baixa na hora (regra definida pelo cliente — não espera o Fechar).
    setGravando(true);
    try {
      await atualizarStatusPorId(resultado.linha.id, alvo);

      setPedidos((atual) =>
        atual.map((linha) => (linha.id === resultado.linha.id ? resultado.linhaAtualizada : linha)),
      );

      const box = nomeDoBox(resultado.linhaAtualizada);
      setEtiquetaLida(String(resultado.linhaAtualizada.etiqueta ?? '').trim());
      setInfo(montarInfoBipagem(resultado.linhaAtualizada, box));
      setMensagem(resultado.mensagem);

      tocarSom(resultado.som);

      // O legado toca o recurso "BOX"; aqui mostramos e (opcionalmente) falamos o box.
      tocarSom('box');
      if (anunciarBox && box) falarBox(box);
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
      setMensagem(`${etiquetas.length} etiqueta(s) alterada(s) para ${STATUS[status].rotulo}.`);
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
    const linhas = [
      visiveis.map((c) => c.titulo).join(';'),
      ...pedidos.map((p) => visiveis.map((c) => valorExibicao(p, c.campo).replace(/;/g, ',')).join(';')),
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
          <span className="text-sm font-semibold tracking-wide">SysConf</span>
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
            <span className="ml-2 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase">
              {usuario.perfil === PERFIL.ADMIN ? 'Administrador' : 'Operador'}
            </span>
          </span>
          {administrador && (
            <button
              onClick={onAbrirUsuarios}
              className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-700"
            >
              Usuários
            </button>
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
        <button
          onClick={() => abrirPainel(1)}
          className="rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
        >
          Conferência
        </button>
        <button
          onClick={() => abrirPainel(2)}
          className="rounded border border-orange-500 bg-white px-3 py-1.5 font-semibold text-orange-700 hover:bg-orange-50"
        >
          Saída
        </button>
        <button
          onClick={() => abrirPainel(3)}
          className="rounded border border-blue-600 bg-white px-3 py-1.5 font-semibold text-blue-700 hover:bg-blue-50"
        >
          Entrega
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
          {carregando ? 'Carregando...' : `${pedidos.length} registro(s)`}
        </span>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-5 border-b border-slate-300 bg-white px-4 py-2 text-xs font-semibold">
        <span className="contador-normal">Normal: {contadores.normal}</span>
        <span className="contador-conferido">Conferido: {contadores.conferido}</span>
        <span className="contador-saida">Saída: {contadores.saida}</span>
        <span className="contador-entrega">Entrega: {contadores.entrega}</span>
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
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ minWidth: LARGURAS[header.column.id] }}
                    className="border border-slate-600 px-2 py-1.5 text-left font-semibold"
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const status = statusDe(row.original);
              const classe = STATUS[status]?.classe ?? 'linha-0';

              return (
                <tr
                  key={row.id}
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
          {[0, 1, 2].map((status) => (
            <button
              key={status}
              className="block w-full px-3 py-1.5 text-left hover:bg-slate-100"
              onClick={() => void alterarStatusSelecionados(status)}
            >
              Alterar para {ROTULO_MENU[status]}
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
              {TITULO_BOX[alvo]} — {nomeFabrica}
              <span className="ml-3 text-xs text-slate-300">
                Restante: {restante?.texto.replace('Restante: ', '')} · Normal: {contadores.normal} · Conferido:{' '}
                {contadores.conferido} · Saída: {contadores.saida} · Entrega: {contadores.entrega}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={anunciarBox}
                  onChange={(e) => setAnunciarBox(e.target.checked)}
                />
                anunciar box (voz)
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
            {/* BOX de destino */}
            <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/60 px-2">
              <span className="text-xs tracking-widest text-slate-400">BOX</span>
              <span className="truncate text-center text-[64px] leading-none font-bold" title={info?.box ?? ''}>
                {info?.box ?? '—'}
              </span>
              <span className="mt-2 text-xs text-slate-400">
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
                LEITURA DA ETIQUETA ({TITULO_BOX[alvo]})
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
