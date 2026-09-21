import type { InputHTMLAttributes, ReactNode } from 'react';
import { MARCA } from './config';
import { IconeSistema } from './marca';

/**
 * Moldura das telas de login (padrão "painel + formulário").
 *
 * À esquerda fica o PAINEL DA MARCA — fundo escuro, o ícone do sistema, a
 * assinatura e o que o produto resolve, sem foto e sem ruído (modo clean).
 * À direita fica o formulário, centralizado, com largura de leitura confortável.
 * Em telas pequenas o painel desaparece e a marca aparece em cima do formulário.
 *
 * Usado por `Login` (/sysconf/<empresa>/login) e por `Entrar` (/entrar), para as
 * duas portas de entrada terem exatamente a mesma cara.
 */
export function TelaLogin({
  titulo,
  subtitulo,
  empresa,
  children,
  rodape,
  nota,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  /** Empresa logada (aparece no painel e serve de contexto no formulário). */
  empresa?: { nome: string; slug?: string } | null;
  children: ReactNode;
  /** Ações do pé do formulário (links do site, criar conta...). */
  rodape?: ReactNode;
  /** Observação abaixo de tudo, fora do cartão. */
  nota?: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-white lg:flex-row">
      {/* ------------------------------------------------ painel da marca -- */}
      <aside className="relative hidden shrink-0 flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex md:w-[46%]">
        {/* brilho suave: dá profundidade sem virar imagem de fundo */}
        <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <IconeSistema tamanho={56} />
          <div>
            <p className="text-2xl font-semibold tracking-wide">{MARCA.produto}</p>
            <p className="text-xs text-slate-400">{MARCA.assinatura}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-2xl font-semibold leading-snug">
            Da chegada do arquivo da fábrica até a carga entregue.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {[
              'Importe o arquivo da fábrica e a carga entra no sistema.',
              'Bipe a etiqueta: cada leitura é gravada na hora.',
              'O sistema mostra onde a peça deve ficar, estágio por estágio.',
              'O administrador acompanha tudo pelos logs de conferência.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-emerald-400">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[11px] text-slate-500">
          {empresa ? (
            <>
              Empresa: <strong className="font-semibold text-slate-300">{empresa.nome}</strong>
              {empresa.slug ? <span className="text-slate-500"> · /{empresa.slug}</span> : null}
            </>
          ) : (
            <>Conferência de pedidos e cargas de móveis planejados.</>
          )}
        </div>
      </aside>

      {/* --------------------------------------------------- formulário -- */}
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          {/* marca no topo enquanto o painel da esquerda não cabe */}
          <div className="mb-8 flex flex-col items-center gap-2 text-center md:hidden">
            <IconeSistema tamanho={48} />
            <div>
              <p className="text-xl font-semibold tracking-wide text-slate-900">{MARCA.produto}</p>
              <p className="text-[11px] text-slate-500">{MARCA.assinatura}</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}

          {children}

          {rodape}

          {nota && <p className="mt-6 text-center text-[11px] text-slate-500">{nota}</p>}
        </div>
      </main>
    </div>
  );
}

/**
 * Campo do formulário com rótulo em cima e espaço opcional à direita (usado
 * pelo "mostrar/ocultar" da senha).
 */
export function CampoLogin({
  id,
  rotulo,
  sufixo,
  className = '',
  ...resto
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  /** Conteúdo ancorado à direita, dentro do campo. */
  sufixo?: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600" htmlFor={id}>
        {rotulo}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${className}`}
          {...resto}
        />
        {sufixo && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2">{sufixo}</span>
        )}
      </div>
    </div>
  );
}

/** Interruptor de liga/desliga (o "Memorizar senha" saiu do checkbox). */
export function ChaveLigada({
  rotulo,
  marcado,
  aoMudar,
}: {
  rotulo: string;
  marcado: boolean;
  aoMudar: (valor: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={marcado}
      onClick={() => aoMudar(!marcado)}
      className="flex w-full items-center justify-between text-xs text-slate-600 hover:text-slate-900"
    >
      {rotulo}
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          marcado ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            marcado ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
