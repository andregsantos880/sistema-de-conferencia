import { MARCA, TRIAL_DIAS } from '../lib/config';

/**
 * Landing page (raiz do site).
 *
 * Página de vendas do SysConf, com dois caminhos para quem já entendeu:
 * "Começar teste grátis" (-> /registrar) e "Já sou cliente" (-> /entrar).
 * Os links são <a> comuns de propósito: são URLs reais, o Firebase reescreve
 * tudo para o index.html e o Sysconf resolve a rota na carga.
 *
 * Toda a identidade sai de `MARCA` (lib/config.ts) — nenhum texto de contato
 * espalhado pelo código.
 */

const PASSOS = [
  {
    titulo: 'Importe o arquivo da fábrica',
    texto:
      'CSV ou TXT delimitado. As fábricas com integração instalada já têm o layout mapeado — nos outros formatos o sistema lê pelo cabeçalho.',
  },
  {
    titulo: 'Bipe as etiquetas',
    texto:
      'A cada leitura o sistema mostra o box, a peça, a quantidade e o pedido. O som e a voz confirmam o box sem o operador tirar os olhos da carga.',
  },
  {
    titulo: 'Troque o estágio',
    texto:
      'Conferência, Saída e Entrega. Cada bipe já grava no banco — o que está na tela é o que está no servidor.',
  },
  {
    titulo: 'Feche e exporte',
    texto:
      'Contadores por estágio, bloqueio de duplicidade e exportação em CSV do que foi conferido.',
  },
] as const;

const RECURSOS = [
  {
    titulo: 'Estágios de conferência',
    texto:
      'Conferência, Saída e Entrega com cores e contadores próprios, iguais aos da conferência de papel.',
  },
  {
    titulo: 'Som e voz na bipagem',
    texto:
      'Biper de acerto, erro, box fechado e a leitura do nome do box em voz alta para toda a equipe.',
  },
  {
    titulo: 'Uma empresa por endereço',
    texto:
      'Cada cliente acessa pelo próprio caminho (/sysconf/sua-empresa). Pedidos, usuários e cadastros ficam separados.',
  },
  {
    titulo: 'Perfis de acesso',
    texto:
      'Administrador e Operador. O operador não vê a coluna do código de barras nem os campos internos.',
  },
  {
    titulo: 'Usuários pela própria empresa',
    texto:
      'Quem é administrador cadastra, edita, ativa e remove operadores sem abrir chamado para nós.',
  },
  {
    titulo: 'Fábricas com integração',
    texto:
      'As fábricas com leitura já instalada ficam fixadas no topo da lista, com selo.',
  },
  {
    titulo: 'Busca e filtro',
    texto: 'Localize por ordem de compra, pedido ou carga e trabalhe só com o que interessa.',
  },
  {
    titulo: 'Sem instalação',
    texto:
      'Roda no navegador do computador que você já tem. Basta um leitor de código de barras USB.',
  },
] as const;

const DORES = [
  {
    titulo: 'Etiqueta lida duas vezes',
    texto: 'Duas pessoas bipando a mesma peça e ninguém percebe até faltar mercadoria.',
  },
  {
    titulo: 'Peça no box errado',
    texto: 'A carga sai com a conferência certa no papel e errada no caminhão.',
  },
  {
    titulo: 'Sem saber onde parou',
    texto: 'Planilha de um lado, romaneio do outro, e o status real só existe na cabeça de alguém.',
  },
] as const;

