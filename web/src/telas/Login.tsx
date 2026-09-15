import { useEffect, useState } from 'react';
import { login, type UsuarioLogado } from '../lib/api';
import { CHAVE_SESSAO } from '../lib/config';
import { somErro, somOk } from '../lib/audio';

type Props = {
  onEntrar: (usuario: UsuarioLogado, memorizar: boolean) => void;
};

/**
 * Tela de login — recriação do FormLogin do WinForms:
 * banner no topo, caixa "Entre com suas credenciais", usuário em MAIÚSCULAS
 * (max 30), senha (max 15), "Memorizar senha", Confirmar/Cancelar e o link
 * do rodapé www.softwerd.com.
 */
export default function Login({ onEntrar }: Props) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [memorizar, setMemorizar] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    if (!salvo) return;
    try {
      const dados = JSON.parse(salvo) as { login?: string };
      if (dados.login) {
        setUsuario(dados.login);
        setMemorizar(true);
      }
    } catch {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, []);

  async function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');

    if (!usuario.trim() || !senha) {
      setErro('Informe usuário e senha.');
      somErro();
      return;
    }

    setCarregando(true);
    try {
      const usuarioLogado = await login(usuario, senha);
      if (!usuarioLogado) {
        setErro('Usuário ou senha estão inválidos');
        somErro();
        return;
      }
      somOk();
      onEntrar(usuarioLogado, memorizar);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao conectar no banco de dados.');
      somErro();
    } finally {
      setCarregando(false);
    }
  }

  function cancelar() {
    setUsuario('');
    setSenha('');
    setErro('');
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-6">
      <div className="w-full max-w-[520px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl">
        {/* banner (no WinForms é o pictureBox3) */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-xl font-bold text-white shadow-lg">
            S
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-white">SysConf</h1>
            <p className="text-xs text-slate-300">Conferência de pedidos</p>
          </div>
        </div>

        <div className="flex gap-5 p-6">
          {/* imagem lateral (pictureBox1 - LoginRed) */}
          <div className="hidden h-[144px] w-[163px] shrink-0 items-center justify-center rounded-md border-2 border-slate-800 bg-slate-900 sm:flex">
            <div className="text-center leading-tight">
              <div className="text-4xl font-bold text-red-500">SIS</div>
              <div className="text-2xl font-bold text-white">CONF</div>
              <div className="mt-1 text-[10px] text-slate-400">warehouse</div>
            </div>
          </div>

          <form onSubmit={confirmar} className="flex-1">
            <fieldset className="rounded-md border border-slate-300 p-4">
              <legend className="px-1 text-xs font-semibold text-slate-600">
                Entre com suas credenciais
              </legend>

              <label className="mb-1 block text-xs text-slate-700" htmlFor="usuario">
                Usuário
              </label>
              <div className="mb-3 flex items-center gap-2">
                <input
                  id="usuario"
                  autoFocus
                  autoComplete="username"
                  maxLength={30}
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value.toUpperCase())}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${usuario ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  title={usuario ? 'Usuário informado' : 'Informe o usuário'}
                />
              </div>

              <label className="mb-1 block text-xs text-slate-700" htmlFor="senha">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  maxLength={15}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 pr-16 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-800"
                >
                  {mostrarSenha ? 'ocultar' : 'mostrar'}
                </button>
              </div>
            </fieldset>

            {erro && (
              <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {erro}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={memorizar}
                  onChange={(e) => setMemorizar(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Memorizar senha
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelar}
                  className="rounded border border-slate-300 bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                >
                  {carregando ? 'Conectando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-2 text-[11px] text-slate-500">
          <a
            href="http://www.softwerd.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            www.softwerd.com
          </a>
          <span>Supabase / PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
