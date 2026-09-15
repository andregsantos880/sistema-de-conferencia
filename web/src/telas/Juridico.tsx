import { MARCA } from '../lib/config';

/**
 * Termos de Uso e Política de Privacidade.
 *
 * Por que existem: além da LGPD, o Google Ads reprova anúncio de site sem
 * política de privacidade e termos visíveis. São páginas públicas, indexáveis e
 * com HTML estático próprio (ver scripts/prerender.mjs).
 *
 * IMPORTANTE: é um texto base, escrito em linguagem simples e **pendente de
 * revisão jurídica**. O aviso no fim de cada página diz isso ao leitor.
 */

type Secao = { titulo: string; paragrafos: string[] };

type Documento = {
  chave: 'termos' | 'privacidade';
  titulo: string;
  resumo: string;
  secoes: Secao[];
};

const ATUALIZADO = '15 de setembro de 2026';
const EMAIL = MARCA.email;

export const DOCUMENTOS: Record<'termos' | 'privacidade', Documento> = {
  termos: {
    chave: 'termos',
    titulo: 'Termos de Uso',
    resumo:
      'Regras de uso do SysConf: o que o cliente pode esperar do serviço e o que o serviço espera do cliente.',
    secoes: [
      {
        titulo: '1. O que é o SysConf',
        paragrafos: [
          'O SysConf é um software de conferência de cargas fornecido como serviço (SaaS), acessado pelo navegador. Cada empresa contratante recebe um endereço próprio no formato /sysconf/<empresa>, por onde seus usuários entram com login e senha.',
          'O sistema apoia a conferência de entrada, de saída e de entrega: importa o arquivo enviado pela fábrica, registra a leitura das etiquetas, organiza a carga por box e acompanha o estágio de cada pedido.',
        ],
      },
      {
        titulo: '2. Cadastro e conta',
        paragrafos: [
          'A empresa é responsável pelas informações que informa no cadastro e por manter seus dados corretos.',
          'Os usuários são criados e administrados pela própria empresa, que define quem é administrador e quem é operador. As credenciais são pessoais e não devem ser compartilhadas.',
          'A empresa responde pelas ações realizadas com as credenciais que cadastrou.',
        ],
      },
      {
        titulo: '3. Teste gratuito',
        paragrafos: [
          `O cadastro libera ${30} dias de uso sem custo e sem exigir cartão de crédito. Ao final do período, o valor do serviço é combinado entre as partes antes de qualquer cobrança — não há cobrança automática.`,
          'Se o período de teste terminar sem contratação, os dados da conta podem ser removidos, mediante aviso.',
        ],
      },
      {
        titulo: '4. Uso aceito',
        paragrafos: [
          'A empresa compromete-se a não usar o serviço para finalidade ilícita, a não tentar acessar dados de outras empresas, a não burlar mecanismos de autenticação e a não sobrecarregar deliberadamente a infraestrutura.',
          'É vedada a engenharia reversa do sistema ou a revenda do acesso sem autorização por escrito.',
        ],
      },
      {
        titulo: '5. Dados da operação',
        paragrafos: [
          'Os dados que a empresa importa (pedidos, notas, arquivos da fábrica) pertencem à empresa. O SysConf os trata apenas para prestar o serviço, na condição de operador, conforme a Política de Privacidade.',
          'A empresa é responsável por ter o direito de usar esses dados, inclusive na relação com suas fábricas e seus clientes.',
        ],
      },
      {
        titulo: '6. Disponibilidade e suporte',
        paragrafos: [
          'O serviço é prestado com esforço comercialmente razoável de disponibilidade. Podem ocorrer janelas de manutenção e instabilidades de terceiros (provedores de nuvem e de internet).',
          'Neste momento não há SLA formal de disponibilidade. Se o cliente precisar de garantia contratual, ela pode ser estabelecida em contrato específico.',
        ],
      },
      {
        titulo: '7. Preço e pagamento',
        paragrafos: [
          'Depois do período de teste, o preço, a forma de pagamento e a emissão de nota fiscal são definidos em contrato ou proposta aceita pela empresa.',
          'O desenho comercial combina faixas de volume de uso com quantidade de usuários, definidas no momento da contratação.',
        ],
      },
      {
        titulo: '8. Encerramento',
        paragrafos: [
          'A empresa pode encerrar o uso a qualquer momento, solicitando por e-mail.',
          'Encerrada a conta, a empresa pode solicitar a exportação dos seus dados em formato de arquivo. Depois do prazo combinado, os dados podem ser eliminados.',
          'O SysConf pode suspender o acesso em caso de uso indevido, inadimplência ou exigência legal, sempre que possível com aviso prévio.',
        ],
      },
      {
        titulo: '9. Propriedade intelectual',
        paragrafos: [
          'O software, a marca e a documentação do SysConf pertencem à Softwerd. O uso é concedido por licença, não havendo transferência de titularidade.',
          'Os dados da operação continuam sendo da empresa contratante.',
        ],
      },
      {
        titulo: '10. Limitação de responsabilidade',
        paragrafos: [
          'O SysConf é uma ferramenta de apoio à conferência. A decisão sobre liberar ou retornar uma carga continua sendo da empresa, que responde pela conferência física.',
          'O SysConf não responde por lucros cessantes, perdas indiretas ou por falhas de internet e equipamentos do cliente.',
        ],
      },
      {
        titulo: '11. Lei aplicável e foro',
        paragrafos: [
          'Aplica-se a legislação brasileira.',
          'Fica eleito o foro do domicílio do prestador para resolver controvérsias, salvo disposição diversa em contrato firmado entre as partes.',
        ],
      },
      {
        titulo: '12. Contato',
        paragrafos: [`Dúvidas sobre estes termos: ${EMAIL}.`],
      },
    ],
  },

  privacidade: {
    chave: 'privacidade',
    titulo: 'Política de Privacidade',
    resumo:
      'Quais dados o SysConf trata, para que, com quem compartilha, por quanto tempo e como exercer seus direitos (LGPD).',
    secoes: [
      {
        titulo: '1. Quem trata os dados',
        paragrafos: [
          `O SysConf é operado pela Softwerd. Nesta política, "nós" é o fornecedor do sistema e "empresa" é o cliente contratante que usa o sistema para conferir suas cargas.`,
          `Canal de contato para assuntos de privacidade: ${EMAIL}.`,
        ],
      },
      {
        titulo: '2. Dados que tratamos',
        paragrafos: [
          'Dados da empresa: nome, endereço no sistema (slug), responsável e e-mail de contato informados no cadastro.',
          'Dados de usuários: login, nome e perfil (administrador ou operador). A senha é armazenada com criptografia de mão única (hash bcrypt) e não é legível por nós.',
          'Dados operacionais: os arquivos de fábrica que a empresa importa e os registros de conferência (etiqueta, produto, quantidade, pedido, box, estágio e data).',
          'Dados de acesso: data e hora do login, sessão aberta e informações técnicas da conexão necessárias para segurança e funcionamento.',
          'Dados de uso do site: páginas visitadas e origem do acesso (por exemplo, campanha de anúncio), quando a medição está habilitada.',
        ],
      },
      {
        titulo: '3. Para que usamos',
        paragrafos: [
          'Prestar o serviço: autenticar usuários, importar pedidos, registrar a conferência e mostrar os estágios da carga.',
          'Dar suporte e comunicar o cliente sobre a conta, o teste gratuito e o funcionamento do sistema.',
          'Segurança: prevenir acesso indevido, fraude e abuso.',
          'Medir e melhorar: entender quantas pessoas visitam o site, de onde vêm e quantas criam conta, para melhorar o produto e a divulgação.',
        ],
      },
      {
        titulo: '4. Base legal',
        paragrafos: [
          'Execução de contrato: para os dados necessários a prestar o serviço contratado.',
          'Cumprimento de obrigação legal ou regulatória, quando aplicável.',
          'Legítimo interesse: para segurança, prevenção a fraude e melhoria do serviço, sempre respeitando os direitos do titular.',
          'Consentimento: quando solicitado, por exemplo para comunicações de marketing, podendo ser revogado a qualquer momento.',
        ],
      },
      {
        titulo: '5. Compartilhamento',
        paragrafos: [
          'Não vendemos dados pessoais.',
          'Compartilhamos apenas com fornecedores de infraestrutura que operam o serviço em nosso nome, como os provedores de banco de dados, hospedagem e ferramentas de medição.',
          'Podemos compartilhar dados por determinação legal, ordem judicial ou requisição de autoridade competente.',
        ],
      },
      {
        titulo: '6. Onde os dados ficam',
        paragrafos: [
          'Os dados são hospedados em provedores de nuvem contratados pela Softwerd. Esses provedores podem manter servidores fora do Brasil, o que caracteriza transferência internacional de dados.',
          'Adotamos as salvaguardas contratuais oferecidas por esses provedores para esse tipo de transferência.',
        ],
      },
      {
        titulo: '7. Por quanto tempo guardamos',
        paragrafos: [
          'Dados de cadastro e operação: enquanto a conta da empresa existir.',
          'Sessões de acesso: as sessões do sistema expiram em poucas horas e não são usadas para outra finalidade.',
          'Após o encerramento da conta: os dados podem ser eliminados depois do prazo combinado para exportação, salvo quando a lei exigir guarda por prazo maior.',
        ],
      },
      {
        titulo: '8. Seus direitos (LGPD)',
        paragrafos: [
          'Você pode solicitar: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento e revogação do consentimento.',
          `Para exercer qualquer um desses direitos, escreva para ${EMAIL}. Respondemos no prazo legal.`,
          'Quando o pedido envolver dados de uma empresa cliente, encaminhamos a solicitação a ela, que é a controladora desses dados.',
        ],
      },
      {
        titulo: '9. Segurança',
        paragrafos: [
          'As senhas são guardadas com hash bcrypt, e não em texto legível.',
          'O acesso aos dados é feito por sessão autenticada e as consultas do sistema são isoladas por empresa no servidor: um usuário não consegue ler nem alterar dados de outra empresa.',
          'O sistema separa perfis: o operador vê apenas o necessário para conferir a carga.',
          'Nenhum sistema é infalível. Se ocorrer um incidente de segurança relevante, comunicamos os titulares e a autoridade conforme a LGPD.',
        ],
      },
      {
        titulo: '10. Cookies e medição',
        paragrafos: [
          'Usamos o armazenamento do próprio navegador para manter a sessão de quem já entrou e para lembrar o último login.',
          'Quando a medição está habilitada, usamos ferramentas do Google (Analytics e Ads) para contar visitas, identificar a origem do acesso e medir quantas visitas resultam em cadastro.',
        ],
      },
      {
        titulo: '11. Menores de idade',
        paragrafos: [
          'O sistema é uma ferramenta de trabalho e não se destina a menores de 18 anos. Não coletamos dados de menores intencionalmente.',
        ],
      },
      {
        titulo: '12. Alterações',
        paragrafos: [
          `Esta política pode ser atualizada. A data da última atualização aparece no fim da página. Mudanças relevantes são comunicadas aos clientes por e-mail.`,
        ],
      },
    ],
  },
};

