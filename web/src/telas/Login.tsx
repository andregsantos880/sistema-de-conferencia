import { useEffect, useState } from 'react';
import { login, type Empresa, type UsuarioLogado } from '../lib/api';
import { CHAVE_SESSAO, MARCA } from '../lib/config';
import { somErro, somOk } from '../lib/audio';
import { CampoLogin, ChaveLigada, TelaLogin } from '../lib/telaLogin';

type Props = {
  empresa: Empresa;
  onEntrar: (usuario: UsuarioLogado, memorizar: boolean) => void;
};

/**
 * Tela de login — recriação do FormLogin, agora identificando a empresa
 * (que vem do slug da URL). Usuário em MAIÚSCULAS (max 30), senha (max 15),
 * "Memorizar senha", Confirmar/Cancelar e o link do rodapé.
 */
export default function Login({ empresa, onEntrar }: Props) {
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
      const dados = JSON.parse(salvo) as { login?: string; empresa?: string };
      if (dados.login && dados.empresa === empresa.slug) {
        setUsuario(dados.login);
        setMemorizar(true);
      }
    } catch {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, [empresa.slug]);

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
      const usuarioLogado = await login(empresa.slug, usuario, senha);
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
    <TelaLogin
      empresa={{ nome: empresa.nome, slug: empresa.slug }}
      titulo="Bem-vindo de volta"
      subtitulo={
        <>
          Entre com as suas credenciais para conferir as cargas
          {empresa.nome ? ` da ${empresa.nome}` : ''}.
        </>
      }
      rodape={
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-[11px] text-slate-500">
          <a
            href={MARCA.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-emerald-700 hover:underline"
          >
            {MARCA.site}
          </a>
          <a href="/" className="hover:text-slate-800">
            ← Voltar ao site
          </a>
        </div>
      }
    >
      <form onSubmit={confirmar} className="mt-7 space-y-4">
        <CampoLogin
          id="usuario"
          rotulo="Usuário"
          autoFocus
          autoComplete="username"
          maxLength={30}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value.toUpperCase())}
          className="uppercase"
        />

        <CampoLogin
          id="senha"
          rotulo="Senha"
          type={mostrarSenha ? 'text' : 'password'}
          autoComplete="current-password"
          maxLength={15}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          sufixo={
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              {mostrarSenha ? 'ocultar' : 'mostrar'}
            </button>
          }
        />

        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {erro}
          </div>
        )}

        <ChaveLigada rotulo="Memorizar senha" marcado={memorizar} aoMudar={setMemorizar} />

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {carregando ? 'Conectando...' : 'Confirmar'}
        </button>

        <p className="text-center">
          <button
            type="button"
            onClick={cancelar}
            className="text-[11px] text-slate-500 underline hover:text-slate-800"
          >
            Limpar os campos
          </button>
        </p>
      </form>
    </TelaLogin>
  );
}
