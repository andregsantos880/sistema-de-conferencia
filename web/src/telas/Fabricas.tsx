import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  atualizarFabrica,
  criarFabrica,
  excluirFabrica,
  lerLayoutFabrica,
  listarFabricasAdmin,
  migracaoPendente,
  AVISO_MIGRACAO,
  type Empresa,
  type FabricaAdmin,
  type LayoutSalvo,
} from '../lib/api';
import { PERFIL } from '../lib/config';
import { ThOrdenavel, useOrdenacao, type CampoOrdenavel } from '../lib/ordenacao';
import ConfigLayoutFabrica from './ConfigLayoutFabrica';

type Props = {
  empresa: Empresa;
  usuarioLogado: { id: number; login: string; perfil: string };
  onVoltar: () => void;
};

/**
 * Cadastro de fábricas — feito pela PRÓPRIA empresa logada (perfil ADMIN).
 *
 * Aqui o cliente cria a fábrica e, principalmente, DEFINE O LAYOUT do arquivo
 * dela: escolhe um arquivo de exemplo, o assistente detecta o separador e as
 * colunas, e o usuário confirma/ajusta o de-para campo × coluna. Depois disso a
 * importação passa a ler os arquivos dessa fábrica pelo layout configurado,
 * sem precisar de programação.
 */
