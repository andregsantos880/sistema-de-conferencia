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
      'O SysConf controla a conferência das peças que chegam das fábricas de móveis. O arquivo da fábrica é importado, o operador bipa a etiqueta de cada peça nos três estágios (CONFERÊNCIA, SAÍDA e ENTREGA) e o sistema mostra onde a peça deve ser colocada.',
    passos: [
      'Importar o arquivo da fábrica (txt/csv) — o sistema lê o layout daquela fábrica.',
      'Bipar as etiquetas: cada leitura com sucesso é gravada na hora.',
      'O painel mostra o LOCAL onde a peça deve ficar, a peça, a quantidade e o pedido.',
      'O administrador acompanha tudo pela tela de Logs e ajusta os locais das peças.',
    ],
    dicas: [
      'Em qualquer lista do sistema (conferência, logs, importações, locais, usuários) clique no TÍTULO da coluna para ordenar: ▲ do menor para o maior, ▼ do maior para o menor. Um terceiro clique tira a ordenação.',
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
      'Marque “Memorizar senha” se quiser que o navegador guarde o acesso neste computador.',
    ],
    dicas: [
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
      'Os contadores mostram Normal, Conferido, Saída, Entrega e o Total.',
      'As linhas vêm coloridas pela situação: branco = normal, verde = conferido, vermelho = saída, azul = entrega.',
      'A coluna LOCAL mostra onde a peça deve ficar no próximo passo (ou no estágio em que você está bipando).',
      'Para ordenar, clique no título de uma coluna: ▲ menor → maior, ▼ maior → menor, terceiro clique volta ao normal.',
      'Importar (abre a importação), Conferência / Saída / Entrega (abrem o painel de bipagem), Exportar CSV (baixa o grid em planilha).',
    ],
    imagem: { arquivo: '/manual/02-conferencia-grid.png', legenda: 'Grid da conferência, com a coluna LOCAL' },
  },
  {
    id: 'bipagem',
    titulo: '4. Bipar as etiquetas',
    resumo:
      'Clique em Conferência (entrada), Saída (expedição) ou Entrega e passe o leitor de código de barras. Cada bipagem com sucesso é gravada no banco na hora — não existe baixa sem bipar a peça.',
    passos: [
      'A etiqueta só avança UM passo: para entrar em CONFERÊNCIA ela precisa estar NORMAL.',
      'Sucesso: o painel mostra o LOCAL onde colocar a peça, a peça, a quantidade e o pedido — e a peça é marcada como conferida.',
      'A peça que já passou daquele estágio é recusada (“Etiqueta já lida!” ou “Esta etiqueta está para SAÍDA”).',
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
    titulo: '5. Alterar a situação pelo menu (com o botão direito)',
    resumo:
      'Para corrigir uma peça sem bipar: clique na linha (Ctrl+clique para marcar várias) e use o botão direito → Alterar para Normal / Conferência / Saída.',
    dicas: ['Esta alteração em massa também entra no log de conferência.'],
    imagem: { arquivo: '/manual/11-menu-contexto.png', legenda: 'Menu de contexto do grid' },
  },
  {
    id: 'busca',
    titulo: '6. Buscar uma carga no grid',
    resumo:
      'No combo “Buscar em” escolha ORD.COMPRA, PEDIDO ou CARGA, clique em Buscar, marque os valores e clique em “Incluir lojas selecionadas”. O grid passa a mostrar só o que foi marcado.',
    imagem: { arquivo: '/manual/12-busca.png', legenda: 'Busca por ORD.COMPRA / PEDIDO / CARGA' },
  },
  {
    id: 'importacao',
    titulo: '7. Importar o arquivo da fábrica',
    resumo:
      'É por aqui que a carga entra no sistema. A leitura do arquivo respeita o layout configurado para a fábrica (separador, colunas ou largura fixa) e detecta a acentuação automaticamente.',
    passos: [
      'Escolha a FÁBRICA e clique em Arquivo..., selecionando o txt/csv recebido.',
      'O sistema mostra quantas linhas leu e descartou, e lista os PEDIDOS (agrupados pela ORD.COMPRA).',
      'Desmarque os pedidos que NÃO devem entrar.',
      'Para cada pedido, escolha o LOCAL de cada estágio (CONFERÊNCIA, SAÍDA e ENTREGA). Os combos já vêm preenchidos quando aquele pedido já tem local definido. O botão Aplicar repete o mesmo local em todos os pedidos marcados.',
      'Clique em “Incluir lojas selecionadas”. As peças entram já com os locais escolhidos.',
    ],
    dicas: [
      'Peça sem local definido entra mesmo assim e pode ser ajustada depois em “Locais das peças”.',
      'Cada importação fica registrada (arquivo, quem importou, linhas) na tela Importações.',
    ],
    imagem: { arquivo: '/manual/04-importacao-grupos.png', legenda: 'Importação: pedidos por ORD.COMPRA e o local de cada estágio' },
  },
  {
    id: 'importacoes',
    titulo: '8. Arquivos importados',
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
    titulo: '9. Cadastrar os locais',
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
    titulo: '10. Definir o local das peças (depois da importação)',
    resumo:
      'Quando a operação muda (trocar de box, reorganizar o piso) o administrador ajusta o local das peças já carregadas, em massa.',
    passos: [
      'Escolha a FÁBRICA e filtre: ORD.COMPRA, cliente, etiqueta, situação da peça ou “Falta local em CONFERÊNCIA/SAÍDA/ENTREGA”.',
      'Confira na grade os três locais de cada peça (as células em amarelo estão sem local).',
      'Escolha o ESTÁGIO e o LOCAL e clique em Aplicar.',
      'Marque “somente as que estão sem local nesse estágio” para não mexer no que já está definido.',
    ],
    dicas: ['A alteração de local não entra no log de conferência.'],
    imagem: { arquivo: '/manual/09-locais-pecas.png', legenda: 'Locais das peças: filtros e aplicação em massa' },
    somenteAdmin: true,
  },
  {
    id: 'fabricas',
    titulo: '11. Fábricas e layout do arquivo',
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
    titulo: '12. Usuários e perfis',
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
    titulo: '13. Logs de conferência (auditoria)',
    resumo:
      'Registro de cada leitura feita pelos operadores, nos três estágios: o que deu certo e o que deu errado (etiqueta já lida, fora de ordem, não encontrada) e também as alterações em massa.',
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
    titulo: '14. Site público e teste grátis',
    resumo:
      'O site apresenta o sistema e permite criar uma empresa para testar (30 dias). Quem se cadastra recebe as fábricas do catálogo e entra como administrador.',
    imagem: { arquivo: '/manual/13-site.png', legenda: 'Página inicial do site' },
  },
  {
    id: 'faq',
    titulo: '15. Perguntas frequentes',
    passos: [
      'A etiqueta não é aceita e diz “está para SAÍDA”: a peça já passou daquele estágio — estágio errado ou peça repetida.',
      'O painel mostrou “SEM LOCAL DEFINIDO”: falta cadastrar/escolher o local daquele estágio em “Locais das peças”.',
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
