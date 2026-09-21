import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AVISO_LOGS,
  definirRetencaoLogs,
  lerRetencaoLogs,
  limparLogs,
  listarLogs,
  migracaoPendente,
  resumoLogs,
  type DesfechoLog,
  type FiltrosLog,
  type LogConferencia,
  type ResumoLogs,
} from '../lib/api';
import type { Empresa, Fabrica, UsuarioLogado } from '../lib/api';
import { baixarCsv } from '../lib/arquivo';
import { ThOrdenavel, useOrdenacao, type CampoOrdenavel } from '../lib/ordenacao';
import { PERFIL } from '../lib/config';
import { DS_STATUS } from '../lib/regrasConferencia';
import { useEstagios } from '../lib/estagios';

/** Rótulo do status pelo cadastro de estágios (0 = NORMAL); DS_STATUS é o fallback. */
function rotuloStatus(valor: number | null | undefined, rotulos: Record<number, string>): string {
  if (valor === null || valor === undefined) return '—';
  return rotulos[Number(valor)] ?? DS_STATUS[Number(valor)] ?? String(valor);
}

type Props = {
  empresa: Empresa;
  usuarioLogado: UsuarioLogado;
  fabricas: Fabrica[];
  onVoltar: () => void;
};

/** Rótulo e cor de cada desfecho do log. */
const DESFECHOS: Record<DesfechoLog, { rotulo: string; classe: string }> = {
  sucesso: { rotulo: 'Sucesso', classe: 'bg-emerald-100 text-emerald-800' },
  ja_lida: { rotulo: 'Já lida', classe: 'bg-amber-100 text-amber-800' },
  bloqueada: { rotulo: 'Fora de ordem', classe: 'bg-orange-100 text-orange-800' },
  nao_encontrada: { rotulo: 'Não encontrada', classe: 'bg-red-100 text-red-700' },
  massa: { rotulo: 'Alteração em massa', classe: 'bg-sky-100 text-sky-800' },
};

const ROTULO_ESTAGIO: Record<number, string> = {
  0: '—',
  1: 'CONFERENCIA',
  2: 'SAIDA',
  3: 'ENTREGA',
};

const dataHora = (valor: string): string => {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleString('pt-BR');
};

const comoDataIso = (data: Date): string => {
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

/** Período inicial: últimos 7 dias (não varre a base inteira à toa). */
function periodoInicial(): { de: string; ate: string } {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 6);
  return { de: comoDataIso(inicio), ate: comoDataIso(hoje) };
}

/**
 * Tela de Logs de Conferência (só administrador).
 *
 * Mostra cada leitura feita no painel de bipagem — nos três estágios
 * (1=CONFERENCIA, 2=SAIDA, 3=ENTREGA) — incluindo as bipagens erradas
 * ("não encontrada"), as repetidas ("já lida"), as fora de ordem e as
 * alterações em massa feitas pelo menu de contexto.
 *
 * Aqui também se configura a RETENÇÃO: quantos dias de log guardar
 * (0 = para sempre). A limpeza roda ao abrir a tela e no botão "Limpar agora".
 */