export default function Fabricas({ usuarioLogado, onVoltar }: Props) {
  const [fabricas, setFabricas] = useState<FabricaAdmin[]>([]);

  /** Colunas ordenáveis (clique no cabeçalho: asc → desc → sem ordenação). */
  const campos = useMemo<Record<string, CampoOrdenavel<FabricaAdmin>>>(() => ({
    controle: { titulo: 'Controle', valor: (f) => f.controle, tipo: 'numero' },
    nome: { titulo: 'Fábrica', valor: (f) => f.nome },
    situacao: { titulo: 'Situação', valor: (f) => f.ativo, tipo: 'numero' },
    pedidos: { titulo: 'Pedidos', valor: (f) => f.pedidos, tipo: 'numero' },
    layout: { titulo: 'Layout do arquivo', valor: (f) => (f.tem_layout ? 1 : 0), tipo: 'numero' },
  }), []);

  const { linhas: fabricasOrdenadas, ordem, alternar } = useOrdenacao(fabricas, campos);
  const [layouts, setLayouts] = useState<Record<number, LayoutSalvo | null>>({});
  const [novaFabrica, setNovaFabrica] = useState('');
  const [editando, setEditando] = useState<{ controle: number; nome: string } | null>(null);
  const [configurando, setConfigurando] = useState<FabricaAdmin | null>(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    if (!administrador) return;
    setErro('');
    try {
      const lista = await listarFabricasAdmin();
      setFabricas(lista);
      setMigracaoOk(true);

      /* o detalhe do layout (linha inicial, cabeçalho) só vem no RPC de layout */
      const entradas = await Promise.all(
        lista.map(async (f) => {
          if (!f.tem_layout) return [f.controle, null] as const;
          try {
            return [f.controle, await lerLayoutFabrica(f.controle)] as const;
          } catch {
            return [f.controle, null] as const;
          }
        }),
      );
      setLayouts(Object.fromEntries(entradas));
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar as fábricas.');
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
    const nome = novaFabrica.trim();
    if (nome.length < 2) {
      setErro('Informe o nome da fábrica.');
      return;
    }
    await executar(async () => {
      await criarFabrica(nome);
      setNovaFabrica('');
    }, `Fábrica "${nome}" criada.`);
  }

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            O cadastro de fábricas é exclusivo do perfil <strong>ADMIN</strong>.
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
        <h1 className="text-sm font-semibold text-slate-700">Fábricas e layouts de arquivo</h1>
        <button
          onClick={onVoltar}
          className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
        >
          Voltar
        </button>
      </div>

      {!migracaoOk && (
        <p className="mb-2 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {AVISO_MIGRACAO}
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

      <div className="mb-2 flex gap-2 rounded border border-slate-300 bg-white px-3 py-2">
        <input
          value={novaFabrica}
          onChange={(e) => setNovaFabrica(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void incluir();
          }}
          placeholder="Nome da nova fábrica (ex.: Bartzen)"
          className="w-72 rounded border border-slate-300 px-2 py-1.5 text-xs"
        />
        <button
          onClick={() => void incluir()}
          disabled={ocupado || !migracaoOk}
          className="rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Incluir fábrica
        </button>
        <span className="self-center text-[11px] text-slate-500">
          A fábrica criada já fica disponível na importação. O layout é opcional — sem ele o arquivo
          é lido no modo genérico.
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <ThOrdenavel campo="controle" titulo="Controle" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="nome" titulo="Fábrica" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="situacao" titulo="Situação" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="pedidos" titulo="Pedidos" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <ThOrdenavel campo="layout" titulo="Layout do arquivo" ordem={ordem} aoAlternar={alternar} className="px-3 py-2" />
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fabricas.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={6}>
                  {migracaoOk ? 'Nenhuma fábrica cadastrada.' : 'Aguardando a migração no banco.'}
                </td>
              </tr>
            )}
            {fabricasOrdenadas.map((f) => {
              const layout = layouts[f.controle];
              return (
                <tr key={f.controle} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-1.5 text-slate-500">{f.controle}</td>
                  <td className="px-3 py-1.5 font-medium">
                    {editando?.controle === f.controle ? (
                      <input
                        autoFocus
                        value={editando.nome}
                        onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setEditando(null);
                          if (e.key === 'Enter') {
                            const nome = editando.nome.trim();
                            void executar(
                              () => atualizarFabrica(f.controle, nome, f.ativo),
                              'Nome atualizado.',
                            ).then(() => setEditando(null));
                          }
                        }}
                        className="w-56 rounded border border-slate-300 px-2 py-1"
                      />
                    ) : (
                      f.nome
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {f.ativo ? (
                      <span className="text-emerald-700">Ativa</span>
                    ) : (
                      <span className="text-slate-400">Inativa</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-slate-500">{f.pedidos}</td>
                  <td className="px-3 py-1.5">
                    {f.tem_layout ? (
                      <span className="text-emerald-700">
                        Definido ({Object.keys(f.layout_campos ?? {}).length} campos
                        {f.layout_tipo === 'posicional'
                          ? ', largura fixa'
                          : `, separador “${f.layout_delim === '\t' ? 'TAB' : f.layout_delim}”`}
                        {layout ? `, linha ${layout.linha_inicial}` : ''})
                      </span>
                    ) : (
                      <span className="text-amber-700">Genérico (não definido)</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setConfigurando(f)}
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                      >
                        Definir layout
                      </button>
                      {editando?.controle === f.controle ? (
                        <button
                          onClick={() => setEditando(null)}
                          className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditando({ controle: f.controle, nome: f.nome })}
                          className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                        >
                          Renomear
                        </button>
                      )}
                      <button
                        onClick={() =>
                          void executar(
                            () => atualizarFabrica(f.controle, f.nome, f.ativo ? 0 : 1),
                            f.ativo ? 'Fábrica desativada.' : 'Fábrica reativada.',
                          )
                        }
                        className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                      >
                        {f.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(`Excluir a fábrica "${f.nome}"?`)) return;
                          void executar(
                            () => excluirFabrica(f.controle),
                            'Fábrica excluída.',
                          );
                        }}
                        className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50"
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

      {configurando && (
        <ConfigLayoutFabrica
          fabrica={configurando}
          onFechar={() => setConfigurando(null)}
          onSalvo={() => {
            setConfigurando(null);
            setMensagem(`Layout de "${configurando.nome}" salvo.`);
            void carregar();
          }}
        />
      )}
    </div>
  );
}
