# SisConf SaaS

Plataforma web multi-tenant para conferência de itens de montagem de móveis planejados.

Substitui o sistema desktop legado em [sistema-de-conferencia/](sistema-de-conferencia/) (referência, não alterar).

## Arquitetura

Veja [ARCHITECTURE.md](ARCHITECTURE.md) — documento de referência consolidando todas as decisões.

Stack:
- **Backend**: .NET 8 + EF Core + PostgreSQL + SignalR + Stripe
- **Frontend**: React 19 + Vite + Katalyst + TanStack + TTS (Web Speech API)
- **Multi-tenant**: shared schema com `tenant_id` em todas as tabelas

## Estrutura

```
backend/         solution .NET 8 em camadas
frontend/        React (Katalyst) — ainda não criado
sistema-de-conferencia/   LEGADO — referência
katalyst/        template de referência
docker-compose.yml        Postgres 16 + pgAdmin para dev
ARCHITECTURE.md           decisões locked
```

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Tool `dotnet-ef` global:
  ```powershell
  dotnet tool install --global dotnet-ef --version 8.0.10
  ```

## Setup inicial

```powershell
# 1. Subir Postgres + pgAdmin
docker compose up -d

# 2. Aplicar migrations
cd backend
dotnet ef database update --project src/SisConf.Infrastructure --startup-project src/SisConf.Api

# 3. Rodar a API
dotnet run --project src/SisConf.Api
```

A API sobe em `http://localhost:5000`. Endpoints úteis:
- `GET /` — info do serviço
- `GET /health` — health check (inclui Postgres)
- `GET /api/test/db` — valida conexão e conta registros
- `GET /swagger` — documentação Swagger UI

pgAdmin: http://localhost:5050
- email: `dev@sisconf.dev`
- senha: `sisconf_dev`

Connection string Postgres (configurada em [appsettings.json](backend/src/SisConf.Api/appsettings.json)):
```
Host=localhost;Port=5432;Database=sisconf;Username=sisconf;Password=sisconf_dev
```

## Comandos comuns

### Banco

```powershell
# Subir
docker compose up -d

# Logs
docker compose logs -f postgres

# Parar (mantém dados)
docker compose stop

# Resetar (apaga dados)
docker compose down -v
```

### Migrations

```powershell
cd backend

# Criar nova migration
dotnet ef migrations add NomeDaMigration --project src/SisConf.Infrastructure --startup-project src/SisConf.Api --output-dir Persistencia/Migrations

# Aplicar
dotnet ef database update --project src/SisConf.Infrastructure --startup-project src/SisConf.Api

# Reverter última
dotnet ef migrations remove --project src/SisConf.Infrastructure --startup-project src/SisConf.Api
```

### Build e testes

```powershell
cd backend
dotnet build
dotnet test
```

## Estado atual

### ✅ F0 — Foundations
- Solution .NET 8 com 5 projetos em Clean Architecture
- Postgres 16 + pgAdmin via Docker Compose
- EF Core + Npgsql, snake_case automático
- API com Serilog, Swagger, CORS, health check

### ✅ F1 — Auth + Tenant
- Entidade `RefreshToken` (idempotência via hash SHA-256, rotação em refresh)
- Catálogo estático de **24 permissões** ([Permissoes.cs](backend/src/SisConf.Application/Common/Auth/Permissoes.cs))
- **Argon2id** para hash de senha (OWASP: 64MB / 3 iter / 4 paralelo)
- JWT HS256 (15min access + 30d refresh) com claims `tenant_id`, `eh_owner`, `perms[]`
- `ITenantContext` scoped lendo do JWT no HttpContext
- `[HasPermission("modulo.acao")]` + PolicyProvider dinâmico (suporta wildcard `modulo.*`)
- `TenantStatusMiddleware` retorna 402 para tenant suspenso (cache 5min)
- Seeders: 3 planos (Basic R$99 / Pro R$249 / Enterprise R$599) + 24 permissões
- 4 roles template criadas por tenant no signup: Admin, Supervisor, Conferente, Importador
- Endpoints:
  - `GET /api/public/planos`
  - `POST /api/public/signup` — cria tenant + owner + roles + tokens
  - `POST /api/auth/login`
  - `POST /api/auth/refresh` (com rotação)
  - `POST /api/auth/logout`
  - `GET /api/me` (autenticado)

### ✅ F2 — Cadastros configuráveis
- Entidades: `Status`, `Box`, `Layout` (catálogo global), `TenantLayoutAtivo`, `Grupo`
- Filtro global por `tenant_id` no `SisConfDbContext` (parametrizado por request via property de instância)
- Seeds automáticos no signup: 4 status iniciais (Normal, Conferido, Saída, Entregue) + 3 boxes default
- Catálogo global de 16 layouts (Todeschini, Italinea, Unicasa, Marel, etc.)
- Endpoints (todos com `[HasPermission]`):
  - `GET/POST/PUT/DELETE /api/status` + `PUT /api/status/reordenar`
  - `GET/POST/PUT/DELETE /api/boxes`
  - `GET/POST/PUT/DELETE /api/grupos`
  - `GET /api/layouts` + `POST /api/layouts/{id}/{ativar,desativar}`
  - `GET /api/permissoes` (catálogo)
  - `GET/POST/PUT/DELETE /api/roles` (matriz role × permissão, roles de sistema protegidas)
  - `GET/POST/PUT/DELETE /api/usuarios`
  - `POST /api/usuarios/{id}/atribuir-roles`
  - `POST /api/usuarios/{id}/redefinir-senha` (revoga refresh tokens)
  - `POST /api/usuarios/transferir-owner` (somente o owner atual)
