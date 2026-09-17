# Google Ads — o que é possível, o que está bloqueado e como publicar

Documento escrito a partir de **testes feitos em 15/09/2026** com o `gcloud` desta
máquina (conta `del.gsantos75@gmail.com`, projeto `sisconf-saas`). Não é opinião:
cada afirmação abaixo tem o resultado do teste junto.

## 1. O que eu já fiz via gcloud

```bash
gcloud services enable googleads.googleapis.com --project=sisconf-saas
# → Operation "operations/acat.p2-...-a80e232e945a" finished successfully
```

A API do Google Ads está **habilitada** no projeto e a versão válida hoje é a **v22**.

## 2. O que está bloqueado (com a evidência)

| Teste | Resultado |
|---|---|
| Escopos do token do gcloud | `email, accounts.reauth, appengine.admin, cloud-platform, compute, drive, sqlservice.login, userinfo.email, openid` — **sem `adwords`** |
| `GET googleads.googleapis.com/v22/customers:listAccessibleCustomers` | `403 PERMISSION_DENIED — "Request had insufficient authentication scopes."` |
| Versões v17–v21 | HTML 404 (não existem mais) |
| Developer token na máquina | não existe (e **não sai do gcloud**) |
| Conta Google Ads | não existe (o `gcloud` **não cria** conta de anúncios) |
| Billing do projeto Cloud | `billingEnabled: false` (isso não bloqueia anunciar; é o billing do projeto, não o da conta de anúncios) |

**O ponto que não tem contorno:** a API do Google Ads **não cria conta de
anúncios**. A criação exige o painel, com CNPJ, endereço e forma de pagamento —
é onde está o dinheiro e a verificação de identidade. `gcloud` é a chave, não a porta.

## 3. Caminho mais curto para a campanha no ar

### Passo A — criar a conta de anúncios (só você, ~15 min)
1. <https://ads.google.com> → criar conta **sem** campanha guiada (pular o assistente).
2. Informar CNPJ, endereço e forma de pagamento (pode entrar em modo de faturamento manual).
3. Anotar o **ID do cliente** no formato `123-456-7890`.

### Passo B — publicar a campanha (2 minutos, com os arquivos prontos)


Este repositório já tem a campanha montada, pronta para importar no **Google Ads
Editor** (programa gratuito do Google, não precisa de API nem developer token):

| Arquivo | Conteúdo |
|---|---|
| `docs/google-ads/1-campanhas.csv` | campanha de Pesquisa, R$ 25/dia, estratégia "Maximizar cliques" |
| `docs/google-ads/2-grupos-de-anuncios.csv` | 3 grupos por tema |
| `docs/google-ads/3-palavras-chave.csv` | 15 palavras em correspondência de frase |
| `docs/google-ads/4-anuncios.csv` | anúncio responsivo (15 títulos + 4 descrições) apontando para `/registrar` |
| `docs/google-ads/5-palavras-negativas.csv` | 22 negativas (curso, emprego, grátis, pdf, …) |

Como importar: Google Ads Editor → **Conta → Importar → De arquivo** → escolher o CSV
(o Editor pede confirmação do mapeamento das colunas; ele mesmo valida os limites de
caracteres). Fazer o upload e revisar.

**Antes de ativar, confira na conta (o Editor não garante esses pontos):**
- **Redes:** desmarcar *Parceiros de pesquisa* e *Rede de Display* (Display queima verba sem intenção).
- **Local:** Brasil · **Idioma:** Português.
- **Limite de CPC:** se usar "Maximizar cliques", colocar teto de CPC (ex.: R$ 4,00).
- **Programação:** horário comercial (o conferente procura o sistema em horário de trabalho).

### Passo C — medir (sem isso, a campanha roda cega)

O Google Ads só sabe contar conversão se o site avisar. Preciso de dois IDs, que
aparecem assim que a conta existir:

1. **GA4** — `G-XXXXXXXXXX` (Administrador → Fluxos de dados → Web).
2. **Conversão do Ads** — `AW-XXXXXXXXX` + o rótulo (`AW-.../abcDEFgh`), criado em
   *Metas → Conversões → Nova ação → Site*, medindo o envio do formulário de cadastro.

Com esses três valores eu ligo o rastreamento no código e passam a funcionar os eventos:
`cadastro_iniciado`, `cadastro_concluido` (a conversão), `login`, `primeira_importacao`
e `primeiro_bipe` — este último é o mais importante, porque cadastro sem uso não é cliente.

### Passo D — automação via gcloud/API (só depois de A e B)

Falta apenas o **developer token**: *Google Ads → Ferramentas → Central de API →
solicitar token de desenvolvedor* (acesso básico costuma sair em 1 a 14 dias) e
autorizar o escopo uma vez nesta máquina:

```bash
gcloud auth login --scopes=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/cloud-platform
```

Com o token aprovado e o ID da conta em mãos, eu crio a campanha inteira por API
(v22) em um comando — com `validateOnly` primeiro, para nada ir para o ar sem revisão.
**Não escrevi esse script ainda de propósito:** sem o token eu não consigo testar, e
entregar código não testado de criação de campanha (que gasta dinheiro real) é pior do
que não entregar. Com o token, escrevo e testo com você olhando.

## 4. Riscos que eu não vou esconder

- **Clique caro em nicho pequeno.** B2B no Brasil custa R$ 5–20 por clique e o volume de
  busca é baixo. R$ 25/dia pode dar 2 a 5 cliques/dia — ou seja, **poucos cadastros**.
  Não espere volume; espere qualidade de intenção.
- **Trial sem cartão + sem onboarding.** O anúncio pode gerar cadastro que morre no dia 1.
  Antes de escalar verba, o **relatório do gestor + onboarding guiado** convertem mais que
  o próprio Ads.
- **Conta nova entra em verificação.** Campanhas de conta recém-criada podem ficar em
  análise por alguns dias, e o Google pode pedir verificação de identidade.
- **Página de destino.** Os anúncios apontam para `/registrar`, que agora tem HTML
  próprio, título e canonical corretos. Termos de Uso e Política de Privacidade estão
  publicados em `/termos` e `/privacidade` (texto-base, **pendente de revisão jurídica**)
  — ausência delas é causa comum de reprovação de anúncio.

## 5. Recomendação de sequência

1. Criar a conta de anúncios (você).
2. Me passar **GA4 + ID de conversão + rótulo** → eu ligo o rastreamento (eu).
3. Importar os CSVs deste repositório e ativar com verba baixa (R$ 20–25/dia).
4. Esperar 7–10 dias **sem mexer** e olhar os *termos de pesquisa* (o que as pessoas
   realmente digitaram) → ajustar negativas e palavras com dado, não com palpite.
5. Só então: página de destino específica por grupo de anúncio, e remarketing.
