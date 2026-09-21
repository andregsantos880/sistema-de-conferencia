import { useMemo, useState } from 'react';
import { registrarEmpresa, type UsuarioLogado } from '../lib/api';
import {
  MARCA,
  TRIAL_DIAS,
  ENDERECO_VALIDO,
  ENDERECOS_RESERVADOS,
  sugerirEndereco,
} from '../lib/config';

type Props = {
  onEntrar: (usuario: UsuarioLogado, memorizar: boolean) => void;
};

const LOGIN_VALIDO = /^[A-Z0-9][A-Z0-9._-]*$/;
const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Autocadastro (landing): cria a empresa + o primeiro usuário ADMIN e entra
 * direto, com TRIAL_DIAS de teste.
 *
 * As validações aqui são de conveniência (feedback na hora); a regra que vale
 * está no RPC `registrar_empresa` — inclusive a unicidade do endereço, que só
 * o banco pode garantir. A mensagem de erro do banco é mostrada ao usuário.
 */
export default function Registrar({ onEntrar }: Props) {
  const [empresa, setEmpresa] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditado, setSlugEditado] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('ADMIN');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceite, setAceite] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const endereco = useMemo(() => (slugEditado ? slug : sugerirEndereco(empresa)), [empresa, slug, slugEditado]);

  /* `window` nao existe no build estatico (scripts/prerender.mjs) */
  const origem = typeof window === 'undefined' ? '' : window.location.origin;
  const urlPrevista = `${origem}/sysconf/${endereco || 'sua-empresa'}/login`;

  function trocarEmpresa(valor: string) {
    setEmpresa(valor);
    if (!slugEditado) setSlug(sugerirEndereco(valor));
  }

  function validar(): string {
    if (empresa.trim().length < 2) return 'Informe o nome da empresa (mínimo 2 caracteres).';
    if (!ENDERECO_VALIDO.test(endereco))
      return 'O endereço deve ter de 3 a 30 caracteres, usando letras sem acento, números e hífen (não pode começar nem terminar com hífen).';
    if (ENDERECOS_RESERVADOS.includes(endereco)) return 'Este endereço é reservado pelo sistema. Escolha outro.';
    if (login.trim().length < 3) return 'O usuário deve ter no mínimo 3 caracteres.';
    if (login.trim().length > 30) return 'O usuário deve ter no máximo 30 caracteres.';
    if (!LOGIN_VALIDO.test(login.trim())) return 'O usuário aceita apenas letras, números, ponto, hífen e sublinhado.';
    if (senha.length < 4) return 'A senha deve ter no mínimo 4 caracteres.';
    if (senha.length > 15) return 'A senha deve ter no máximo 15 caracteres (limite do sistema).';
    if (senha !== confirmar) return 'As duas senhas não são iguais.';
    if (email.trim() && !EMAIL_VALIDO.test(email.trim())) return 'E-mail inválido.';
    if (!aceite) return 'Confirme que você leu e aceita os termos de uso.';
    return '';
  }

  async function confirmarCadastro(evento: React.FormEvent) {
    evento.preventDefault();
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      const usuarioLogado = await registrarEmpresa({
        empresa,
        slug: endereco,
        login: login.trim().toUpperCase(),
        senha,
        nome,
        email,
      });
      onEntrar(usuarioLogado, true);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível concluir o cadastro.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl">
          <div className="bg-slate-900 px-6 py-5 text-white">
            <h1 className="text-lg font-semibold">Criar conta no {MARCA.produto}</h1>
            <p className="text-xs text-slate-300">
              {TRIAL_DIAS} dias grátis, sem cartão de crédito. Você entra como administrador.
            </p>
          </div>

          <form onSubmit={confirmarCadastro} className="space-y-5 p-6">
            <fieldset className="space-y-4 rounded-md border border-slate-200 p-4">
              <legend className="px-1 text-xs font-semibold text-slate-600">Sua empresa</legend>

              <div>
                <label className="mb-1 block text-xs text-slate-700" htmlFor="empresa">
                  Nome da empresa *
                </label>
                <input
                  id="empresa"
                  autoFocus
                  maxLength={120}
                  value={empresa}
                  onChange={(e) => trocarEmpresa(e.target.value)}
                  placeholder="Ex.: Móveis Silva Ltda"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-700" htmlFor="endereco">
                  Endereço no sistema *
                </label>
                <div className="flex items-stretch overflow-hidden rounded border border-slate-300">
                  <span className="flex items-center bg-slate-100 px-2 text-[11px] text-slate-500">/sysconf/</span>
                  <input
                    id="endereco"
                    value={endereco}
                    maxLength={30}
                    onChange={(e) => {
                      setSlugEditado(true);
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                          .slice(0, 30),
                      );
                    }}
                    className="w-full px-3 py-2 text-sm outline-none focus:bg-emerald-50"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  É o endereço que a sua equipe vai usar para entrar. Só letras, números e hífen.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-700" htmlFor="responsavel">
                    Seu nome
                  </label>
                  <input
                    id="responsavel"
                    maxLength={120}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-700" htmlFor="email">
                    E-mail de contato
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@suaempresa.com.br"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-md border border-slate-200 p-4">
              <legend className="px-1 text-xs font-semibold text-slate-600">Seu acesso de administrador</legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-700" htmlFor="login">
                    Usuário *
                  </label>
                  <input
                    id="login"
                    maxLength={30}
                    value={login}
                    onChange={(e) => setLogin(e.target.value.toUpperCase())}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-700" htmlFor="senha">
                    Senha * <span className="text-slate-400">(de 4 a 15 caracteres)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      autoComplete="new-password"
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
              </div>

              <div className="sm:w-[calc(50%-0.5rem)]">
                <label className="mb-1 block text-xs text-slate-700" htmlFor="confirmar">
                  Repita a senha *
                </label>
                <input
                  id="confirmar"
                  type="password"
                  autoComplete="new-password"
                  maxLength={15}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </fieldset>

            <label className="flex items-start gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5"
              />
              <span>
                Li e aceito os{' '}
                <a href="/termos" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">
                  termos de uso
                </a>{' '}
                e a{' '}
                <a href="/privacidade" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">
                  política de privacidade
                </a>
                . Declaro que os dados informados são da minha empresa e que responderei pelo conteúdo
                importado no sistema.
              </span>
            </label>

            {erro && (
              <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>
            )}

            <div className="flex items-center justify-between">
              <a href="/" className="text-xs text-slate-500 hover:text-slate-800">
                ← Voltar ao site
              </a>
              <button
                type="submit"
                disabled={carregando}
                className="rounded bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {carregando ? 'Criando sua conta...' : `Começar ${TRIAL_DIAS} dias grátis`}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Endereço da sua equipe
            </h2>
            <code className="mt-2 block rounded bg-slate-100 px-3 py-2 text-[11px] break-all text-slate-700">
              {urlPrevista}
            </code>
            <p className="mt-2 text-[11px] text-slate-500">
              Guarde este link: é por ele que os operadores vão entrar. O endereço fica reservado para a sua
              empresa.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">
              O que acontece agora
            </h2>
            <ol className="mt-2 space-y-2 text-[11px] text-emerald-900">
              <li>1. A conta é criada e você entra como administrador.</li>
              <li>2. Cadastre os operadores em Usuários (dentro do sistema).</li>
              <li>3. Importe o arquivo da fábrica e comece a conferir.</li>
            </ol>
            <p className="mt-3 text-[11px] text-emerald-900">
              Nada é cobrado no período de teste e não pedimos cartão.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-[11px] text-slate-600 shadow-sm">
            Já tem conta?{' '}
            <a href="/entrar" className="font-semibold text-emerald-700 underline">
              Entrar no sistema
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
