import { useCallback, useEffect, useState } from 'react';
import {
  atualizarEstagio,
  criarEstagio,
  excluirEstagio,
  listarEstagios,
  migracaoPendente,
  AVISO_ESTAGIOS,
  type Empresa,
  type Estagio,
  type UsuarioLogado,
} from '../lib/api';
import { definirEstagios, useEstagios, REGRA_ESTAGIOS } from '../lib/estagios';
import { PERFIL } from '../lib/config';

type Props = {
  empresa: Empresa;
  usuarioLogado: UsuarioLogado;
  onVoltar: () => void;
};

/** Sugestão de cores para o estágio novo (a primeira livre da lista). */
const PALETA = ['#90ee90', '#f08080', '#0000ff', '#ffd966', '#c9a0dc', '#87ceeb', '#f4b183'];

/**
 * Cadastro dos ESTÁGIOS da conferência (somente ADMIN).
 *
 * O número é a ORDEM do fluxo. A peça anda um estágio por vez: não pula e não
 * volta — por isso esta tela só deixa criar no FIM da sequência e desativar/
 * excluir o ÚLTIMO estágio (e mesmo assim sem peça parada nele).
 *
 * Os três estágios que já existiam vêm pré-cadastrados (CONFERENCIA, SAIDA e
 * ENTREGA), então, para quem não mexer aqui, nada muda.
 */
