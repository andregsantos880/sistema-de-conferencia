import type { Empresa } from '../lib/api';

type Props = {
  empresa: Empresa;
  onVoltar: () => void;
};

type Secao = {
  id: string;
  titulo: string;
  resumo?: string;
  passos?: string[];
  dicas?: string[];
  imagem?: { arquivo: string; legenda: string };
  somenteAdmin?: boolean;
};

/**
 * MANUAL DO SISTEMA (dentro do próprio SysConf, para o administrador).
 *
 * As telas das imagens foram capturadas na empresa de demonstração
 * ("homologacao"), com dados fictícios — assim o manual não expõe dados de
 * nenhum cliente. O administrador pode imprimir/salvar em PDF (botão Imprimir)
 * e entregar as páginas aos operadores.
 */
const SECOES: Secao[] = [
  {
    id: 'visao',
    titulo: '1. O que o sistema faz',
    resumo:
      'O SysConf controla a conferência das peças que chegam das fábricas de móveis. O arquivo da fábrica é importado, o operador bipa a etiqueta de cada peça nos estágios da empresa (por padrão CONFERÊNCIA, SAÍDA e ENTREGA) e o sistema mostra onde a peça deve ser colocada.',
    passos: [
      'Importar o arquivo da fábrica (txt/csv) — o sistema lê o layout daquela fábrica.',
      'Bipar as etiquetas: cada leitura com sucesso é gravada na hora.',
      'O painel mostra o LOCAL onde a peça deve ficar, a peça, a quantidade e o pedido.',
      'O administrador acompanha tudo pela tela de Logs e ajusta os locais das peças.',
    ],
    dicas: [
      'Em qualquer lista do sistema (conferência, logs, importações, locais, usuários) clique no TÍTULO da coluna para ordenar: ▲ do menor para o maior, ▼ do maior para o menor. Um terceiro clique tira a ordenação.',
      'A empresa pode trabalhar de 1 a 9 estágios, com os nomes e as cores que quiser (seção 13).',
    ],
  },
  {
    id: 'entrar',
    titulo: '2. Entrar no sistema',
    resumo:
      'O endereço identifica a empresa: /sysconf/<empresa>. Cada usuário entra com o seu login e senha.',
    passos: [
      'Abra o endereço da sua empresa (ex.: sysconf-web.web.app/sysconf/suaempresa).',
      'Informe usuário e senha e clique em Confirmar.',
      'Ao lado de “Memorizar senha” há um interruptor: ligado, o navegador guarda o seu acesso neste computador (a senha não é gravada).',
    ],
    dicas: [
      'No alto da tela aparecem, da esquerda para a direita: o ícone e o nome SysConf, a empresa, a fábrica escolhida, o usuário logado e o perfil.',
      'Perfil ADMINISTRADOR: tudo. Perfil OPERADOR: conferência e importação (sem telas de cadastro, sem logs).',
      'A sessão dura 12 horas; passando disso o sistema pede login de novo.',
    ],
    imagem: { arquivo: '/manual/01-login.png', legenda: 'Tela de login' },
  },
  {
    id: 'conferencia',
    titulo: '3. Tela de conferência (o dia a dia)',
    resumo:
      'É a tela principal. No topo ficam as ações, os contadores por situação e o grid com as peças da carga escolhida.',
    passos: [
      'Escolha a FÁBRICA no combo (as que têm integração aparecem com ★, no topo).',
      'No seletor Estágio escolha onde você vai bipar agora e clique em Conferir: o painel de bipagem abre embaixo.',
      'Os contadores mostram quantas peças estão em cada situação (Normal e um por estágio) e o Total.',
      'As linhas vêm coloridas pela situação, com a cor cadastrada para cada estágio.',
      'A coluna LOCAL mostra onde a peça deve ficar no estágio escolhido em “Local em”.',
      'Para ordenar, clique no título de uma coluna: ▲ menor → maior, ▼ maior → menor, terceiro clique volta ao normal.',
      'Importar (abre a importação), Conferir (abre o painel de bipagem), Exportar CSV (baixa o grid em planilha).',
    ],
    imagem: { arquivo: '/manual/02-conferencia-grid.png', legenda: 'Grid da conferência, com a coluna LOCAL' },
  },
  {
    id: 'filtros',
    titulo: '4. Filtrar e achar uma peça no grid',
    resumo:
      'A barra de filtros trabalha sobre a carga que está na tela e responde na hora, sem recarregar nada.',
    passos: [
      'Texto livre: procura por etiqueta, peça, ORD.COMPRA ou cliente.',
      'Situação: clique para abrir a lista e marque uma ou várias situações (NORMAL, CONFERÊNCIA, SAÍDA...). O número ao lado mostra quantas peças há em cada uma; os atalhos “Todos” e “Nenhum” marcam ou limpam tudo de uma vez.',
      'Cliente: mostra as peças de uma loja por vez.',
      'Local em + o combo ao lado: mostra só as peças que vão para aquele lugar naquele estágio; marque “sem local” para ver as que ainda não têm lugar definido.',
      'Entrada: hoje, últimos 7 ou últimos 30 dias.',
      'O botão “Limpar filtros (n)” mostra quantos filtros estão ativos e devolve o grid completo com um clique.',
    ],
    dicas: [
      'Os contadores do topo também filtram: clique em “CONFERÊNCIA: 7” para mostrar só aquelas peças (aparece um contorno escuro no que está ativo).',
      'Nenhum filtro interfere na bipagem: o leitor continua encontrando a peça mesmo que ela não esteja aparecendo no grid.',
    ],
    imagem: { arquivo: '/manual/16-filtros.png', legenda: 'Filtros da tela principal: situação, cliente, local e entrada' },
  },
  {
    id: 'bipagem',
    titulo: '5. Bipar as etiquetas',
    resumo:
      'Escolha o estágio no seletor do topo, clique em Conferir e passe o leitor de código de barras. Cada bipagem com sucesso é gravada no banco na hora — não existe baixa sem bipar a peça.',
    passos: [
      'A etiqueta anda UM estágio por vez: para entrar em CONFERÊNCIA ela precisa estar NORMAL.',
      'Sucesso: o painel mostra o LOCAL onde colocar a peça, a peça, a quantidade e o pedido — e a peça avança de estágio.',
      'A peça que já passou daquele estágio é recusada (“Etiqueta já lida!” ou “Esta etiqueta está para SAÍDA”).',
      'A peça que ainda não chegou ao estágio anterior avisa “Não pode pular estágio — a etiqueta está em NORMAL”.',
      'Etiqueta que não existe na carga avisa “Etiqueta não encontrada!”.',
      'Com “anunciar local (voz)” marcado, o sistema fala o local em voz alta.',
      'Tecla Esc fecha o painel.',
    ],
    dicas: [
      'Toda leitura errada também fica registrada em Logs — inclusive o código que não foi encontrado.',
      'Se a peça ainda não tiver local definido, o painel avisa “SEM LOCAL DEFINIDO” (a conferência não é bloqueada).',
    ],
    imagem: { arquivo: '/manual/03-painel-bipagem.png', legenda: 'Painel de bipagem: LOCAL, peça, quantidade e pedido' },
  },
  {
    id: 'menu',
    titulo: '6. Alterar a situação pelo menu (com o botão direito)',
    resumo:
      'Para corrigir uma peça sem bipar: clique na linha (Ctrl+clique para marcar várias) e use o botão direito → Alterar para Normal ou para o estágio desejado.',
    dicas: ['Esta alteração em massa também entra no log de conferência.'],
    imagem: { arquivo: '/manual/11-menu-contexto.png', legenda: 'Menu de contexto do grid' },
  },
  {
    id: 'busca',
    titulo: '7. Buscar uma carga no grid',
    resumo:
      'No combo “Buscar em” escolha ORD.COMPRA, PEDIDO ou CARGA, clique em Buscar, marque os valores e clique em “Incluir lojas selecionadas”. O grid passa a mostrar só o que foi marcado.',
    imagem: { arquivo: '/manual/12-busca.png', legenda: 'Busca por ORD.COMPRA / PEDIDO / CARGA' },
  },
  {
    id: 'menu-topo',
    titulo: '8. Menu ☰ — as outras telas',
    resumo:
      'O botão ☰ Menu, no alto à direita, abre as demais telas do sistema. Ele só aparece para o administrador; o operador trabalha apenas com a conferência e a importação.',
    passos: [
      'CADASTROS: Fábricas e layout, Estágios da conferência, Locais, Locais das peças e Usuários.',
      'OPERAÇÃO: Arquivos importados e Logs de conferência.',
      'AJUDA: este Manual do sistema.',
      'O menu fecha ao clicar fora dele ou ao escolher uma tela.',
    ],
    dicas: [
      'Cada tela tem o seu botão Voltar, que devolve para a conferência.',
      'O usuário logado e o perfil (Administrador ou Operador) aparecem ao lado do menu.',
    ],
    imagem: { arquivo: '/manual/15-menu.png', legenda: 'Menu do topo, separado em Cadastros, Operação e Ajuda' },
    somenteAdmin: true,
  },
  {
    id: 'importacao',
    titulo: '9. Importar o arquivo da fábrica',
    resumo:
      'É por aqui que a carga entra no sistema. A leitura do arquivo respeita o layout configurado para a fábrica (separador, colunas ou largura fixa) e detecta a acentuação automaticamente.',
    passos: [
      'Escolha a FÁBRICA e clique em Arquivo..., selecionando o txt/csv recebido.',
      'O sistema mostra quantas linhas leu e descartou, e lista os PEDIDOS agrupados pela ORD.COMPRA (a ordem de compra inteira é o agrupamento, não o cliente).',
      'Desmarque os pedidos que NÃO devem entrar.',
      'Clique em “Incluir lojas selecionadas”. As peças entram na situação NORMAL, prontas para a conferência.',
    ],
    dicas: [
      'A importação NÃO define o local das peças — isso é feito depois, na tela “Locais das peças” (seção 12), inclusive em massa por ORD.COMPRA.',
      'Cada importação fica registrada (arquivo, quem importou, linhas) na tela Importações.',
    ],
    imagem: { arquivo: '/manual/04-importacao-grupos.png', legenda: 'Importação: pedidos por ORD.COMPRA, para marcar o que entra' },
  },
  {
    id: 'importacoes',
    titulo: '10. Arquivos importados',
    resumo:
      'Histórico de tudo que foi importado: data, fábrica, arquivo, codificação, linhas importadas/descartadas, pedidos na base e quem importou.',
    passos: [
      'Baixar: devolve o arquivo original que foi importado.',
      'Excluir (somente administrador): apaga a importação e TODOS os pedidos que vieram dela.',
      'Clique na linha para ver o detalhe no rodapé.',
    ],
    imagem: { arquivo: '/manual/05-importacoes.png', legenda: 'Arquivos importados' },
    somenteAdmin: true,
  },
  {
    id: 'locais',
    titulo: '11. Cadastrar os locais',
    resumo:
      'Local é o lugar físico onde a peça deve ficar: “Box 01”, “Prateleira superior”, “Piso”, “Pallet 3”. Basta o nome.',
    passos: [
      'Digite o nome e clique em Incluir.',
      'Renomear / Desativar quando o local sair de uso.',
      'A coluna “Peças usando” mostra quantas peças estão definidas naquele local.',
      'Um local em uso não pode ser excluído — desative-o (ele sai dos combos, mas o histórico continua legível).',
    ],
    imagem: { arquivo: '/manual/08-locais.png', legenda: 'Cadastro de locais' },
    somenteAdmin: true,
  },
  {
    id: 'locais-pecas',
    titulo: '12. Definir o local das peças',
    resumo:
      'É aqui que se define onde cada peça deve ficar. Como o local depende do momento da operação (a peça muda de lugar conforme avança), cada peça tem um local por estágio.',
    passos: [
      'Escolha a FÁBRICA e filtre: ORD.COMPRA, cliente, etiqueta, situação da peça ou “Falta local em <estágio>”.',
      'Confira na grade o local de cada estágio (as células em amarelo estão sem local).',
      'Marque as peças (a primeira coluna) ou deixe o filtro do jeito que está para aplicar em todas.',
      'Escolha o ESTÁGIO e o LOCAL e clique em Aplicar.',
      'Marque “somente as que estão sem local nesse estágio” para não mexer no que já está definido.',
    ],
    dicas: [
      'A mesma peça pode ficar no “Box 01” na conferência e no “Piso” na entrega — um local para cada estágio.',
      'A alteração de local não entra no log de conferência.',
    ],
    imagem: { arquivo: '/manual/09-locais-pecas.png', legenda: 'Locais das peças: filtros e aplicação em massa' },
    somenteAdmin: true,
  },
  {
    id: 'estagios',
    titulo: '13. Estágios da conferência',
    resumo:
      'Os estágios são as etapas por onde a peça passa: por padrão CONFERÊNCIA, SAÍDA e ENTREGA. A empresa pode renomear, trocar a cor e acrescentar etapas (de 1 a 9), usando os nomes da sua operação: RECEBIMENTO, SEPARAÇÃO, EXPEDIÇÃO...',
    passos: [
      'Novo estágio: escreva o nome, escolha a cor e clique em “Incluir no fim do fluxo”. O estágio novo entra sempre no FIM da sequência.',
      'Renomear: troca o nome e a cor (a cor é a das linhas do grid). Renomear pode a qualquer momento.',
      'Desativar / Ativar: o estágio desativado sai dos seletores e dos contadores, mas o histórico continua legível.',
      'Excluir: apaga o estágio de vez.',
      'A coluna “Peças paradas” mostra quantas peças estão naquele estágio neste momento.',
    ],
    dicas: [
      'Só o ÚLTIMO estágio da sequência pode ser desativado ou excluído — senão o fluxo ficaria com um buraco no meio.',
      'Não é possível excluir um estágio que tenha peça parada nele ou local definido nele.',
      'A regra da bipagem não muda: a peça anda um estágio por vez, sem pular e sem voltar.',
    ],
    imagem: { arquivo: '/manual/14-estagios.png', legenda: 'Cadastro dos estágios, com cor e peças paradas em cada um' },
    somenteAdmin: true,
  },
  {
    id: 'fabricas',
    titulo: '14. Fábricas e layout do arquivo',
    resumo:
      'Cada fábrica tem o seu formato de arquivo. Aqui se cadastra a fábrica e se ensina o sistema a ler o arquivo dela (assistente passo a passo: escolher um arquivo de exemplo, conferir o que foi detectado e ajustar o de-para das colunas).',
    dicas: [
      'Fábricas com integração pronta aparecem com ★ no combo da conferência.',
      'Sem layout configurado o sistema ainda tenta ler o arquivo pelo cabeçalho/pelo separador, mas o layout configurado é sempre mais seguro.',
    ],
    imagem: { arquivo: '/manual/07-fabricas.png', legenda: 'Cadastro de fábricas' },
    somenteAdmin: true,
  },
  {
    id: 'usuarios',
    titulo: '15. Usuários e perfis',
    resumo: 'Cada empresa cadastra os seus usuários e define quem é administrador e quem é operador.',
    passos: [
      'Incluir usuário: login, nome, senha e perfil.',
      'Editar: troca nome, senha e perfil. Inativar: o usuário deixa de entrar, sem perder o histórico.',
      'Você não pode inativar/excluir o seu próprio usuário.',
    ],
    imagem: { arquivo: '/manual/10-usuarios.png', legenda: 'Usuários da empresa' },
    somenteAdmin: true,
  },
  {
    id: 'logs',
    titulo: '16. Logs de conferência (auditoria)',
    resumo:
      'Registro de cada leitura feita pelos operadores, em cada estágio: o que deu certo e o que deu errado (etiqueta já lida, fora de ordem, não encontrada) e também as alterações em massa.',
    passos: [
      'Filtre por período, fábrica, usuário, desfecho, pedido (ORD.COMPRA) ou texto.',
      'Clique no título de uma coluna para ordenar (ex.: “Desfecho” para juntar as não encontradas).',
      'Clique na linha para ver o detalhe (peça, cliente, box, horário exato).',
      'Exportar CSV gera a planilha do resultado filtrado.',
      'Retenção: quantos dias de log guardar (0 = guardar para sempre). A limpeza roda toda vez que a tela é aberta.',
    ],
    dicas: ['Use “Desfecho = Não encontrada” para descobrir etiquetas que os operadores não conseguiram ler.'],
    imagem: { arquivo: '/manual/06-logs.png', legenda: 'Logs de conferência' },
    somenteAdmin: true,
  },
  {
    id: 'site',
    titulo: '17. Site público e teste grátis',
    resumo:
      'O site apresenta o sistema e permite criar uma empresa para testar (30 dias). Quem se cadastra recebe as fábricas do catálogo e entra como administrador.',
    imagem: { arquivo: '/manual/13-site.png', legenda: 'Página inicial do site' },
  },
  {
    id: 'faq',
    titulo: '18. Perguntas frequentes',
    passos: [
      'A etiqueta não é aceita e diz “está para SAÍDA”: a peça já passou daquele estágio — estágio errado ou peça repetida.',
      'A etiqueta não é aceita e diz “Não pode pular estágio”: falta passar pelo estágio anterior (a peça precisa estar no estágio imediatamente anterior).',
      'O painel mostrou “SEM LOCAL DEFINIDO”: falta definir o local daquele estágio em “Locais das peças”.',
      'Criei um estágio por engano e não consigo excluir: só o último estágio da sequência pode ser excluído, e ele não pode ter peça parada nem local definido. Se não for o último, desative-o — ele sai dos seletores.',
      'As cores do grid mudaram: cada estágio usa a cor cadastrada em “Estágios da conferência”.',
      'Importei o arquivo errado: em Importações, exclua a importação (os pedidos dela saem da base).',
      'O operador não vê as telas de cadastro: elas são exclusivas do administrador.',
      'Preciso imprimir este manual: clique em Imprimir aqui em cima (ou Ctrl+P) e escolha “Salvar como PDF”.',
    ],
  },
];

