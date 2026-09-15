import { useEffect, useState } from 'react';
import { listarEmpresas, login, type Empresa, type UsuarioLogado } from '../lib/api';
import { CHAVE_SESSAO, MARCA } from '../lib/config';

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
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
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

  function acharEmpresa(): Empresa | null {
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
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-6">
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl">
        <div className="bg-slate-900 px-6 py-5 text-white">
          <h1 className="text-lg font-semibold">{MARCA.produto}</h1>
          <p className="text-xs text-slate-300">Entrar no sistema de conferência</p>
        </div>

        <form onSubmit={confirmar} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs text-slate-700" htmlFor="empresa">
              Empresa
            </label>
            <input
              id="empresa"
              autoFocus
              list="lista-empresas"
              autoComplete="organization"
              value={empresaTexto}
              onChange={(e) => setEmpresaTexto(e.target.value)}
              placeholder="Nome da sua empresa"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <datalist id="lista-empresas">
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.nome}>
                  {empresa.slug}
                </option>
              ))}
            </datalist>
            <p className="mt-1 text-[11px] text-slate-500">
              Não precisa do endereço exato: o nome da empresa já basta.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-700" htmlFor="usuario">
              Usuário
            </label>
            <input
              id="usuario"
              autoComplete="username"
              maxLength={30}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.toUpperCase())}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
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
          </div>

          {erro && (
            <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={memorizar}
                onChange={(e) => setMemorizar(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Memorizar senha
            </label>
            <button
              type="submit"
              disabled={carregando}
              className="rounded bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {carregando ? 'Conectando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-[11px] text-slate-600">
          <a href="/registrar" className="font-semibold text-emerald-700 underline">
            Criar conta grátis
          </a>
          <a href="/" className="text-slate-500 hover:text-slate-800">
            ← Voltar ao site
          </a>
        </div>
      </div>

      <p className="mt-4 max-w-[460px] text-center text-[11px] text-slate-500">
        Sua empresa tem um endereço próprio: <strong>/sysconf/sua-empresa</strong>. Se a equipe recebeu esse
        link, pode entrar por ele — é o mesmo sistema.
      </p>
    </div>
  );
}
