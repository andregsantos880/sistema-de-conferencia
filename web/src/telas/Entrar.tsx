import { useEffect, useState } from 'react';
import { listarEmpresas, login, type EmpresaPublica, type UsuarioLogado } from '../lib/api';
import { CHAVE_SESSAO } from '../lib/config';
import { CampoLogin, ChaveLigada, TelaLogin } from '../lib/telaLogin';

type Props = {
  onEntrar: (usuario: UsuarioLogado, memorizar: boolean) => void;
};

/** Compara nome de empresa sem acento e sem diferenciar maiúsculas. */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Login de quem já é cliente, a partir da landing (/entrar).
 *
 * Como aqui não há empresa na URL, o usuário informa a empresa — aceita o
 * NOME cadastrado ou o endereço (slug). Depois do login o app segue para
 * /sysconf/<empresa>/conferencia, o mesmo endereço do link enviado ao cliente.
 */
export default function Entrar({ onEntrar }: Props) {
  const [empresas, setEmpresas] = useState<EmpresaPublica[]>([]);
  const [empresaTexto, setEmpresaTexto] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [memorizar, setMemorizar] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    listarEmpresas()
      .then(setEmpresas)
      .catch(() => setEmpresas([]));
  }, []);

  /* preenche com o último acesso memorizado (igual ao "Memorizar senha" legado) */
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    if (!salvo) return;
    try {
      const dados = JSON.parse(salvo) as { login?: string; empresa?: string };
      if (dados.login) setUsuario(dados.login);
      if (dados.empresa) {
        const encontrada = empresas.find((e) => e.slug === dados.empresa);
        setEmpresaTexto(encontrada?.nome ?? dados.empresa ?? '');
      }
      setMemorizar(true);
    } catch {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, [empresas]);

  function acharEmpresa(): EmpresaPublica | null {
    const alvo = normalizar(empresaTexto);
    if (!alvo) return null;
    return (
      empresas.find((e) => normalizar(e.nome) === alvo) ??
      empresas.find((e) => normalizar(e.slug) === alvo) ??
      null
    );
  }

  async function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');

    if (!empresaTexto.trim() || !usuario.trim() || !senha) {
      setErro('Informe a empresa, o usuário e a senha.');
      return;
    }

    const empresa = acharEmpresa();
    if (!empresa) {
      setErro(
        empresas.length === 0
          ? 'Não foi possível consultar as empresas agora. Tente novamente em instantes.'
          : `Empresa "${empresaTexto}" não encontrada. Confira o nome ou use o link enviado para a sua equipe.`,
      );
      return;
    }

    setCarregando(true);
    try {
      const usuarioLogado = await login(empresa.slug, usuario, senha);
      if (!usuarioLogado) {
        setErro('Usuário ou senha estão inválidos');
        return;
      }
      onEntrar(usuarioLogado, memorizar);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao conectar no banco de dados.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaLogin
      titulo="Bem-vindo de volta"
      subtitulo="Entre com os dados da sua empresa para conferir as cargas."
      empresa={acharEmpresa() ? { nome: acharEmpresa()!.nome, slug: acharEmpresa()!.slug } : null}
      rodape={
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-[11px] text-slate-500">
          <a href="/registrar" className="font-semibold text-emerald-700 hover:underline">
            Criar conta grátis
          </a>
          <a href="/" className="hover:text-slate-800">
            ← Voltar ao site
          </a>
        </div>
      }
      nota={
        <>
          Sua empresa tem um endereço próprio: <strong>/sysconf/sua-empresa</strong>. Se a equipe recebeu
          esse link, pode entrar por ele — é o mesmo sistema.
        </>
      }
    >
      <form onSubmit={confirmar} className="mt-7 space-y-4">
        <div>
          <CampoLogin
            id="empresa"
            rotulo="Empresa"
            autoFocus
            list="lista-empresas"
            autoComplete="organization"
            value={empresaTexto}
            onChange={(e) => setEmpresaTexto(e.target.value)}
            placeholder="Nome da sua empresa"
          />
          <datalist id="lista-empresas">
            {empresas.map((empresa) => (
              <option key={empresa.slug} value={empresa.nome}>
                {empresa.slug}
              </option>
            ))}
          </datalist>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Não precisa do endereço exato: o nome da empresa já basta.
          </p>
        </div>

        <CampoLogin
          id="usuario"
          rotulo="Usuário"
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
          {carregando ? 'Conectando...' : 'Entrar'}
        </button>
      </form>
    </TelaLogin>
  );
}