- Isolamento de tenants validado end-to-end (Acme não vê dados de Beta e vice-versa)

### ✅ F3 — Conferência (MVP)
- Entidades `Pedido` e `PedidoEvento` (histórico) com idempotência via `client_event_id UNIQUE`
- **Bipagem assíncrona** via `Channel<ConferenciaCommand>` + `ConferenciaProcessor` (BackgroundService)
- **SignalR Hub** `/hubs/conferencia` com auth JWT (header **ou** query string `?access_token=` para WebSocket)
- **TTS pronto no payload**: backend monta `"Box um, Conferido"` lendo `box.tts_texto` + `status.tts_texto`
- **Locking distribuído**: `lock_session_id`/`lock_expires_at` + `LockGcService` (libera locks expirados a cada 1min)
- Validações de transição:
  - status atual `eh_bloqueio=true` → recusa (pedido finalizado)
  - destino com `ordem <= atual` → retorna `JaConferido` ou `StatusInvalido`
  - replay com mesmo `client_event_id` → retorna `JaConferido` sem duplicar evento
- Permissão nova: `pedidos.criar_manual`
- Endpoints:
  - `POST /api/conferencias` → **202 Accepted**, resultado chega via SignalR (evento `conferenciaResultado`)
  - `POST /api/pedidos` (criação manual — perm `pedidos.criar_manual`)
  - `GET /api/pedidos` (filtros `statusId`, `boxId`, `grupoId`, `etiqueta`, `cliente`, `peCliente`, `ordemCompra`, paginação)
  - `POST /api/pedidos/lote/{alterar-box,alterar-grupo,alterar-status}`

Smoke tests em [backend/tests-manual/](backend/tests-manual/):
- `signalr_smoke.py` — bipa 3 etiquetas, recebe push via WebSocket
- `idempotencia_test.py` — confirma idempotência por `client_event_id`

### ✅ F4 — Importação
- Entidades `ArquivoImportacao`, `ArquivoImportacaoErro`, `UsoMensal`
- `Tenant.PlanoId` (preparação para F6 Stripe)
- `IFileStorage` + `LocalFileStorage` (substituível por R2/S3)
- `IPedidoImportParser` + `PedidoImportParserRegistry`
- Parsers: **CsvPadraoParser** (genérico) + **BartzenParser** (porta do legado)
- `ImportacaoQueue` + `ImportacaoProcessor` (BackgroundService, batches de 200, progresso a cada 50 linhas via SignalR)
- SignalR Hub `/hubs/importacao` + push `importacaoProgresso`
- **Enforcement de limite mensal por plano** via `uso_mensal` (increment atômico) → **HTTP 429** quando excede
- Layout deve estar ativado pra o tenant (`tenant_layout_ativo`)
- Endpoints (perm `importacao.*`):
  - `POST /api/importacoes` (multipart, máx 50MB) → 202 Accepted
  - `GET /api/importacoes` (histórico paginado)
  - `GET /api/importacoes/{id}`
  - `GET /api/importacoes/{id}/erros`
  - `POST /api/importacoes/{id}/cancelar`

Smoke F4: signup Delta (plano Basic = 10/mês) → ativar `csv-padrao` → upload `amostra.csv` (5 linhas, 1 inválida) → 4 pedidos + 1 erro registrado. 10 imports OK; 11º bloqueado com 429.

### ✅ Frontend MVP — React 19 + Vite (em `frontend/`)
Derivado do Katalyst, com módulos demo removidos. Stack: React 19, Vite 7, Tailwind 4, shadcn/ui, TanStack Query, SignalR client, axios.

- **Cliente HTTP** ([api.ts](frontend/src/shared/services/api.ts)) com interceptor JWT + refresh automático + redirect 401/402
- **authStore** (memória + localStorage, via `useSyncExternalStore`)
- **SignalR factory** com auto-reconnect ([hubConnection.ts](frontend/src/shared/services/realtime/hubConnection.ts))
- **TTS service** via Web Speech API (cancela fala anterior, fallback beep)
- **AppLayout** com sidebar dinâmica (esconde itens sem permissão) + logout
- **ProtectedRoute** baseado em `authStore.estaAutenticado()`

