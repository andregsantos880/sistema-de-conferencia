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

## Multi-empresa, perfis e gestão de usuários

### A URL identifica a empresa

```
/sysconf/<empresa>/login          <- link enviado ao cliente
/sysconf/<empresa>/conferencia
/sysconf/<empresa>/importacao
/sysconf/<empresa>/usuarios       (somente ADMIN)
```

- `src/lib/rota.ts` corta o slug do caminho. Sem slug, a raiz mostra a tela "Acesse pelo link da sua empresa".
- Empresa inexistente ou inativa → tela de erro.
- **Cadastro de empresa é feito apenas pelo banco**: `insert into public.empresa (slug, nome) values ('<slug>', '<Nome>');`

### Perfis e visibilidade de colunas

| Perfil | Coluna ETIQUETA (código de barras) | Gestão de usuários |
|---|---|---|
| `ADMIN` (administrador) | visível | sim |
| `OPERADOR` | **oculta** | não |

Colunas que **não aparecem para ninguém**: ID, FÁBRICA, ID LAYOUT, ID BOX, BLOQUEIO e PC
(configuráveis em `src/lib/config.ts` → `COLUNAS_OCULTAS` e `COLUNAS_POR_PERFIL`).

A coluna **STATUS** mostra o **estágio** (`NORMAL`, `CONFERÊNCIA`, `SAÍDA`, `ENTREGA`) em vez do
número — textos em `DS_STATUS` (`src/lib/regrasConferencia.ts`); usada também no grid e no CSV.

### Gestão de usuários e perfis (pela própria empresa)

Tela `src/telas/Usuarios.tsx` (rota `/usuarios`, exclusiva do ADMIN da própria empresa):
incluir, editar (login, nome, perfil e senha), ativar/inativar e excluir — sempre restrito à empresa
logada. O próprio usuário não consegue se inativar/excluir.

### Empresas e dados de exemplo no banco

| Empresa | Slug | Dados |
|---|---|---|
| Novo Mundo | `novomundo` | 16 fábricas + 924 pedidos (importação real da Criare) |
| Homologação | `homologacao` | 1 fábrica (CSV Padrão) + 10 pedidos de teste |

Usuários de teste (senha `trocar@123`): `ADMIN` (administrador) e `OPERADOR` nas duas empresas —
o mesmo login existe em empresas diferentes porque a unicidade é por empresa.

### Banco de dados

`public.empresa` (cadastro manual) e `empresa_id` em `usuario`, `pedido`, `layout` e `box`;
`usuario.perfil` (`ADMIN`/`OPERADOR`), `usuario.ativo`; login único por `(empresa_id, login)`.
O login é o RPC `login_usuario(p_empresa, p_login, p_senha)`.

Migrações: `0006_empresa_multitenant.sql`, `0007_rpc_login_usuario_empresa.sql`,
`0008_usuario_ativo.sql`.

## Site: landing, login e cadastro

O site é o mesmo app. O caminho da URL decide a tela (`src/lib/rota.ts`):

| URL | Tela | Arquivo |
|---|---|---|
| `/` | Landing (apresentação do produto) | `src/telas/Landing.tsx` |
| `/entrar` | Login de quem já é cliente (informa a empresa) | `src/telas/Entrar.tsx` |
| `/registrar` | Autocadastro: cria a empresa + o ADMIN | `src/telas/Registrar.tsx` |
| `/sysconf/<empresa>/login` etc. | App da empresa (links enviados aos clientes) | `src/telas/*` |

A identidade do site (nome, e-mail, telefone, site) fica em `MARCA` (`src/lib/config.ts`) —
trocar lá muda a landing e os rodapés. **O e-mail de contato é um placeholder: trocar antes de divulgar.**

### Autocadastro (30 dias grátis)

- A tela chama o RPC `registrar_empresa(p_empresa, p_slug, p_login, p_senha, p_nome, p_email)`
  (migração `20260914000009`), que cria a empresa e o ADMIN na mesma transação e devolve a sessão.
- A empresa nasce com `ativo = 1` e `trial_ate = now() + 30 dias`; o cabeçalho mostra
  "Teste grátis: N dias" (ou "Teste encerrado"). O teste **não bloqueia** o acesso — o bloqueio só
  entra quando o cliente decidir.
- Regras validadas no banco: endereço de 3 a 30 caracteres (letras sem acento, números e hífen),
  endereços reservados (`sysconf`, `entrar`, `registrar`, …), endereço único, usuário de 3 a 30,
  senha de 4 a 15 (limite do legado) e e-mail válido.
- **`empresa` não aceita mais INSERT/UPDATE/DELETE pela chave publishable** (`revoke` na migração) —
  a única porta de entrada é o RPC. Leitura (SELECT) continua liberada, porque a URL resolve o slug.

> Empresa nova **já nasce com as 30 fábricas do catálogo** (ver abaixo), então o cliente consegue
> importar arquivo no primeiro acesso.

### Catálogo de fábricas do autocadastro

