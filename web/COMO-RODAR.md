# SysConf Web

Recriação web das telas do SysConf WinForms, usando o template Vite + React + TypeScript
com Tailwind CSS v4, consumindo o Supabase (PostgREST) no schema legado.

## Como rodar

```bash
cd web
npm install          # só na primeira vez
npm run dev          # http://localhost:5173
npm run build        # gera dist/ (tsc -b && vite build)
npm run preview      # serve o build de produção
```

## Configuração (.env)

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co/rest/v1/
VITE_SUPABASE_KEY=<chave publishable/anon>
```

Use `.env.example` como modelo. **A chave vai para o navegador** — ver "Segurança".

## Telas (equivalência com o WinForms)

| Tela web | WinForms | O que faz |
|---|---|---|
| `telas/Login.tsx` | `FormLogin` | usuário em MAIÚSCULAS (max 30), senha (max 15), "Memorizar senha", Confirmar/Cancelar, rodapé softwerd |
| `telas/Conferencia.tsx` | `Form1` | barra de ações (Importar/Conferência/Saída/Exportar), combo de fábrica, busca por ORD.COMPRA/PEDIDO/ARQUIVO, contadores por status, grid colorido por status, menu de contexto (Alterar para Normal/Conferência/Saída), painel de conferência com BOX gigante + leitura de etiqueta |
| `telas/Importacao.tsx` | `TabeLayo` | combo de fábrica, botão "Arquivo...", barra de progresso, lista de lojas com checkbox e "Incluir lojas selecionadas." |

Regras preservadas do legado: status `0=Normal 1=Conferido 2=Saída 3=Entrega`, cores por status
(branco / LightGreen / LightCoral / azul), `STATUS=0` e `IDBOX=1` na importação, `CLIENTE` vazio →
`NÃO INFORMADO`, sons de acerto/erro (sintetizados na Web Audio API no lugar dos `.wav`).

## Estrutura

```
src/
  Sysconf.tsx          raiz: sessão, navegação e fábrica ativa (compartilhada entre as telas)
  estilos.css          Tailwind + cores/classes do legado
  lib/config.ts        env + rótulos/cores/colunas
  lib/api.ts           acesso ao Supabase (equivalente ao ApiExtensions.cs)
  lib/parsers.ts       leitura dos arquivos de layout
  lib/audio.ts         sons
  telas/*.tsx          Login, Conferencia, Importacao
exemplo/pedidos-teste.csv   arquivo de exemplo (separador `;`, com cabeçalho)
```

## Diferenças de implementação em relação ao WinForms

- **Sem tradução de SQL**: as consultas usam o Data API do PostgREST (`select=`, `col=eq.valor`).
  As agregações com `+`, `CAST` e `GROUP BY` do `Form1.cs` vão pelo RPC `exec_sql`.
- **Login por RPC**: `POST /rest/v1/rpc/login_usuario` (migration `20260914000005`), então a senha
  não aparece na URL e a coluna `usuario.senha` não é enviada ao navegador.
- **Paginação**: o PostgREST devolve no máximo 1000 linhas por requisição; `listarPedidos` pagina
  com o header `Range` até acabar.

## Regras de negócio herdadas do legado (`App/Form1.cs`)

Implementadas em `src/lib/regrasConferencia.ts` (módulo puro, sem I/O) e usadas por
`telas/Conferencia.tsx`:

- **Alvo da conferência**: `1` = CONFERÊNCIA (entrada), `2` = SAÍDA, `3` = ENTREGA. O botão escolhe o
  alvo e abre o painel de conferência.
- **A etiqueta só avança um passo**: precisa estar em `alvo - 1`. Não existe baixa sem bipar a peça
  (objetivo do sistema: evitar esquecimento no transporte).
- **Desfechos da bipagem** (sons equivalentes ao `Util.GetSom`):

  | Situação da linha | Mensagem | Som |
  |---|---|---|
  | já está no alvo | `Etiqueta já lida !` | Exclamation |
  | está em `alvo - 1` | grava e avança para o alvo | success (Air_Horn quando conclui) |
  | está em outro status | `Esta etiqueta está para <DsStatus>` | ringout |
  | não encontrada | `Etiqueta não encontrada !` | Error |

- **Gravação a cada bipagem com sucesso** — `UPDATE pedido SET status = <alvo> WHERE id = <id>`
  na hora (decisão do cliente; o legado só gravava ao clicar Fechar).
- **No sucesso o painel mostra o resultado da bipagem**: **box de destino** (tabela `box`, via
  `pedido.idbox`), **peça** (produto · descrição), **quantidade** e **pedido** (ord. compra), com
  anúncio do box por voz — o checkbox "anunciar box (voz)" desliga o áudio.
- **Restante**: `{linhas em alvo+1} de {linhas fora do alvo + linhas em alvo+1}` — fórmula do
  `ValidaRestante()`.
- **Menu de contexto**: "Alterar para Normal / Conferência / Saída" altera apenas as linhas
  selecionadas e grava **por ETIQUETA** (`UPDATE ... WHERE etiqueta IN(...)`), como no legado.
- **Busca**: opções ORD.COMPRA / PEDIDO / CARGA; a lista de valores vem de `GROUP BY` (RPC `exec_sql`);
  o campo filtra a lista no cliente; "Buscar" **substitui** o conteúdo do grid (e mostra
  "Nada encontrado." quando não há resultado).
- **Layout fixo**: cabeçalho, barra de ações e contadores ficam fixos — **só o grid rola**
  (raiz `h-screen overflow-hidden`, área do grid `flex-1 min-h-0 overflow-auto`).

### Divergências conscientes

| Legado | Aqui | Motivo |
|---|---|---|
| grid vazio até clicar em Buscar | carrega os pedidos da fábrica ao abrir/trocar | praticidade; a busca continua substituindo o conteúdo |
| modal "Continuar conferindo?" em loop quando a resposta é "No" | aviso único | o loop era um bug do legado |
| campo de etiqueta como senha (`UseSystemPasswordChar`) | texto visível | cosmético |
| grava só no Fechar | grava a cada bipagem | decisão do cliente |

## Pendências conhecidas

1. **Parsers de layout**: só o `CSV Padrão` tem mapeamento em `lib/parsers.ts`. Os outros arquivos
   usam detecção automática de separador/cabeçalho e exibem um aviso na tela. Portar os 30 parsers
   de `Negocio/boPedido.cs` é o próximo passo.
2. **Segurança**: o RLS está desabilitado e `usuario.senha` é texto plano (exigência do login legado).
   Qualquer pessoa com a chave publishable consegue ler as senhas. Antes de publicar:
   habilitar RLS, revogar leitura de `usuario` para o role `anon` e manter apenas as funções RPC.
3. A tabela `BOX` é lida em `lib/api.ts` (`listarBoxes`) mas ainda não é usada no grid — o legado
   também não a consultava.
4. `src/App.tsx`, `src/App.css`, `src/index.css` e `src/assets/` são sobras do template e podem ser
   removidos.

## Credenciais de teste

`ADMIN` / `trocar@123` (criado pela migration `20260914000002`) — **troque a senha** e cadastre os
usuários reais antes de usar em produção.