Telas implementadas:
- `/` — landing pública (hero + features)
- `/precos` — lista planos via `/api/public/planos`
- `/login` — JWT contra `/api/auth/login`
- `/cadastro` — signup contra `/api/public/signup` (login automático)
- `/app/conferencia` — input de etiqueta + dropdown de status + SignalR + TTS automático + contagens + histórico das 50 últimas
- `/app/pedidos` — tabela com filtros (etiqueta, cliente, status, box) + cor do status + paginação
- `/app/importacoes` — upload multipart + histórico com status colorido + SignalR de progresso
- `/app/status` — CRUD com color picker + flags + TTS por status
- `/app/boxes` — CRUD com TTS por box
- `/app/layouts` — opt-in dos layouts do catálogo

Validação automatizada (Playwright headless em [frontend/smoke-test.mjs](frontend/smoke-test.mjs)):
- Landing carrega
- Login `pedro@gamma.com` → redirect para `/app/conferencia`
- SignalR conecta ("Online")
- Pedidos lista (4 itens)
- Status mostra 4 do seed
- Navegação entre telas sem erros de JS

### ✅ F5 — Histórico + Relatórios
- `GET /api/eventos` paginado com filtros (`pedidoId`, `usuarioId`, `statusId`, `de`, `ate`, `origem`, `etiqueta`)
- `GET /api/eventos/exportar.xlsx` via **ClosedXML** (síncrono, até 10k linhas)
- Relatórios assíncronos com `RelatorioJob` + `RelatorioQueue` + `RelatorioProcessor`:
  - `POST /api/relatorios/{tipo}/gerar` → 202 Accepted com `jobId`
  - `GET /api/relatorios` lista jobs do tenant
  - `GET /api/relatorios/{id}` status
  - `GET /api/relatorios/{id}/download` PDF do storage
- Tipo `resumido` implementado: PDF via **QuestPDF** com contagem de pedidos por status (cor + %)
- Telas: `/app/historico` (filtros + export) e `/app/relatorios` (gerar + polling + download)

### ✅ F6 — Billing (Stripe)
- Entidades `Assinatura`, `Fatura`, `StripeEvento` + `Tenant.PlanoId` agora obrigatório no signup
- `IStripeService` + `StripeService` (lib `Stripe.net`) — em dev sem SecretKey retorna IDs fake `stripe_fake_*` para signup funcionar offline
- Signup agora cria customer + subscription com trial 14 dias automaticamente
- `StripeWebhookHandler` com idempotência (`stripe_evento.stripe_event_id UNIQUE`):
  - `customer.subscription.{created,updated,deleted}` → atualiza `Assinatura` + sincroniza `Tenant.Status`
  - `invoice.{created,finalized,paid,payment_failed,voided,deleted}` → cria/atualiza `Fatura`
- Endpoints:
  - `POST /api/webhooks/stripe` (público, valida HMAC `Stripe-Signature`)
  - `GET /api/assinatura` (plano atual, status, próxima cobrança)
  - `GET /api/assinatura/uso` (importações do mês vs limite)
  - `POST /api/assinatura/alterar-plano` (proration Stripe)
  - `GET /api/faturas`
  - `POST /api/billing/portal-session` → URL do Stripe Customer Portal
- Telas: `/app/assinatura` (plano atual + uso com barra de progresso + outros planos) e `/app/faturas`

### ✅ Frontend RBAC + Polimento
- Módulo `admin`: `/app/usuarios`, `/app/roles` (matriz role × permissão agrupada por módulo), `/app/grupos`
- `useTheme` ligado: toggle sol/lua na sidebar com View Transitions API
- `toast` wrapper sobre Sonner (success/erro/info/aviso)
- `SkeletonSisConf` para loading states
- Smoke Playwright final: **13 rotas do `/app/*` carregam sem erros JS** ([smoke-test-final.mjs](frontend/smoke-test-final.mjs))

### Próximas fases

Veja [ARCHITECTURE.md § 15](ARCHITECTURE.md#15-plano-de-migração-faseado).

Para subir o ambiente completo:
```powershell
docker compose up -d
cd backend; $env:ASPNETCORE_ENVIRONMENT="Development"; dotnet run --project src/SisConf.Api
# outro terminal:
cd frontend; npm run dev
# abre http://localhost:5173
```

## Smoke test rápido

```powershell
# Subir tudo
docker compose up -d
cd backend
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run --project src/SisConf.Api

# Em outro terminal:
# 1. Listar planos
curl http://localhost:5000/api/public/planos

# 2. Signup
curl -X POST http://localhost:5000/api/public/signup `
  -H "Content-Type: application/json" `
  -d '{\"razaoSocial\":\"Acme Moveis Ltda\",\"documento\":\"12345678000199\",\"telefone\":\"11987654321\",\"planoCodigo\":\"pro\",\"nomeAdmin\":\"Joao\",\"emailAdmin\":\"joao@acme.com\",\"senhaAdmin\":\"senha12345\"}'

# 3. Login (retorna tokens)
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"joao@acme.com\",\"senha\":\"senha12345\"}'

# 4. Endpoint autenticado
curl -H "Authorization: Bearer <accessToken>" http://localhost:5000/api/me
```