`public.catalogo_fabrica` guarda o catálogo padrão (30 nomes: `CSV Padrão` + as 29 fábricas com
integração do legado). No autocadastro, `registrar_empresa` chama `criar_fabricas_padrao(empresa_id)`,
que copia o catálogo para `layout` daquela empresa — empresa, ADMIN e fábricas na mesma transação.

- Quem controla o catálogo é o dono, via SQL (a chave publishable só lê):
  `insert into public.catalogo_fabrica (ordem, nome) values (31, 'Nova Fábrica');`
- Completar uma empresa já existente (sem duplicar nome):
  `select public.criar_fabricas_padrao((select id from public.empresa where slug='homologacao'));`
- A tabela `layout` **não aceita mais escrita pela chave publishable** (o navegador só lê fábricas).

> **Atenção à chave primária:** `layout.controle` é PK **global**, não `(empresa_id, controle)`.
> Por isso `criar_fabricas_padrao` gera `controle = max(controle) + ordem`, sob
> `pg_advisory_xact_lock`, para que dois autocadastros simultâneos não colidam.

## Fábricas com integração (fixadas no topo)

A lista de fábricas que o sistema sabe ler vem de `Negocio/boPedido.cs` → `CarregarDados()`,
no `switch (arquivoIm.LayoutId)`: cada `case` é um parser por fornecedor
(`2 = InserirCriare`, `21 = InserirBartzen`, `28 = InserirBARTZ`, …). São 29 fábricas (o id 25 não existe).

Essa lista está em `src/lib/integracao.ts` (`LAYOUTS_COM_INTEGRACAO`), junto com
`temIntegracao(nome)`. As fábricas com integração:

- aparecem **fixadas no topo** do combo "Fábrica" (conferência e importação), sob o grupo
  **★ Com integração instalada**;
- são a **seleção padrão** ao abrir a tela;
- levam **★** também no selo da fábrica no cabeçalho;
- as demais ficam no grupo "Demais fábricas (sem integração)", e a tela de importação avisa
  que o arquivo será lido no modo genérico.

> **Atenção:** a comparação é pelo **NOME** da fábrica, normalizado (maiúsculas, sem acento).
> O `controle` da tabela `layout` **não** é o `LayoutId` do legado — a migração `0002` gravou
> `controle` na ordem alfabética do cadastro (o `3` é `Italinea` no legado e `CSV Padrão` no banco).

Para incluir uma fábrica na lista, acrescente o nome em `LAYOUTS_COM_INTEGRACAO`
(e o parser correspondente em `src/lib/parsers.ts`).
## Seguranca: sessao, senhas e o que ainda falta

### Como o app fala com o banco (desde 15/09)

O navegador **nao acessa tabelas**: tudo passa por RPCs que resolvem a empresa e o perfil a
partir do **token de sessao** (12 horas), guardado em `sessionStorage` (o F5 mantem, fechar a
aba encerra).

| Passo | RPC |
|---|---|
| Entrar | `login_usuario(slug, login, senha)` -> devolve `token` |
| Retomar no F5 | `sessao_atual(token)` |
| Sair | `sair_usuario(token)` |
| Fábricas / boxes | `fabricas_listar(token)` / `boxes_listar(token)` |
| Pedidos | `pedidos_listar`, `pedido_status_id`, `pedido_status_etiquetas`, `pedidos_inserir` |
| Busca | `buscar_valores`, `buscar_pedidos_filtro` |
| Usuários (ADMIN) | `usuarios_listar`, `usuario_criar`, `usuario_atualizar`, `usuario_excluir` |

**Nenhuma consulta recebe `empresa_id` do navegador** — ela vem da sessao, no servidor.
Perfil tambem e conferido no servidor (a tela de usuarios nao e a protecao).

### Senhas

`usuario.senha_hash` (bcrypt, `pgcrypto`). Quem entrou com a senha antiga em texto claro tem o
hash gravado no primeiro login. `usuario.senha` (texto claro) continua existindo **apenas para o
WinForms legado** e pode ser removida depois que ele for desativado.

### SQL arbitrario: fechado

`exec_sql`, `exec_dml` e `exec_scalar` estavam liberados para `anon` — com a chave publishable
(que vai no bundle) qualquer pessoa rodava SQL, inclusive DDL. Foram revogados; hoje so
`service_role` executa (migracao `00102`).

> **Como aplicar migracoes agora:** Supabase Dashboard -> SQL Editor -> colar o arquivo -> Run
> (ou definir uma chave `service_role` apenas em variavel de ambiente local). O caminho por REST
> nao existe mais.

### Pendente: RLS nas tabelas (`00103`)

`supabase/migrations/20260914000103_fechar_acesso_direto_tabelas.sql` liga RLS em todas as
tabelas e revoga os GRANTs de `anon`/`authenticated`. Enquanto ele nao roda, uma pessoa com a
chave publishable ainda consegue **ler `usuario.senha` e os pedidos de qualquer empresa**.

> **Nao aplicar com o WinForms em uso:** o legado fala com o PostgREST como `anon` e le
> `USUARIO.SENHA` para validar o login dele. Sem os GRANTs ele recebe 401/403.
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
