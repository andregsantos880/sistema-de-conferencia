import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  atualizarLocal,
  criarLocal,
  excluirLocal,
  listarLocais,
  migracaoPendente,
  AVISO_LOCAIS,
  type Empresa,
  type Local,
  type UsuarioLogado,
} from '../lib/api';
import { PERFIL } from '../lib/config';
import { ThOrdenavel, useOrdenacao, type CampoOrdenavel } from '../lib/ordenacao';

type Props = {
  empresa: Empresa;
  usuarioLogado: UsuarioLogado;
  onVoltar: () => void;
};

/**
 * Cadastro dos LOCAIS — o lugar físico onde as peças devem ficar
 * ("Box 01", "Prateleira superior", "Piso", "Pallet 3"...).
 *
 * O local é escolhido na importação (por pedido/ORD.COMPRA) e pode ser trocado
 * depois na tela "Locais das peças". Aqui só se mantém o cadastro: nome e
 * situação. Um local em uso pelas peças não pode ser excluído — só desativado
 * (assim ele sai dos combos mas o histórico continua legível).
 */
export default function Locais({ usuarioLogado, onVoltar }: Props) {
  const [locais, setLocais] = useState<Local[]>([]);

  /** Colunas ordenáveis (clique no cabeçalho: asc → desc → sem ordenação). */
  const campos = useMemo<Record<string, CampoOrdenavel<Local>>>(() => ({
    nome: { titulo: 'Local', valor: (l) => l.nmbox },
    situacao: { titulo: 'Situação', valor: (l) => l.ativo, tipo: 'numero' },
    pecas: { titulo: 'Peças usando', valor: (l) => l.pecas, tipo: 'numero' },
  }), []);

  const { linhas: locaisOrdenados, ordem, alternar } = useOrdenacao(locais, campos);
  const [novo, setNovo] = useState('');
  const [editando, setEditando] = useState<{ idbox: number; nome: string } | null>(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    if (!administrador) return;
    setErro('');
    try {
      setLocais(await listarLocais());
      setMigracaoOk(true);
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os locais.');
      }
    }
  }, [administrador]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function executar(acao: () => Promise<unknown>, sucesso: string) {
    setErro('');
    setMensagem('');
    setOcupado(true);
    try {
      await acao();
      setMensagem(sucesso);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao gravar.');
    } finally {
      setOcupado(false);
    }
  }

  async function incluir() {
    const nome = novo.trim();
    if (nome.length < 1) {
      setErro('Informe o nome do local (ex.: “Box 01”, “Prateleira superior”).');
      return;
    }
    await executar(async () => {
      await criarLocal(nome);
      setNovo('');
    }, `Local "${nome}" criado.`);
  }

  async function salvarNome() {
    if (!editando) return;
    const nome = editando.nome.trim();
    if (nome.length < 1) {
      setErro('O nome do local não pode ficar vazio.');
      return;
    }
    const alvo = editando;
    await executar(() => atualizarLocal(alvo.idbox, nome, 1), 'Local renomeado.');
    setEditando(null);
  }

  async function alternarSituacao(local: Local) {
    const ativo = Number(local.ativo) === 1 ? 0 : 1;
    await executar(
      () => atualizarLocal(local.idbox, local.nmbox, ativo),
      `Local "${local.nmbox}" ${ativo ? 'ativado' : 'desativado'}.`,
    );
  }

  async function excluir(local: Local) {
    if (!confirm(`Excluir o local "${local.nmbox}"?`)) return;
    await executar(() => excluirLocal(local.idbox), `Local "${local.nmbox}" excluído.`);
  }

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            O cadastro de locais é exclusivo do perfil <strong>ADMIN</strong>.
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
      <div className="mb-2 flex items-center justify-between rounded border border-slate-300 bg-white px-3 py-2">
        <h1 className="text-sm font-semibold text-slate-700">
          Locais das peças
          <span className="ml-2 text-[11px] font-normal text-slate-500">
            onde a peça deve ficar (Box, prateleira, piso...)
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void carregar()}
            disabled={ocupado}
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

      <div className="mb-2 flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
        <label className="text-[11px] text-slate-600" htmlFor="novo-local">
          Novo local
        </label>
        <input
          id="novo-local"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void incluir();
          }}
          placeholder="ex.: prateleira superior"
          maxLength={60}
          className="w-64 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <button
          onClick={() => void incluir()}
          disabled={ocupado}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Incluir
        </button>
        <span className="text-[11px] text-slate-500">
          {locais.filter((l) => Number(l.ativo) === 1).length} ativo(s) de {locais.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <ThOrdenavel campo="nome" titulo="Local" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="situacao" titulo="Situação" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="pecas" titulo="Peças usando" ordem={ordem} aoAlternar={alternar} className="px-3 py-2 text-right" />
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {locais.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  {migracaoOk
                    ? 'Nenhum local cadastrado. Crie o primeiro acima (ex.: “Box 01”, “Piso”).'
                    : 'Aguardando a migração no banco.'}
                </td>
              </tr>
            )}
            {locaisOrdenados.map((local) => (
              <tr key={local.idbox} className="border-t border-slate-200">
                <td className="px-3 py-1.5">
                  {editando?.idbox === local.idbox ? (
                    <span className="flex items-center gap-2">
                      <input
                        value={editando.nome}
                        onChange={(e) =>
                          setEditando((atual) => (atual ? { ...atual, nome: e.target.value } : atual))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void salvarNome();
                          if (e.key === 'Escape') setEditando(null);
                        }}
                        maxLength={60}
                        autoFocus
                        className="w-56 rounded border border-slate-400 px-2 py-0.5"
                      />
                      <button
                        onClick={() => void salvarNome()}
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <span className="font-medium">{local.nmbox}</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      Number(local.ativo) === 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {Number(local.ativo) === 1 ? 'ATIVO' : 'DESATIVADO'}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right text-slate-600">{local.pecas}</td>
                <td className="px-3 py-1.5">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditando({ idbox: local.idbox, nome: local.nmbox })}
                      disabled={ocupado}
                      className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Renomear
                    </button>
                    <button
                      onClick={() => void alternarSituacao(local)}
                      disabled={ocupado}
                      className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {Number(local.ativo) === 1 ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => void excluir(local)}
                      disabled={ocupado || Number(local.pecas) > 0}
                      title={
                        Number(local.pecas) > 0
                          ? 'Em uso por peças — desative em vez de excluir'
                          : 'Excluir o local'
                      }
                      className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
        O local é escolhido na importação (um por estágio: CONFERÊNCIA, SAÍDA e ENTREGA) e pode ser
        alterado depois em <strong>Locais das peças</strong>. Ao bipar, o painel de conferência mostra
        o local daquele estágio.
      </p>
    </div>
  );
}