export default function Juridico({ documento }: { documento: 'termos' | 'privacidade' }) {
  const doc = DOCUMENTOS[documento];

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-slate-200 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-base font-semibold tracking-wide text-white">{MARCA.produto}</span>
          </a>
          <a href="/" className="text-xs text-slate-300 hover:text-white">
            ← Voltar ao site
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">{doc.titulo}</h1>
        <p className="mt-2 text-sm text-slate-600">{doc.resumo}</p>

        <nav className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
          <span className="font-semibold text-slate-700">Outros documentos: </span>
          <a href="/termos" className="text-emerald-700 underline">
            Termos de Uso
          </a>
          <span className="text-slate-400"> · </span>
          <a href="/privacidade" className="text-emerald-700 underline">
            Política de Privacidade
          </a>
        </nav>

        <div className="mt-8 space-y-7">
          {doc.secoes.map((secao) => (
            <section key={secao.titulo}>
              <h2 className="text-sm font-semibold text-slate-900">{secao.titulo}</h2>
              {secao.paragrafos.map((paragrafo) => (
                <p key={paragrafo.slice(0, 40)} className="mt-2 text-sm leading-relaxed text-slate-600">
                  {paragrafo}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p>Última atualização: {ATUALIZADO}.</p>
          <p className="mt-1">
            Contato: <a href={`mailto:${EMAIL}`} className="text-emerald-700 underline">{EMAIL}</a>
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Texto-base em revisão. Se houver contrato assinado entre as partes, o contrato prevalece sobre
            esta página.
          </p>
        </footer>
      </main>
    </div>
  );
}