export default function Ajuda({ empresa, onVoltar }: Props) {
  return (
    <div className="min-h-screen bg-slate-200 p-3">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-slate-300 bg-white px-4 py-2 print:hidden">
          <h1 className="text-sm font-semibold text-slate-700">
            Manual do SysConf
            <span className="ml-2 text-[11px] font-normal text-slate-500">
              {empresa.nome} — {SECOES.length} seções
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            >
              Imprimir / salvar PDF
            </button>
            <button
              onClick={onVoltar}
              className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="mb-3 rounded border border-slate-300 bg-white px-4 py-3 print:hidden">
          <p className="mb-2 text-xs font-semibold text-slate-600">Índice</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-700 md:grid-cols-3">
            {SECOES.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`} className="hover:underline">
                  {secao.titulo}
                  {secao.somenteAdmin ? ' (admin)' : ''}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <article className="rounded border border-slate-300 bg-white px-6 py-5 text-sm leading-relaxed text-slate-700">
          <h2 className="mb-1 text-lg font-bold text-slate-800">Manual do SysConf</h2>
          <p className="mb-4 text-xs text-slate-500">
            Conferência de pedidos e cargas de móveis planejados. As telas deste manual foram capturadas na
            empresa de demonstração, com dados fictícios.
          </p>

          {SECOES.map((secao) => (
            <section key={secao.id} id={secao.id} className="mt-6 break-inside-avoid">
              <h3 className="border-b border-slate-200 pb-1 text-base font-semibold text-slate-800">
                {secao.titulo}
                {secao.somenteAdmin && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    ADMINISTRADOR
                  </span>
                )}
              </h3>

              {secao.resumo && <p className="mt-2">{secao.resumo}</p>}

              {secao.passos && (
                <ol className="mt-2 list-decimal space-y-1 pl-6">
                  {secao.passos.map((passo) => (
                    <li key={passo}>{passo}</li>
                  ))}
                </ol>
              )}

              {secao.dicas && (
                <ul className="mt-2 space-y-1 rounded border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                  {secao.dicas.map((dica) => (
                    <li key={dica}>
                      <strong>Dica:</strong> {dica}
                    </li>
                  ))}
                </ul>
              )}

              {secao.imagem && (
                <figure className="mt-3">
                  <img
                    src={secao.imagem.arquivo}
                    alt={secao.imagem.legenda}
                    className="w-full rounded border border-slate-300"
                    loading="lazy"
                  />
                  <figcaption className="mt-1 text-center text-[11px] text-slate-500">
                    {secao.imagem.legenda}
                  </figcaption>
                </figure>
              )}
            </section>
          ))}
        </article>

        <p className="mt-3 rounded border border-slate-300 bg-white px-4 py-2 text-[11px] text-slate-500">
          SysConf — manual de uso. Em caso de dúvida, fale com o suporte da Softwerd.
        </p>
      </div>
    </div>
  );
}
