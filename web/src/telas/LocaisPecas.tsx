import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  definirLocais,
  listarLocais,
  listarPecasComLocal,
  migracaoPendente,
  AVISO_LOCAIS,
  type Empresa,
  type Fabrica,
  type Local,
  type PecaComLocal,
  type UsuarioLogado,
} from '../lib/api';
import { PERFIL, ROTULO_ESTAGIO } from '../lib/config';
import { DS_STATUS } from '../lib/regrasConferencia';
import { ThOrdenavel, useOrdenacao, type CampoOrdenavel } from '../lib/ordenacao';

type Props = {
  empresa: Empresa;
  usuarioLogado: UsuarioLogado;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onVoltar: () => void;
};

const ESTAGIOS = [1, 2, 3] as const;

const nomeLocal = (valor: string | null | undefined): string => valor?.trim() || 'sem local';

/**
 * LOCAIS DAS PEÇAS (pós-importação, somente ADMIN).
 *
 * O local de cada peça em cada estágio é escolhido na importação — mas a
 * operação muda (trocar de box, reorganizar o piso, peça que veio do sistema
 * antigo sem local). Aqui o administrador filtra as peças e define o local em
 * massa. A alteração de local NÃO entra no log de conferência.
 */
export default function LocaisPecas({
  usuarioLogado,
  fabricas,
  fabricaId,
  onTrocarFabrica,
  onVoltar,
}: Props) {
  const [pecas, setPecas] = useState<PecaComLocal[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [filtro, setFiltro] = useState({
    ordcompra: '',
    cliente: '',
    etiqueta: '',
    status: '',
    semLocalEstagio: '',
  });
  const [estagio, setEstagio] = useState<number>(1);
  const [idbox, setIdbox] = useState<number | ''>('');
  const [soSemLocal, setSoSemLocal] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [definindo, setDefinindo] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const filtros = useMemo(
    () => ({
      controle: fabricaId ?? 0,
      ordcompra: filtro.ordcompra,
      cliente: filtro.cliente,
      etiqueta: filtro.etiqueta,
      status: filtro.status === '' ? null : Number(filtro.status),
      semLocalEstagio: filtro.semLocalEstagio === '' ? null : Number(filtro.semLocalEstagio),
      limite: 500,
    }),
    [fabricaId, filtro],
  );

  const carregar = useCallback(async () => {
    if (!administrador || fabricaId === null) return;
    setCarregando(true);
    setErro('');
    try {
      setPecas(await listarPecasComLocal(filtros));
      setMigracaoOk(true);
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
        setPecas([]);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar as peças.');
      }
    } finally {
      setCarregando(false);
    }
  }, [administrador, fabricaId, filtros]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!administrador) return;
    listarLocais()
      .then((lista) => setLocais(lista.filter((local) => Number(local.ativo) === 1)))
      .catch(() => setLocais([]));
  }, [administrador]);

  const locaisDoEstagio = (peca: PecaComLocal): Array<string | null | undefined> => [
    peca.local_conf,
    peca.local_saida,
    peca.local_entrega,
  ];

  const semLocalNoEstagio = useMemo(
    () => pecas.filter((peca) => !locaisDoEstagio(peca)[estagio - 1]).length,
    [pecas, estagio],
  );

  /** Colunas ordenáveis (clique no cabeçalho: asc → desc → sem ordenação). */
  const campos = useMemo<Record<string, CampoOrdenavel<PecaComLocal>>>(() => ({
    etiqueta: { titulo: 'Etiqueta', valor: (p) => p.etiqueta },
    ordcompra: { titulo: 'ORD.COMPRA', valor: (p) => p.ordcompra },
    cliente: { titulo: 'Cliente', valor: (p) => p.cliente },
    produto: { titulo: 'Produto', valor: (p) => p.produto },
    descricao: { titulo: 'Descrição', valor: (p) => p.descricao1 },
    qtde: { titulo: 'Qtde', valor: (p) => p.qtde, tipo: 'numero' },
    status: { titulo: 'Situação', valor: (p) => p.status, tipo: 'numero' },
    local1: { titulo: ROTULO_ESTAGIO[1], valor: (p) => p.local_conf },
    local2: { titulo: ROTULO_ESTAGIO[2], valor: (p) => p.local_saida },
    local3: { titulo: ROTULO_ESTAGIO[3], valor: (p) => p.local_entrega },
  }), []);

  const { linhas: pecasOrdenadas, ordem, alternar } = useOrdenacao(pecas, campos);

  async function aplicar() {
    if (fabricaId === null || idbox === '') {
      setErro('Escolha o local que será aplicado.');
      return;
    }

    const nome = locais.find((local) => local.idbox === Number(idbox))?.nmbox ?? 'local';
    const quantas = soSemLocal ? semLocalNoEstagio : pecas.length;

    if (
      !confirm(
        `Definir "${nome}" como o local de ${ROTULO_ESTAGIO[estagio]} para ${quantas} peça(s) ` +
          `${soSemLocal ? 'sem local nesse estágio ' : ''}que estão no filtro atual?`,
      )
    ) {
      return;
    }

    setDefinindo(true);
    setErro('');
    setMensagem('');
    try {
      const total = await definirLocais({
        controle: fabricaId,
        estagio,
        idbox: Number(idbox),
        ordcompra: filtro.ordcompra,
        cliente: filtro.cliente,
        etiqueta: filtro.etiqueta,
        status: filtro.status === '' ? null : Number(filtro.status),
        semLocal: soSemLocal,
      });
      setMensagem(`${total} peça(s) com o local de ${ROTULO_ESTAGIO[estagio]} definido como "${nome}".`);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao definir o local.');
    } finally {
      setDefinindo(false);
    }
  }

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            Definir o local das peças é exclusivo do perfil <strong>ADMIN</strong>.
          </p>
          <button
            onClick={onVoltar}
            className="mt-4 rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-200 p-3">
      <div className="mb-2 rounded border border-slate-300 bg-white px-3 py-2">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-700">
            Locais das peças
            <span className="ml-2 text-[11px] font-normal text-slate-500">
              onde cada peça fica em CONFERÊNCIA, SAÍDA e ENTREGA
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void carregar()}
              disabled={carregando}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
            >
              Atualizar
            </button>
            <button
              onClick={onVoltar}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 text-[11px] text-slate-600">
          <label className="flex flex-col gap-0.5">
            Fábrica
            <select
              value={fabricaId ?? ''}
              onChange={(e) => onTrocarFabrica(Number(e.target.value))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              {fabricas.map((fabrica) => (
                <option key={fabrica.controle} value={fabrica.controle}>
                  {fabrica.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            Pedido (ORD.COMPRA)
            <input
              value={filtro.ordcompra}
              onChange={(e) => setFiltro((f) => ({ ...f, ordcompra: e.target.value }))}
              placeholder="exato"
              className="w-40 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Cliente
            <input
              value={filtro.cliente}
              onChange={(e) => setFiltro((f) => ({ ...f, cliente: e.target.value }))}
              className="w-36 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Etiqueta
            <input
              value={filtro.etiqueta}
              onChange={(e) => setFiltro((f) => ({ ...f, etiqueta: e.target.value }))}
              className="w-36 rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Situação da peça
            <select
              value={filtro.status}
              onChange={(e) => setFiltro((f) => ({ ...f, status: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">todas</option>
              {[0, 1, 2, 3].map((valor) => (
                <option key={valor} value={valor}>
                  {DS_STATUS[valor] ?? valor}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            Falta local em
            <select
              value={filtro.semLocalEstagio}
              onChange={(e) => setFiltro((f) => ({ ...f, semLocalEstagio: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">—</option>
              {ESTAGIOS.map((valor) => (
                <option key={valor} value={valor}>
                  {ROTULO_ESTAGIO[valor]}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() =>
              setFiltro({ ordcompra: '', cliente: '', etiqueta: '', status: '', semLocalEstagio: '' })
            }
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {!migracaoOk && (
        <p className="mb-2 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {AVISO_LOCAIS}
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

      {/* ------------------------------------------------- definir em massa */}
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-700">Definir local:</span>
        <label className="flex items-center gap-1">
          Estágio
          <select
            value={estagio}
            onChange={(e) => setEstagio(Number(e.target.value))}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {ESTAGIOS.map((valor) => (
              <option key={valor} value={valor}>
                {ROTULO_ESTAGIO[valor]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Local
          <select
            value={idbox}
            onChange={(e) => setIdbox(e.target.value ? Number(e.target.value) : '')}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="">—</option>
            {locais.map((local) => (
              <option key={local.idbox} value={local.idbox}>
                {local.nmbox}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={soSemLocal}
            onChange={(e) => setSoSemLocal(e.target.checked)}
          />
          somente as que estão sem local nesse estágio ({semLocalNoEstagio})
        </label>
        <button
          onClick={() => void aplicar()}
          disabled={definindo || pecas.length === 0 || idbox === ''}
          className="rounded bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Aplicar nas {pecas.length} peça(s) do filtro
        </button>
        {locais.length === 0 && (
          <span className="text-amber-700">
            Nenhum local cadastrado — crie na tela “Locais”.
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <ThOrdenavel campo="etiqueta" titulo="Etiqueta" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="ordcompra" titulo="ORD.COMPRA" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="cliente" titulo="Cliente" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="produto" titulo="Produto" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="descricao" titulo="Descrição" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              <ThOrdenavel campo="qtde" titulo="Qtde" ordem={ordem} aoAlternar={alternar} className="px-2 py-2 text-right" />
              <ThOrdenavel campo="status" titulo="Situação" ordem={ordem} aoAlternar={alternar} className="px-2 py-2" />
              {ESTAGIOS.map((valor) => (
                <ThOrdenavel
                  key={valor}
                  campo={`local${valor}`}
                  titulo={ROTULO_ESTAGIO[valor]}
                  ordem={ordem}
                  aoAlternar={alternar}
                  className="px-2 py-2"
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {pecas.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={10}>
                  {carregando
                    ? 'Carregando...'
                    : migracaoOk
                      ? 'Nenhuma peça no filtro.'
                      : 'Aguardando a migração no banco.'}
                </td>
              </tr>
            )}
            {pecasOrdenadas.map((peca) => (
              <tr key={peca.pedido_id} className="border-t border-slate-200">
                <td className="px-2 py-1 font-mono">{peca.etiqueta ?? '—'}</td>
                <td className="px-2 py-1">{peca.ordcompra ?? '—'}</td>
                <td className="max-w-[150px] truncate px-2 py-1" title={peca.cliente ?? ''}>
                  {peca.cliente ?? '—'}
                </td>
                <td className="max-w-[120px] truncate px-2 py-1" title={peca.produto ?? ''}>
                  {peca.produto ?? '—'}
                </td>
                <td className="max-w-[220px] truncate px-2 py-1" title={peca.descricao1 ?? ''}>
                  {peca.descricao1 ?? '—'}
                </td>
                <td className="px-2 py-1 text-right">{peca.qtde ?? '—'}</td>
                <td className="px-2 py-1">{DS_STATUS[Number(peca.status ?? 0)] ?? peca.status}</td>
                {locaisDoEstagio(peca).map((nome, indice) => (
                  <td
                    key={indice}
                    className={`px-2 py-1 ${nome ? 'text-slate-700' : 'bg-amber-50 text-amber-800'}`}
                  >
                    {nomeLocal(nome)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
        Mostrando até 500 peças do filtro. O local é definido aqui <strong>em massa</strong> — a
        alteração não vai para o log de conferência. Para escolher o local peça a peça, use a coluna
        LOCAL na conferência e o painel de bipagem.
      </p>
    </div>
  );
}