const PERGUNTAS = [
  {
    p: 'Preciso instalar algum programa?',
    r: 'Não. O SysConf roda no navegador. Você precisa apenas de um leitor de código de barras USB — o mesmo que já usa hoje.',
  },
  {
    p: 'Serve para mais de uma empresa ou filial?',
    r: 'Sim. Cada empresa tem o próprio endereço, os próprios usuários e os próprios pedidos. Um operador de uma empresa não enxerga nada da outra.',
  },
  {
    p: 'O operador vê a quantidade e o código de barras?',
    r: 'Não. A coluna do código de barras é visível apenas para o administrador. As colunas internas (ID, fábrica, box, bloqueio, PC) não aparecem para ninguém.',
  },
  {
    p: 'Meu arquivo de fábrica tem formato próprio. Funciona?',
    r: `Sim. As fábricas com integração instalada têm o layout mapeado; nos demais formatos o sistema identifica separador e colunas pelo cabeçalho. Se a sua fábrica tiver um formato específico, configuramos o layout para ela.`,
  },
  {
    p: `Quanto custa depois dos ${TRIAL_DIAS} dias?`,
    r: 'O teste é gratuito e não pede cartão. Depois dele o valor é combinado com você, conforme o volume da operação.',
  },
  {
    p: 'O que acontece com o que eu já conferi?',
    r: 'Cada bipe é gravado na hora. Se a energia cair ou o computador travar, nada do que foi conferido se perde.',
  },
] as const;

function Logo({ claro = true }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow">
        S
      </span>
      <span className={`text-base font-semibold tracking-wide ${claro ? 'text-white' : 'text-slate-900'}`}>
        {MARCA.produto}
      </span>
    </span>
  );
}