export default function Estagios({ usuarioLogado, onVoltar }: Props) {
  const { ativos } = useEstagios();
  const [estagios, setEstagios] = useState<Estagio[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState(PALETA[0]);
  const [editando, setEditando] = useState<{ numero: number; nome: string; cor: string } | null>(
    null,
  );
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    if (!administrador) return;
    setErro('');
    try {
      const lista = await listarEstagios();
      setEstagios(lista);
      definirEstagios(lista); // mantém a conferência em sincronia
      setMigracaoOk(true);
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os estágios.');
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
    const nome = novoNome.trim();
    if (nome.length < 2) {
      setErro('Informe o nome do estágio (ex.: “SEPARAÇÃO”, “EXPEDIÇÃO”).');
      return;
    }
    await executar(async () => {
      await criarEstagio(nome, novaCor);
      setNovoNome('');
      setNovaCor(PALETA[(estagios.length + 1) % PALETA.length]);
    }, `Estágio "${nome}" criado no fim do fluxo.`);
  }

  async function salvarEdicao() {
    if (!editando) return;
    const alvo = editando;
    if (alvo.nome.trim().length < 2) {
      setErro('O nome do estágio não pode ficar vazio.');
      return;
    }
    await executar(
      () => atualizarEstagio(alvo.numero, alvo.nome.trim(), alvo.cor, 1),
      'Estágio atualizado.',
    );
    setEditando(null);
  }

  async function alternarSituacao(estagio: Estagio) {
    const ativo = Number(estagio.ativo) === 1 ? 0 : 1;
    await executar(
      () => atualizarEstagio(estagio.numero, estagio.nome, estagio.cor, ativo),
      `Estágio "${estagio.nome}" ${ativo ? 'ativado' : 'desativado'}.`,
    );
  }

  async function excluir(estagio: Estagio) {
    if (!confirm(`Excluir o estágio "${estagio.nome}" (nº ${estagio.numero})?`)) return;
    await executar(() => excluirEstagio(estagio.numero), `Estágio "${estagio.nome}" excluído.`);
  }

  const ultimoAtivo = ativos.length > 0 ? ativos[ativos.length - 1].numero : 0;

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            O cadastro de estágios é exclusivo do perfil <strong>ADMIN</strong>.
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
          Estágios da conferência
          <span className="ml-2 text-[11px] font-normal text-slate-500">
            a ordem do fluxo: recebimento → conferência → ... → entrega
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
          {AVISO_ESTAGIOS}
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

      <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
        <label className="flex items-center gap-1">
          Novo estágio
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void incluir();
            }}
            placeholder="ex.: EXPEDIÇÃO"
            maxLength={40}
            className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
          />
        </label>
        <label className="flex items-center gap-1">
          Cor
          <input
            type="color"
            value={novaCor}
            onChange={(e) => setNovaCor(e.target.value)}
            className="h-7 w-10 rounded border border-slate-300"
          />
        </label>
        <button
          onClick={() => void incluir()}
          disabled={ocupado}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Incluir no fim do fluxo
        </button>
        <span className="text-slate-500">
          {estagios.length} cadastrado(s) · {ativos.length} ativo(s)
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Nº</th>
              <th className="px-3 py-2">Estágio</th>
              <th className="px-3 py-2">Cor no grid</th>
              <th className="px-3 py-2">Situação</th>
              <th className="px-3 py-2 text-right">Peças paradas</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {estagios.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={6}>
                  {migracaoOk
                    ? 'Nenhum estágio cadastrado.'
                    : 'Aguardando a migração no banco — a conferência segue com os três estágios padrão.'}
                </td>
              </tr>
            )}
            {estagios.map((estagio) => {
              const ativo = Number(estagio.ativo) === 1;
              return (
                <tr key={estagio.numero} className="border-t border-slate-200">
                  <td className="px-3 py-1.5 font-mono text-slate-500">{estagio.numero}</td>
                  <td className="px-3 py-1.5">
                    {editando?.numero === estagio.numero ? (
                      <span className="flex items-center gap-2">
                        <input
                          value={editando.nome}
                          onChange={(e) =>
                            setEditando((atual) =>
                              atual ? { ...atual, nome: e.target.value.toUpperCase() } : atual,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void salvarEdicao();
                            if (e.key === 'Escape') setEditando(null);
                          }}
                          maxLength={40}
                          autoFocus
                          className="w-48 rounded border border-slate-400 px-2 py-0.5"
                        />
                        <button
                          onClick={() => void salvarEdicao()}
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
                      <span className="font-medium">{estagio.nome}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-8 rounded border border-slate-300"
                        style={{ background: estagio.cor ?? '#e2e8f0' }}
                      />
                      <input
                        type="color"
                        value={estagio.cor ?? '#e2e8f0'}
                        onChange={(e) =>
                          void executar(
                            () =>
                              atualizarEstagio(
                                estagio.numero,
                                estagio.nome,
                                e.target.value,
                                Number(estagio.ativo),
                              ),
                            `Cor do estágio "${estagio.nome}" atualizada.`,
                          )
                        }
                        disabled={ocupado}
                        className="h-6 w-9 rounded border border-slate-300"
                      />
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {ativo ? 'ATIVO' : 'DESATIVADO'}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-600">{estagio.pecas}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() =>
                          setEditando({
                            numero: estagio.numero,
                            nome: estagio.nome,
                            cor: estagio.cor ?? '#e2e8f0',
                          })
                        }
                        disabled={ocupado}
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:opacity-50"
                      >
                        Renomear
                      </button>
                      <button
                        onClick={() => void alternarSituacao(estagio)}
                        disabled={ocupado || (ativo && estagio.numero !== ultimoAtivo)}
                        title={
                          ativo && estagio.numero !== ultimoAtivo
                            ? 'Só o último estágio da sequência pode ser desativado'
                            : 'Ativar / desativar'
                        }
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
                      >
                        {ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => void excluir(estagio)}
                        disabled={ocupado || estagio.numero !== ultimoAtivo}
                        title={
                          estagio.numero !== ultimoAtivo
                            ? 'Só o último estágio da sequência pode ser excluído'
                            : 'Excluir o estágio'
                        }
                        className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
        <strong>Regra do fluxo:</strong> {REGRA_ESTAGIOS} Por isso o estágio novo entra sempre no
        fim, e só o último pode ser desativado ou excluído — e apenas quando não há peça parada
        nele. O número do estágio é o que fica gravado na peça (0 = NORMAL, ainda não bipada).
      </p>
    </div>
  );
}