export default function Logs({ usuarioLogado, fabricas, onVoltar }: Props) {
  const { rotulos: rotulosEstagio, ativos } = useEstagios();
  const inicial = useMemo(periodoInicial, []);
  const [filtro, setFiltro] = useState({
    ...inicial,
    controle: '',
    usuario: '',
    desfecho: '',
    texto: '',
    ordcompra: '',
  });

  const [logs, setLogs] = useState<LogConferencia[]>([]);

  /** Colunas ordenáveis: o clique no cabeçalho alterna asc → desc → sem ordenação. */
  const campos = useMemo<Record<string, CampoOrdenavel<LogConferencia>>>(() => ({
    data: { titulo: 'Data / hora', valor: (l) => l.criado_em },
    fabrica: { titulo: 'Fábrica', valor: (l) => l.fabrica },
    estagio: { titulo: 'Estágio', valor: (l) => l.estagio, tipo: 'numero' },
    desfecho: { titulo: 'Desfecho', valor: (l) => DESFECHOS[l.desfecho]?.rotulo ?? l.desfecho },
    lido: { titulo: 'Lido', valor: (l) => l.valor_lido },
    etiqueta: { titulo: 'Etiqueta', valor: (l) => l.etiqueta },
    pedido: { titulo: 'Pedido', valor: (l) => l.ordcompra },
    produto: { titulo: 'Produto', valor: (l) => l.produto },
    qtde: { titulo: 'Qtde', valor: (l) => l.qtde, tipo: 'numero' },
    cliente: { titulo: 'Cliente', valor: (l) => l.cliente },
    box: { titulo: 'Box', valor: (l) => l.nmbox },
    status: { titulo: 'Status', valor: (l) => l.status_antes, tipo: 'numero' },
    usuario: { titulo: 'Usuário', valor: (l) => l.usuario_login },
  }), []);

  const { linhas: logsOrdenados, ordem, alternar } = useOrdenacao(logs, campos);
  const [resumo, setResumo] = useState<ResumoLogs | null>(null);
  const [retencao, setRetencao] = useState<number | null>(null);
  const [retencaoEditada, setRetencaoEditada] = useState('');
  const [selecionado, setSelecionado] = useState<LogConferencia | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const filtros: FiltrosLog = useMemo(
    () => ({
      de: filtro.de,
      ate: filtro.ate,
      controle: filtro.controle ? Number(filtro.controle) : null,
      usuario: filtro.usuario,
      desfecho: filtro.desfecho,
      texto: filtro.texto,
      ordcompra: filtro.ordcompra,
      limite: 2000,
    }),
    [filtro],
  );

  const pesquisar = useCallback(async () => {
    setErro('');
    setCarregando(true);
    try {
      const [lista, totais] = await Promise.all([listarLogs(filtros), resumoLogs(filtros)]);
      setLogs(lista);
      setResumo(totais);
      setMigracaoOk(true);
      setSelecionado(null);
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os logs.');
      }
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    void pesquisar();
  }, [pesquisar]);

  useEffect(() => {
    lerRetencaoLogs()
      .then((dias) => {
        setRetencao(dias);
        setRetencaoEditada(String(dias));
      })
      .catch(() => setRetencao(null));
  }, []);

  async function salvarRetencao() {
    const dias = Number(retencaoEditada);
    if (!Number.isInteger(dias) || dias < 0 || dias > 3650) {
      setErro('Informe um número de dias entre 0 (nunca apagar) e 3650.');
      return;
    }

    setErro('');
    setMensagem('');
    try {
      const resultado = await definirRetencaoLogs(dias);
      setRetencao(resultado.dias);
      setMensagem(
        `Retenção definida em ${resultado.dias === 0 ? 'nunca apagar' : `${resultado.dias} dia(s)`}` +
          (resultado.apagados > 0 ? ` — ${resultado.apagados} log(s) antigo(s) apagado(s).` : '.'),
      );
      await pesquisar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao salvar a retenção.');
    }
  }

  async function limparAgora() {
    const texto =
      retencao === 0
        ? 'A retenção está em "nunca apagar" — nada será removido. Alterar a retenção primeiro?'
        : `Apagar agora os logs com mais de ${retencao} dia(s)?`;
    if (!confirm(texto)) return;

    setErro('');
    setMensagem('');
    try {
      const apagados = await limparLogs();
      setMensagem(`${apagados} log(s) apagado(s).`);
      await pesquisar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao limpar os logs.');
    }
  }

  function exportarCsv() {
    if (logs.length === 0) {
      setMensagem('Nada para exportar.');
      return;
    }

    baixarCsv(
      `logs-conferencia-${filtro.de || 'inicio'}-a-${filtro.ate || 'hoje'}.csv`,
      [
        'DATA/HORA',
        'FABRICA',
        'ESTAGIO',
        'DESFECHO',
        'ORIGEM',
        'VALOR LIDO',
        'ETIQUETA',
        'ORD.COMPRA',
        'PRODUTO',
        'DESCRICAO',
        'QTDE',
        'CLIENTE',
        'PECLIENTE',
        'BOX',
        'USUARIO',
        'STATUS ANTES',
        'STATUS DEPOIS',
        'MENSAGEM',
      ],
      logsOrdenados.map((l) => [
        dataHora(l.criado_em),
        l.fabrica ?? '',
        ROTULO_ESTAGIO[l.estagio] ?? String(l.estagio),
        DESFECHOS[l.desfecho]?.rotulo ?? l.desfecho,
        l.origem,
        l.valor_lido ?? '',
        l.etiqueta ?? '',
        l.ordcompra ?? '',
        l.produto ?? '',
        l.descricao1 ?? '',
        l.qtde === null || l.qtde === undefined ? '' : String(l.qtde),
        l.cliente ?? '',
        l.pecliente ?? '',
        l.nmbox ?? '',
        l.usuario_login ?? '',
        rotuloStatus(l.status_antes, rotulosEstagio),
        rotuloStatus(l.status_novo, rotulosEstagio),
        l.mensagem ?? '',
      ]),
    );
    setMensagem(`${logs.length} linha(s) exportada(s).`);
  }

  if (!administrador) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-200 p-6">
        <p className="rounded border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Os logs de conferência são visíveis apenas para o administrador.
        </p>
        <button
          onClick={onVoltar}
          className="rounded border border-slate-400 bg-white px-3 py-1 text-sm hover:bg-slate-100"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-200 p-3">
      <div className="mb-2 rounded border border-slate-300 bg-white px-3 py-2">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-700">
            Logs de Conferência
            <span className="ml-2 text-[11px] font-normal text-slate-500">
              cada bipagem dos operadores, nos três estágios
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void pesquisar()}
              disabled={carregando}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
            >
              Atualizar
            </button>
            <button
              onClick={exportarCsv}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            >
              Exportar CSV
            </button>
            <button
              onClick={onVoltar}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------- filtros */}
        <div className="flex flex-wrap items-end gap-2 text-[11px] text-slate-600">
          <label className="flex flex-col gap-0.5">
            De
            <input
              type="date"
              value={filtro.de}
              onChange={(e) => setFiltro((f) => ({ ...f, de: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Até
            <input
              type="date"
              value={filtro.ate}
              onChange={(e) => setFiltro((f) => ({ ...f, ate: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Fábrica
            <select
              value={filtro.controle}
              onChange={(e) => setFiltro((f) => ({ ...f, controle: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">todas</option>
              {fabricas.map((fabrica) => (
                <option key={fabrica.controle} value={fabrica.controle}>
                  {fabrica.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            Desfecho
            <select
              value={filtro.desfecho}
              onChange={(e) => setFiltro((f) => ({ ...f, desfecho: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">todos</option>
              {Object.entries(DESFECHOS).map(([valor, info]) => (
                <option key={valor} value={valor}>
                  {info.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            Usuário
            <input
              value={filtro.usuario}
              onChange={(e) => setFiltro((f) => ({ ...f, usuario: e.target.value }))}
              placeholder="login"
              className="w-28 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Pedido (ORD.COMPRA)
            <input
              value={filtro.ordcompra}
              onChange={(e) => setFiltro((f) => ({ ...f, ordcompra: e.target.value }))}
              className="w-32 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Etiqueta / produto / cliente
            <input
              value={filtro.texto}
              onChange={(e) => setFiltro((f) => ({ ...f, texto: e.target.value }))}
              className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <button
            onClick={() => setFiltro({ ...periodoInicial(), controle: '', usuario: '', desfecho: '', texto: '', ordcompra: '' })}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            Limpar filtros
          </button>
          <button
            onClick={() =>
              setFiltro({
                de: '',
                ate: '',
                controle: '',
                usuario: '',
                desfecho: '',
                texto: '',
                ordcompra: '',
              })
            }
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            title="Remove o filtro de período (de/até)"
          >
            Todo o período
          </button>
        </div>
      </div>

      {!migracaoOk && (
        <p className="mb-2 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {AVISO_LOGS}
        </p>
      )}
      {erro && (
        <p className="mb-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="mb-2 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
          {mensagem}
        </p>
      )}

      {/* ------------------------------------------------------ contadores */}
      <div className="mb-2 flex flex-wrap items-center gap-3 rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
        <span>
          Leituras: <strong className="text-slate-800">{resumo?.total ?? 0}</strong>
        </span>
        <span className="text-emerald-700">
          Sucesso: <strong>{resumo?.sucesso ?? 0}</strong>
        </span>
        <span className="text-amber-700">
          Já lida: <strong>{resumo?.ja_lida ?? 0}</strong>
        </span>
        <span className="text-orange-700">
          Fora de ordem: <strong>{resumo?.bloqueada ?? 0}</strong>
        </span>
        <span className="text-red-700">
          Não encontrada: <strong>{resumo?.nao_encontrada ?? 0}</strong>
        </span>
        <span className="text-sky-700">
          Em massa: <strong>{resumo?.massa ?? 0}</strong>
        </span>
        <span className="text-slate-400">|</span>
        <span>
          Estágios
          {ativos.map((estagio) => (
            <span key={estagio.numero} className="ml-2">
              {estagio.nome} <strong>{resumo?.estagios?.[String(estagio.numero)] ?? 0}</strong>
            </span>
          ))}
        </span>
        <span className="text-slate-400">|</span>
        <span>
          Operadores: <strong>{resumo?.operadores ?? 0}</strong>
        </span>
        <span className="ml-auto text-slate-500">
          mostrando {logs.length} de {resumo?.total ?? 0}
        </span>
      </div>

      {/* ------------------------------------------------------------ grid */}
      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <ThOrdenavel campo="data" titulo="Data / hora" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="fabrica" titulo="Fábrica" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="estagio" titulo="Estágio" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="desfecho" titulo="Desfecho" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="lido" titulo="Lido" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="etiqueta" titulo="Etiqueta" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="pedido" titulo="Pedido" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="produto" titulo="Produto" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="qtde" titulo="Qtde" ordem={ordem} aoAlternar={alternar} className="px-2 py-2 text-right" />
              <ThOrdenavel campo="cliente" titulo="Cliente" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="box" titulo="Box" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="status" titulo="Status" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="usuario" titulo="Usuário" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={13}>
                  {carregando
                    ? 'Carregando...'
                    : migracaoOk
                      ? 'Nenhuma leitura no período/filtro.'
                      : 'Aguardando a migração no banco.'}
                </td>
              </tr>
            )}
            {logsOrdenados.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelecionado(log)}
                className={`cursor-pointer border-t border-slate-200 hover:bg-slate-50 ${
                  selecionado?.id === log.id ? 'bg-sky-50' : ''
                }`}
              >
                <td className="whitespace-nowrap px-2 py-1 text-slate-600">
                  {dataHora(log.criado_em)}
                </td>
                <td className="px-2 py-1">{log.fabrica ?? '—'}</td>
                <td className="px-2 py-1">
                  {ROTULO_ESTAGIO[log.estagio] ?? log.estagio}
                </td>
                <td className="px-2 py-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      DESFECHOS[log.desfecho]?.classe ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {DESFECHOS[log.desfecho]?.rotulo ?? log.desfecho}
                  </span>
                </td>
                <td className="max-w-[140px] truncate px-2 py-1 font-mono" title={log.valor_lido ?? ''}>
                  {log.valor_lido ?? '—'}
                </td>
                <td className="max-w-[120px] truncate px-2 py-1 font-mono" title={log.etiqueta ?? ''}>
                  {log.etiqueta ?? '—'}
                </td>
                <td className="max-w-[120px] truncate px-2 py-1" title={log.ordcompra ?? ''}>
                  {log.ordcompra ?? '—'}
                </td>
                <td className="max-w-[220px] truncate px-2 py-1" title={`${log.produto ?? ''} ${log.descricao1 ?? ''}`}>
                  {log.produto ?? '—'}
                </td>
                <td className="px-2 py-1 text-right">
                  {log.qtde === null || log.qtde === undefined ? '—' : log.qtde}
                </td>
                <td className="max-w-[160px] truncate px-2 py-1" title={log.cliente ?? ''}>
                  {log.cliente ?? '—'}
                </td>
                <td className="px-2 py-1">{log.nmbox ?? '—'}</td>
                <td className="whitespace-nowrap px-2 py-1 text-slate-600">
                  {log.status_antes === null ? '—' : rotuloStatus(log.status_antes, rotulosEstagio)}
                  <span className="text-slate-400">
                    {log.status_novo === null
                      ? ''
                      : ` → ${rotuloStatus(log.status_novo, rotulosEstagio)}`}
                  </span>
                </td>
                <td className="px-2 py-1 text-slate-500">{log.usuario_login ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------------------------------------- detalhe + retenção */}
      <div className="mt-2 flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
          {selecionado ? (
            <>
              <strong className="text-slate-800">{DESFECHOS[selecionado.desfecho]?.rotulo}</strong>
              {' · '}
              {dataHora(selecionado.criado_em)}
              {' · '}
              {selecionado.fabrica ?? '—'} · estágio{' '}
              {ROTULO_ESTAGIO[selecionado.estagio] ?? selecionado.estagio}
              {' · '}
              usuário {selecionado.usuario_login ?? '—'} ({selecionado.origem})
              <br />
              lido: <span className="font-mono">{selecionado.valor_lido ?? '—'}</span>
              {' · '}
              etiqueta: <span className="font-mono">{selecionado.etiqueta ?? '—'}</span>
              {selecionado.pedido_id ? ` · pedido #${selecionado.pedido_id}` : ''}
              {selecionado.ordcompra ? ` · ORD.COMPRA ${selecionado.ordcompra}` : ''}
              <br />
              {selecionado.produto ?? '—'} {selecionado.descricao1 ?? ''} · qtde{' '}
              {selecionado.qtde ?? '—'} · cliente {selecionado.cliente ?? '—'}
              {selecionado.pecliente ? ` / ${selecionado.pecliente}` : ''} · box{' '}
              {selecionado.nmbox ?? '—'}
              {selecionado.mensagem ? ` · "${selecionado.mensagem}"` : ''}
            </>
          ) : (
            'Clique em uma linha para ver o detalhe da leitura.'
          )}
        </div>

        <div className="rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
          <div className="mb-1 font-semibold text-slate-700">Retenção dos logs</div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              Guardar
              <input
                value={retencaoEditada}
                onChange={(e) => setRetencaoEditada(e.target.value.replace(/\D/g, ''))}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
              />
              dias
            </label>
            <button
              onClick={() => void salvarRetencao()}
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100"
            >
              Salvar
            </button>
            <button
              onClick={() => void limparAgora()}
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100"
            >
              Limpar agora
            </button>
          </div>
          <p className="mt-1 max-w-[260px] text-[10px] text-slate-500">
            0 = guardar para sempre ({retencao === 0 ? 'está assim agora' : `agora: ${retencao ?? '?'} dia(s)`}).
            A limpeza roda sempre que esta tela é aberta.
          </p>
        </div>
      </div>
    </div>
  );
}