export default function Landing() {
  const ano = new Date().getFullYear();

  return (
    <div className="min-h-full bg-white">
      {/* ------------------------------------------------------------- topo -- */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#como-funciona" className="hover:text-white">
              Como funciona
            </a>
            <a href="#recursos" className="hover:text-white">
              Recursos
            </a>
            <a href="#teste" className="hover:text-white">
              Teste grátis
            </a>
            <a href="#duvidas" className="hover:text-white">
              Dúvidas
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/entrar"
              className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
            >
              Entrar
            </a>
            <a
              href="/registrar"
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Criar conta
            </a>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- hero -- */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {TRIAL_DIAS} dias grátis • sem cartão de crédito
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Sua conferência de cargas inteira no navegador
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-300">
              O {MARCA.produto} organiza a conferência de entrada e de saída: importe o arquivo da fábrica,
              bipe as etiquetas, separe por box e libere a carga. Sem papel, sem instalação e com o leitor
              de código de barras que você já tem.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/registrar"
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700"
              >
                Começar teste grátis
              </a>
              <a
                href="/entrar"
                className="rounded-lg border border-slate-600 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Já sou cliente
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Configuração em minutos. Se a sua fábrica tiver formato próprio, ajustamos com você.
            </p>
          </div>

          {/* prévia da tela de conferência */}
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-[11px] text-slate-300">
              <span className="rounded bg-emerald-700 px-2 py-0.5 font-semibold">Sua Empresa</span>
              <span className="rounded bg-slate-700 px-2 py-0.5">★ Criare</span>
              <span className="ml-auto text-slate-500">Usuário: OPERADOR</span>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded border-2 border-emerald-500 bg-black text-lg font-bold text-emerald-400">
                BOX 3
              </div>
              <div className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-300">
                <div className="truncate text-white">BANCADA GRANITO 120CM</div>
                <div>
                  Quantidade: <strong className="text-white">3</strong> · Box:{' '}
                  <strong className="text-white">3</strong>
                </div>
                <div className="truncate">
                  Pedido: <strong className="text-white">OC-1001</strong> / LOJA CENTRO
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-[11px]">
              {[
                { linha: 'OC-1001 · LOJA CENTRO · P001', stage: 'Conferência', cor: 'bg-[#90ee90] text-slate-900' },
                { linha: 'OC-1001 · LOJA CENTRO · P003', stage: 'Conferência', cor: 'bg-[#90ee90] text-slate-900' },
                { linha: 'OC-1002 · LOJA NORTE · P004', stage: 'Saída', cor: 'bg-[#f08080] text-slate-900' },
                { linha: 'OC-1003 · LOJA SUL · P007', stage: 'Normal', cor: 'bg-white text-slate-900' },
              ].map((item) => (
                <div key={item.linha} className={`flex items-center gap-2 rounded px-2 py-1 ${item.cor}`}>
                  <span className="flex-1 truncate">{item.linha}</span>
                  <span className="text-[10px] font-semibold uppercase">{item.stage}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2 text-[10px] text-slate-400">
              <span>Normal: 1</span>
              <span>· Conferência: 2</span>
              <span>· Saída: 1</span>
              <span>· Entrega: 0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- dores -- */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900">O que a conferência em papel custa</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Os três problemas que aparecem em toda operação que confere carga com romaneio impresso e
            planilha na mão.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {DORES.map((dor) => (
              <div key={dor.titulo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{dor.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600">{dor.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- como funciona -- */}
      <section id="como-funciona" className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900">Como funciona na prática</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Do arquivo da fábrica até a carga liberada para a saída, em quatro passos que a equipe aprende
            no mesmo dia.
          </p>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((passo, indice) => (
              <li key={passo.titulo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {indice + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{passo.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- recursos -- */}
      <section id="recursos" className="border-y border-slate-200 bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900">Todo o controle que a carga precisa</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Recursos que já estão no ar e em uso — nada de promessa de roadmap.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RECURSOS.map((recurso) => (
              <div key={recurso.titulo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{recurso.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600">{recurso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- teste grátis -- */}
      <section id="teste" className="px-4 py-14">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 shadow-lg">
          <div className="bg-slate-900 px-6 py-6 text-white sm:px-8">
            <h2 className="text-2xl font-bold">
              Comece com {TRIAL_DIAS} dias grátis
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Você cria a conta, o endereço da sua empresa e o seu acesso de administrador. Entra direto no
              sistema, sem aprovação e sem falar com ninguém.
            </p>
          </div>

          <div className="grid gap-6 bg-white p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">O que está incluído</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {[
                  'Importação ilimitada de arquivos das fábricas',
                  'Conferência de entrada, saída e entrega',
                  'Usuários e perfis gerenciados por você',
                  'Exportação em CSV do que foi conferido',
                  'Suporte para configurar o layout das suas fábricas',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-3xl font-bold text-emerald-700">{TRIAL_DIAS} dias</div>
              <div className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">
                sem custo e sem cartão
              </div>
              <p className="mt-3 text-sm text-emerald-900">
                Depois do teste, o valor é combinado com você conforme o volume da operação — sem cobrança
                automática e sem surpresa.
              </p>
              <a
                href="/registrar"
                className="mt-4 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow hover:bg-emerald-700"
              >
                Criar minha conta
              </a>
              <a href="/entrar" className="mt-2 block text-center text-xs text-emerald-800 underline">
                Já tenho conta, quero entrar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- dúvidas -- */}
      <section id="duvidas" className="border-t border-slate-200 bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">Dúvidas frequentes</h2>
          <div className="mt-6 space-y-3">
            {PERGUNTAS.map((item) => (
              <details
                key={item.p}
                className="group rounded-lg border border-slate-200 bg-white p-4 open:shadow-sm"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 marker:text-emerald-600">
                  {item.p}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ final -- */}
      <section className="bg-slate-900 px-4 py-12 text-center text-white">
        <h2 className="text-xl font-semibold">Pronto para a próxima carga?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Crie a conta, importe um arquivo da sua fábrica e confira a primeira carga hoje mesmo.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="/registrar"
            className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Começar teste grátis
          </a>
          <a
            href="/entrar"
            className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Entrar no sistema
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-xs">
              {MARCA.assinatura} · Feito no Brasil para operações que não podem parar.
            </p>
          </div>
          <div className="text-xs sm:text-right">
            <p>
              Contato:{' '}
              <a href={`mailto:${MARCA.email}`} className="text-emerald-400 underline">
                {MARCA.email}
              </a>
            </p>
            {MARCA.telefone && <p className="mt-1">Telefone: {MARCA.telefone}</p>}
            <p className="mt-1">
              <a
                href={MARCA.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline"
              >
                {MARCA.site}
              </a>
            </p>
            <p className="mt-2">
              <a href="/entrar" className="hover:text-slate-200">
                Entrar
              </a>{' '}
              ·{' '}
              <a href="/registrar" className="hover:text-slate-200">
                Criar conta
              </a>
            </p>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-[11px] text-slate-600">
          © {ano} {MARCA.produto}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
