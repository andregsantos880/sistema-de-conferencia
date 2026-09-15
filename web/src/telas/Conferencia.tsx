import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  atualizarStatusPorEtiquetas,
  atualizarStatusPorIds,
  buscarValores,
  listarPedidos,
  type Fabrica,
  type ItemBusca,
  type Pedido,
} from '../lib/api';
import { COLUNAS_GRID, OPCOES_BUSCA, STATUS } from '../lib/config';
import { somErro, somFechar, somOk } from '../lib/audio';

type Props = {
  usuario: string;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onAbrirImportacao: () => void;
  onSair: () => void;
};

type MenuContexto = { x: number; y: number; id: number } | null;

/**
 * Recriação do Form1 (conferência de pedidos).
 * Mantém a estrutura do WinForms: barra de ações, combo de fábrica, busca,
 * contadores por status, grid colorido por status e o painel de conferência
 * (FrameGroupBox) com o número do box em destaque e o campo de etiqueta.
 *
 * As fábricas e a fábrica ativa vêm do Sysconf para que a seleção sobreviva
 * à ida e volta da tela de importação.
 */
export default function Conferencia({
  usuario,
  fabricas,
  fabricaId,
  onTrocarFabrica,
  onAbrirImportacao,
  onSair,
}: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [menu, setMenu] = useState<MenuContexto>(null);

  const [colunaBusca, setColunaBusca] = useState<string>('ORDCOMPRA');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [valoresBusca, setValoresBusca] = useState<ItemBusca[]>([]);
  const [valoresMarcados, setValoresMarcados] = useState<Set<string>>(new Set());
  const [filtroAplicado, setFiltroAplicado] = useState<string[]>([]);

  const [conferindo, setConferindo] = useState(false);
  const [etiquetaAtual, setEtiquetaAtual] = useState('');
  const [campoEtiqueta, setCampoEtiqueta] = useState('');
  const [mensagem, setMensagem] = useState('');
  const inputEtiqueta = useRef<HTMLInputElement>(null);

  const carregarPedidos = useCallback(async (idlayout: number) => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarPedidos(idlayout);
      setPedidos(lista);
      setSelecionados(new Set());
      setFiltroAplicado([]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os pedidos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (fabricaId !== null) void carregarPedidos(fabricaId);
  }, [fabricaId, carregarPedidos]);

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
        setConferindo(false);
      }
    }
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  /* ------------------------------------------------------------ contadores */
  const contadores = useMemo(() => {
    const total = pedidos.length;
    const por = (s: number) => pedidos.filter((p) => Number(p.status ?? 0) === s).length;
    return { total, normal: por(0), conferido: por(1), saida: por(2), entrega: por(3) };
  }, [pedidos]);

  const nomeFabrica = useMemo(
    () => fabricas.find((f) => f.controle === fabricaId)?.nome ?? '',
    [fabricas, fabricaId],
  );

  /* --------------------------------------------------------------- filtros */
  const visiveis = useMemo(() => {
    if (filtroAplicado.length === 0) return pedidos;
    return pedidos.filter((p) => filtroAplicado.includes(valorDaColuna(p, colunaBusca)));
  }, [pedidos, filtroAplicado, colunaBusca]);

  function valorDaColuna(pedido: Pedido, coluna: string): string {
    const chave = coluna.toLowerCase();
    const valor = (pedido as unknown as Record<string, unknown>)[chave];
    return String(valor ?? '');
  }

  /* ----------------------------------------------------------- operações -- */
  async function alterarStatus(ids: number[], status: number) {
    if (ids.length === 0) return;
    const conjunto = new Set(ids);
    setPedidos((atual) => atual.map((p) => (conjunto.has(p.id) ? { ...p, status } : p)));
    setSelecionados(new Set());

    try {
      await atualizarStatusPorIds(ids, status);
      somOk();
      setMensagem(`${ids.length} pedido(s) alterado(s) para ${STATUS[status].rotulo}.`);
    } catch (falha) {
      somErro();
      setErro(falha instanceof Error ? falha.message : 'Falha ao atualizar o status.');
      if (fabricaId !== null) void carregarPedidos(fabricaId);
    }
  }

  async function alterarStatusPorEtiqueta(etiquetas: string[], status: number) {
    const limpas = etiquetas.map((e) => e.trim()).filter(Boolean);
    if (limpas.length === 0) return;

    try {
      await atualizarStatusPorEtiquetas(limpas, status);
      const alvo = new Set(limpas.map((e) => e.toUpperCase()));
      setPedidos((atual) =>
        atual.map((p) => (alvo.has(String(p.etiqueta ?? '').trim().toUpperCase()) ? { ...p, status } : p)),
      );
      somOk();
      setMensagem(`${limpas.length} etiqueta(s) alterada(s) para ${STATUS[status].rotulo}.`);
    } catch (falha) {
      somErro();
      setErro(falha instanceof Error ? falha.message : 'Falha ao atualizar por etiqueta.');
    }
  }

  /** Leitura de etiqueta no painel de conferência (lógica do ChecarEtiqueta). */
  async function conferirEtiquetaLeitura(valor: string) {
    const etiqueta = valor.trim();
    if (!etiqueta) return;

    const encontrado = pedidos.find(
      (p) => String(p.etiqueta ?? '').trim().toUpperCase() === etiqueta.toUpperCase(),
    );

    if (!encontrado) {
      somErro();
      setMensagem(`Etiqueta ${etiqueta} não encontrada nesta fábrica.`);
      setCampoEtiqueta('');
      return;
    }

    setEtiquetaAtual(String(encontrado.etiqueta ?? ''));
    setCampoEtiqueta('');
    // No legado a leitura também destaca a linha, o que preenche CLIENTE/PRODUTO do painel.
    setSelecionados(new Set([encontrado.id]));
    await alterarStatusPorEtiqueta([etiqueta], 1);
  }

  function cliqueLinha(pedido: Pedido, evento: React.MouseEvent) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (evento.ctrlKey || evento.metaKey) {
        if (novo.has(pedido.id)) novo.delete(pedido.id);
        else novo.add(pedido.id);
      } else {
        novo.clear();
        novo.add(pedido.id);
      }
      return novo;
    });
    setEtiquetaAtual(String(pedido.etiqueta ?? ''));
  }

  const pedidoSelecionado = useMemo(
    () => pedidos.find((p) => selecionados.has(p.id)) ?? null,
    [pedidos, selecionados],
  );

  /* ------------------------------------------------------------- exportação */
  function exportarCsv() {
    const base = filtroAplicado.length > 0 ? visiveis : pedidos;
    if (base.length === 0) {
      setMensagem('Nada para exportar.');
      return;
    }

    const colunas = COLUNAS_GRID.map((c) => c.campo);
    const linhas = [
      COLUNAS_GRID.map((c) => c.titulo).join(';'),
      ...base.map((p) =>
        colunas
          .map((campo) => String((p as unknown as Record<string, unknown>)[campo] ?? '').replace(/;/g, ','))
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

  /* ------------------------------------------------------------------ busca */
  async function abrirBusca() {
    if (fabricaId === null) return;
    try {
      const valores = await buscarValores(fabricaId, colunaBusca);
      setValoresBusca(valores);
      setValoresMarcados(new Set());
      setBuscaAberta(true);
    } catch (falha) {
      somErro();
      setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os valores da busca.');
    }
  }

  function aplicarBusca() {
    setFiltroAplicado([...valoresMarcados]);
    setBuscaAberta(false);
    setMensagem(
      valoresMarcados.size === 0
        ? 'Filtro removido.'
        : `${valoresMarcados.size} valor(es) filtrado(s) em ${colunaBusca}.`,
    );
  }

  const idsSelecionados = [...selecionados];

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      {/* ----------------------------------------------------------- topo -- */}
      <header className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide">SysConf</span>
          <span className="rounded bg-slate-700 px-2 py-0.5 text-[11px]">{nomeFabrica || 'sem fábrica'}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-300">Usuário: <strong className="text-white">{usuario}</strong></span>
          <button onClick={onSair} className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-700">
            Sair
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------- toolbar -- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-200 px-3 py-2 text-xs">
        <button
          onClick={onAbrirImportacao}
          className="rounded border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-slate-50"
        >
          Importar
        </button>
        <button
          onClick={() => {
            setConferindo(true);
            setTimeout(() => inputEtiqueta.current?.focus(), 50);
          }}
          className="rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
        >
          Conferência
        </button>
        <button
          onClick={() => void alterarStatus(idsSelecionados, 2)}
          className="rounded border border-orange-500 bg-white px-3 py-1.5 font-semibold text-orange-700 hover:bg-orange-50"
        >
          Saída
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
          >
            {fabricas.map((f) => (
              <option key={f.controle} value={f.controle}>
                {f.nome}
              </option>
            ))}
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

        {filtroAplicado.length > 0 && (
          <span className="rounded bg-blue-600 px-2 py-0.5 text-[11px] text-white">
            filtro: {filtroAplicado.length} valor(es)
            <button onClick={() => setFiltroAplicado([])} className="ml-2 underline">
              limpar
            </button>
          </span>
        )}

        <span className="ml-auto text-slate-600">
          {carregando ? 'Carregando...' : `${visiveis.length} de ${pedidos.length} registro(s)`}
        </span>
      </div>

      {/* ------------------------------------------------------- contadores -- */}
      <div className="flex flex-wrap items-center gap-5 border-b border-slate-300 bg-white px-4 py-2 text-xs font-semibold">
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
        <div className="border-b border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700">{erro}</div>
      )}
      {mensagem && (
        <div className="border-b border-blue-300 bg-blue-50 px-4 py-2 text-xs text-blue-800">{mensagem}</div>
      )}

      {/* -------------------------------------------------------------- grid */}
      <div className="tabela-scroll flex-1 overflow-auto">
        <table className="sem-selecao w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-700 text-white">
            <tr>
              {COLUNAS_GRID.map((coluna) => (
                <th
                  key={coluna.campo}
                  style={{ minWidth: coluna.largura }}
                  className="border border-slate-600 px-2 py-1.5 text-left font-semibold"
                >
                  {coluna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((pedido) => {
              const status = Number(pedido.status ?? 0);
              const classe = STATUS[status]?.classe ?? 'linha-0';
              return (
                <tr
                  key={pedido.id}
                  className={`${classe} ${selecionados.has(pedido.id) ? 'selecionada' : ''} cursor-pointer`}
                  onClick={(e) => cliqueLinha(pedido, e)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    cliqueLinha(pedido, { ctrlKey: false } as React.MouseEvent);
                    setMenu({ x: e.clientX, y: e.clientY, id: pedido.id });
                  }}
                >
                  {COLUNAS_GRID.map((coluna) => (
                    <td key={coluna.campo} className="truncate border border-slate-300 px-2 py-1">
                      {coluna.campo === 'flbloqueio'
                        ? pedido.flbloqueio
                          ? 'SIM'
                          : ''
                        : String((pedido as unknown as Record<string, unknown>)[coluna.campo] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!carregando && visiveis.length === 0 && (
              <tr>
                <td colSpan={COLUNAS_GRID.length} className="px-3 py-6 text-center text-slate-500">
                  Nenhum pedido para esta fábrica. Use <strong>Importar</strong> para carregar um arquivo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --------------------------------------------------- menu de contexto */}
      {menu && (
        <div
          className="fixed z-30 w-56 rounded border border-slate-300 bg-white py-1 text-xs shadow-xl"
          style={{ left: menu.x, top: menu.y }}
        >
          {[0, 1, 2].map((status) => (
            <button
              key={status}
              className="block w-full px-3 py-1.5 text-left hover:bg-slate-100"
              onClick={() => void alterarStatus(idsSelecionados.length > 0 ? idsSelecionados : [menu.id], status)}
            >
              Alterar para {STATUS[status].rotulo}
            </button>
          ))}
          <button
            className="block w-full border-t border-slate-200 px-3 py-1.5 text-left hover:bg-slate-100"
            onClick={() => void alterarStatusPorEtiqueta([String(pedidoSelecionado?.etiqueta ?? '')], 3)}
          >
            Registar Entrega
          </button>
        </div>
      )}

      {/* ------------------------------------------------- painel de busca -- */}
      {buscaAberta && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="overlay-surgir w-full max-w-[520px] rounded-lg border border-slate-300 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold">
              Buscar por {colunaBusca}
            </div>
            <div className="max-h-[45vh] overflow-auto p-4 text-xs">
              {valoresBusca.length === 0 && <p className="text-slate-500">Nenhum valor encontrado.</p>}
              {valoresBusca.map((item) => (
                <label key={item.valor} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={valoresMarcados.has(item.valor)}
                    onChange={(e) => {
                      setValoresMarcados((atual) => {
                        const novo = new Set(atual);
                        if (e.target.checked) novo.add(item.valor);
                        else novo.delete(item.valor);
                        return novo;
                      });
                    }}
                  />
                  {item.descricao}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2">
              <span className="text-xs text-slate-500">{valoresMarcados.size} selecionado(s)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBuscaAberta(false)}
                  className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                >
                  Fechar
                </button>
                <button
                  onClick={aplicarBusca}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Incluir lojas selecionadas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------- painel de conferência -- */}
      {conferindo && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-800/95 p-4 text-white">
          <div className="flex items-center justify-between border-b border-slate-600 pb-2">
            <div className="text-sm font-semibold">
              Conferência — {nomeFabrica}
              <span className="ml-3 text-xs text-slate-300">
                Normal: {contadores.normal} · Conferido: {contadores.conferido} · Saída:{' '}
                {contadores.saida} · Entrega: {contadores.entrega}
              </span>
            </div>
            <button
              onClick={() => {
                somFechar();
                setConferindo(false);
              }}
              className="rounded border border-slate-500 px-3 py-1 text-xs hover:bg-slate-700"
            >
              Fechar (Esc)
            </button>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/60">
              <span className="text-xs tracking-widest text-slate-400">BOX</span>
              <span className="text-[80px] leading-none font-bold">
                {pedidoSelecionado?.idbox ?? 1}
              </span>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <div>
                <div className="text-xs tracking-widest text-slate-400">CLIENTE</div>
                <div className="text-2xl font-semibold">{pedidoSelecionado?.cliente ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs tracking-widest text-slate-400">PRODUTO</div>
                <div className="text-2xl font-semibold">{pedidoSelecionado?.produto ?? '—'}</div>
              </div>
              <div className="text-xs text-slate-300">{pedidoSelecionado?.descricao1 ?? ''}</div>
            </div>

            <div className="flex flex-col justify-center rounded-lg bg-slate-900/60 p-4">
              <label className="mb-2 text-xs tracking-widest text-slate-400" htmlFor="etiqueta">
                LEITURA DA ETIQUETA
              </label>
              <input
                id="etiqueta"
                ref={inputEtiqueta}
                value={campoEtiqueta}
                onChange={(e) => setCampoEtiqueta(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void conferirEtiquetaLeitura(campoEtiqueta);
                }}
                placeholder="passe o leitor / digite e pressione Enter"
                className="rounded border border-slate-500 bg-slate-900 px-3 py-3 text-lg text-white outline-none focus:border-emerald-400"
              />
              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <div>
                  Etiqueta atual: <strong className="text-white">{etiquetaAtual || '—'}</strong>
                </div>
                <div>
                  Restante (não conferido): <strong className="text-white">{contadores.normal}</strong>
                </div>
              </div>
              <button
                onClick={() => void conferirEtiquetaLeitura(campoEtiqueta)}
                className="mt-4 rounded bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                Conferir etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
