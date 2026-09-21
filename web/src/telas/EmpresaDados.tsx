import { useCallback, useEffect, useState } from 'react';
import {
  atualizarDadosEmpresa,
  dadosDaEmpresa,
  migracaoPendente,
  AVISO_EMPRESA,
  type DadosEmpresa,
  type Empresa,
  type UsuarioLogado,
} from '../lib/api';
import { PERFIL } from '../lib/config';

type Props = {
  empresa: Empresa;
  usuarioLogado: UsuarioLogado;
  onVoltar: () => void;
  /** Avisa o app que o nome mudou (o topo passa a mostrar o nome novo). */
  onAtualizada?: (nome: string) => void;
};

/** Data no formato dd/mm/aaaa (ou um traço quando não há data). */
function dataCurta(valor: string | null | undefined): string {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR');
}

/**
 * DADOS DA EMPRESA (somente ADMIN).
 *
 * O administrador da empresa corrige o cadastro dela: nome, responsável e
 * e-mail de contato. O LINK DE ACESSO (/sysconf/<slug>) é imutável — é o
 * endereço que a equipe já tem salvo e enviado, então a tela só o mostra (com
 * botão de copiar). Situação, prazo do teste e retenção de logs aparecem como
 * informação: quem mexe nisso é a Softwerd (e a retenção tem tela própria).
 */
export default function EmpresaDados({ empresa, usuarioLogado, onVoltar, onAtualizada }: Props) {
  const [dados, setDados] = useState<DadosEmpresa | null>(null);
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [migracaoOk, setMigracaoOk] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    if (!administrador) return;
    setErro('');
    try {
      const encontrados = await dadosDaEmpresa();
      setDados(encontrados);
      setNome(encontrados.nome ?? '');
      setResponsavel(encontrados.responsavel ?? '');
      setEmail(encontrados.email_contato ?? '');
      setMigracaoOk(true);
    } catch (falha) {
      if (migracaoPendente(falha)) setMigracaoOk(false);
      else setErro(falha instanceof Error ? falha.message : 'Falha ao carregar os dados da empresa.');
    }
  }, [administrador]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');
    setMensagem('');

    if (nome.trim().length < 2) {
      setErro('Informe o nome da empresa (de 2 a 120 caracteres).');
      return;
    }

    setOcupado(true);
    try {
      await atualizarDadosEmpresa({ nome: nome.trim(), responsavel, emailContato: email });
      setMensagem('Dados da empresa atualizados.');
      onAtualizada?.(nome.trim());
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao gravar os dados.');
    } finally {
      setOcupado(false);
    }
  }

  async function copiarLink() {
    if (!dados) return;
    const link = `${window.location.origin}/sysconf/${dados.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro(`Não foi possível copiar. O link é: ${link}`);
    }
  }

  if (!administrador) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Acesso restrito</h2>
          <p className="mt-2 text-xs text-slate-600">
            Os dados da empresa são exclusivos do perfil <strong>ADMIN</strong>.
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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-slate-300 bg-white px-3 py-2">
        <h1 className="text-sm font-semibold text-slate-700">
          Dados da empresa
          <span className="ml-2 text-[11px] font-normal text-slate-500">
            {dados?.nome ?? ''} · o link de acesso não muda
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

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-[760px] space-y-3">
          {!migracaoOk && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {AVISO_EMPRESA}
            </div>
          )}

          <form
            onSubmit={salvar}
            className="rounded border border-slate-300 bg-white p-4 text-xs"
          >
            <p className="mb-3 text-[11px] text-slate-500">
              Estes dados aparecem no sistema e nas telas do administrador. Corrija o que precisar e
              clique em Salvar.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-slate-700">Nome da empresa</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={120}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-slate-700">Responsável</span>
                <input
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  maxLength={120}
                  placeholder="nome de quem responde pela operação"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-slate-700">E-mail de contato</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={160}
                  placeholder="compras@suaempresa.com.br"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            {erro && (
              <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{erro}</div>
            )}
            {mensagem && (
              <div className="mt-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-800">
                {mensagem}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-[11px] text-slate-500">
                O nome novo vale para todo o sistema; cada usuário logado continua na mesma sessão.
              </span>
              <button
                type="submit"
                disabled={ocupado}
                className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {ocupado ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>

          {/* ------------------------------------------- link de acesso -- */}
          <div className="rounded border border-slate-300 bg-white p-4 text-xs">
            <p className="mb-2 font-semibold text-slate-700">Link de acesso (não muda)</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 break-all text-slate-700">
                {window.location.origin}/sysconf/{dados?.slug ?? empresa.slug}
              </code>
              <button
                onClick={() => void copiarLink()}
                className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
              >
                {copiado ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              É o endereço que a sua equipe já usa. Ele é fixo: se o endereço mudasse, todos os links
              salvos e enviados parariam de funcionar. Para divulgar, envie este link e cada usuário
              entra com o próprio login.
            </p>
          </div>

          {/* --------------------------------------------- só informativo -- */}
          <div className="rounded border border-slate-300 bg-white p-4 text-xs">
            <p className="mb-2 font-semibold text-slate-700">Informações da conta</p>
            <dl className="grid gap-2 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] text-slate-500">Situação</dt>
                <dd className="font-semibold text-slate-700">
                  {Number(dados?.ativo) === 1 ? 'Ativa' : 'Inativa'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Teste grátis até</dt>
                <dd className="font-semibold text-slate-700">
                  {dados?.trial_ate ? dataCurta(dados.trial_ate) : 'sem prazo'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Cliente desde</dt>
                <dd className="font-semibold text-slate-700">{dataCurta(dados?.criado_em)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Usuários</dt>
                <dd className="font-semibold text-slate-700">{dados?.usuarios ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Fábricas</dt>
                <dd className="font-semibold text-slate-700">{dados?.fabricas ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Peças na base</dt>
                <dd className="font-semibold text-slate-700">{dados?.pedidos ?? '—'}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-slate-500">
              Situação da conta e prazo do teste são ajustados pelo suporte da Softwerd. A retenção dos
              logs de conferência continua na tela “Logs de conferência”.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
