import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  atualizarUsuario,
  criarUsuario,
  excluirUsuario,
  listarUsuarios,
  type Empresa,
  type UsuarioEmpresa,
} from '../lib/api';
import { PERFIL } from '../lib/config';
import { Marca } from '../lib/marca';
import { ThOrdenavel, useOrdenacao, type CampoOrdenavel } from '../lib/ordenacao';

type Props = {
  empresa: Empresa;
  usuarioLogado: { id: number; login: string; perfil: string };
  onVoltar: () => void;
};

type Formulario = { login: string; nome: string; senha: string; perfil: string };

const FORM_VAZIO: Formulario = { login: '', nome: '', senha: '', perfil: PERFIL.OPERADOR };

/**
 * Gestão de usuários e perfis — feita pela PRÓPRIA empresa logada.
 * Restrita ao perfil ADMIN. Perfis: ADMIN (administrador) e OPERADOR.
 */
export default function Usuarios({ empresa, usuarioLogado, onVoltar }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);

  /** Colunas ordenáveis (clique no cabeçalho: asc → desc → sem ordenação). */
  const campos = useMemo<Record<string, CampoOrdenavel<UsuarioEmpresa>>>(() => ({
    login: { titulo: 'Login', valor: (u) => u.login },
    nome: { titulo: 'Nome', valor: (u) => u.nome },
    perfil: { titulo: 'Perfil', valor: (u) => u.perfil },
    situacao: { titulo: 'Situação', valor: (u) => u.ativo, tipo: 'numero' },
  }), []);

  const { linhas: usuariosOrdenados, ordem, alternar } = useOrdenacao(usuarios, campos);
  const [form, setForm] = useState<Formulario>(FORM_VAZIO);
  const [editando, setEditando] = useState<UsuarioEmpresa | null>(null);
  const [senhaNova, setSenhaNova] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    if (!administrador) return;
    try {
      setUsuarios(await listarUsuarios());
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os usuários.');
    }
  }, [administrador]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            A gestão de usuários é exclusiva do perfil <strong>ADMIN</strong>.
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

  async function comTratamento(acao: () => Promise<void>, sucesso: string) {
    setOcupado(true);
    setErro('');
    setMensagem('');
    try {
      await acao();
      setMensagem(sucesso);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha na operação.');
    } finally {
      setOcupado(false);
    }
  }

  async function incluir(evento: React.FormEvent) {
    evento.preventDefault();
    const login = form.login.trim().toUpperCase();
    const senha = form.senha.trim();

    if (!login || !senha) {
      setErro('Informe login e senha.');
      return;
    }

    await comTratamento(
      () =>
        criarUsuario({
          login,
          nome: form.nome.trim(),
          senha,
          perfil: form.perfil,
        }),
      `Usuário ${login} criado.`,
    );
    setForm(FORM_VAZIO);
  }

  async function salvarEdicao() {
    if (!editando) return;
    const dados: Parameters<typeof atualizarUsuario>[1] = {
      login: editando.login.trim().toUpperCase(),
      nome: (editando.nome ?? '').trim(),
      perfil: editando.perfil,
      ativo: editando.ativo,
    };
    if (senhaNova.trim()) dados.senha = senhaNova.trim();

    await comTratamento(() => atualizarUsuario(editando.id, dados), 'Usuário atualizado.');
    setEditando(null);
    setSenhaNova('');
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex shrink-0 items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <div className="flex items-center gap-3">
          <Marca />
          <span className="rounded bg-slate-700 px-2 py-0.5 text-[11px]">{empresa.nome}</span>
          <span className="text-xs text-slate-300">Usuários e perfis</span>
        </div>
        <button onClick={onVoltar} className="rounded border border-slate-600 px-3 py-1 text-xs hover:bg-slate-700">
          Voltar para a conferência
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-[900px] space-y-4">
          {erro && <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>}
          {mensagem && (
            <div className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {mensagem}
            </div>
          )}

          {/* incluir usuário */}
          <form onSubmit={incluir} className="rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold text-slate-700">Novo usuário desta empresa</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <label className="text-xs sm:col-span-2">
                Login
                <input
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value.toUpperCase() })}
                  maxLength={30}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 uppercase"
                />
              </label>
              <label className="text-xs sm:col-span-2">
                Nome
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  maxLength={80}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-xs">
                Senha
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  maxLength={15}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="text-xs">
                Perfil
                <select
                  value={form.perfil}
                  onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                >
                  <option value={PERFIL.OPERADOR}>Operador</option>
                  <option value={PERFIL.ADMIN}>Administrador</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={ocupado}
              className="mt-3 rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Incluir usuário
            </button>
          </form>

          {/* lista */}
          <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <ThOrdenavel campo="login" titulo="Login" ordem={ordem} aoAlternar={alternar} className="px-3 py-2 text-left font-semibold" />
                  <ThOrdenavel campo="nome" titulo="Nome" ordem={ordem} aoAlternar={alternar} className="px-3 py-2 text-left font-semibold" />
                  <ThOrdenavel campo="perfil" titulo="Perfil" ordem={ordem} aoAlternar={alternar} className="px-3 py-2 text-left font-semibold" />
                  <ThOrdenavel campo="situacao" titulo="Situação" ordem={ordem} aoAlternar={alternar} className="px-3 py-2 text-left font-semibold" />
                  <th className="px-3 py-2 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosOrdenados.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-slate-200 last:border-0">
                    <td className="px-3 py-2 font-mono">{usuario.login}</td>
                    <td className="px-3 py-2">{usuario.nome ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] ${
                          usuario.perfil === PERFIL.ADMIN
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {usuario.perfil === PERFIL.ADMIN ? 'Administrador' : 'Operador'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {usuario.ativo ? (
                        <span className="text-emerald-700">Ativo</span>
                      ) : (
                        <span className="text-red-600">Inativo</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditando(usuario);
                            setSenhaNova('');
                          }}
                          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            void comTratamento(
                              () =>
                                atualizarUsuario(usuario.id, {
                                  login: usuario.login,
                                  nome: usuario.nome ?? '',
                                  perfil: usuario.perfil,
                                  ativo: !usuario.ativo,
                                }),
                              usuario.ativo ? 'Usuário inativado.' : 'Usuário reativado.',
                            )
                          }
                          disabled={ocupado || usuario.id === usuarioLogado.id}
                          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
                        >
                          {usuario.ativo ? 'Inativar' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o usuário ${usuario.login}?`)) {
                              void comTratamento(() => excluirUsuario(usuario.id), 'Usuário excluído.');
                            }
                          }}
                          disabled={ocupado || usuario.id === usuarioLogado.id}
                          className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      Nenhum usuário cadastrado nesta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500">
            A senha é armazenada em texto plano (o login legado compara direto). O próprio administrador pode
            redefinir a senha e o perfil. Você não pode inativar/excluir o seu próprio usuário.
          </p>
        </div>
      </div>

      {/* edição */}
      {editando && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="overlay-surgir w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-4 shadow-2xl">
            <h2 className="mb-3 text-sm font-semibold">Editar {editando.login}</h2>
            <div className="space-y-3 text-xs">
              <label className="block">
                Login
                <input
                  value={editando.login}
                  onChange={(e) => setEditando({ ...editando, login: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 uppercase"
                />
              </label>
              <label className="block">
                Nome
                <input
                  value={editando.nome ?? ''}
                  onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="block">
                Perfil
                <select
                  value={editando.perfil}
                  onChange={(e) => setEditando({ ...editando, perfil: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                >
                  <option value={PERFIL.OPERADOR}>Operador</option>
                  <option value={PERFIL.ADMIN}>Administrador</option>
                </select>
              </label>
              <label className="block">
                Nova senha (deixe vazio para manter)
                <input
                  type="password"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  maxLength={15}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditando(null)}
                className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => void salvarEdicao()}
                disabled={ocupado}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
