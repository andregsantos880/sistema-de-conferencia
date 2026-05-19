# SisConf SaaS — Arquitetura

Documento de referência consolidando todas as decisões de arquitetura para a migração
do SisConf (WinForms .NET Framework 4.8) para uma plataforma SaaS web multi-tenant.

Mantenha este arquivo atualizado conforme decisões evoluírem.

---

## 1. Visão geral

**Produto**: SisConf SaaS — sistema web para conferência de itens de montagem de móveis
planejados, vendido como SaaS B2B com cobrança mensal.

**Substitui**: aplicação desktop WinForms em `sistema-de-conferencia/` (referência, não
será alterada).

**Diferenciais técnicos**:
- Bipagem assíncrona com fila local persistente (zero perda de dados sob carga).
- Áudio em tempo real (TTS) para feedback ao operador sem necessidade de olhar a tela.
- Status configurável por tenant (não hardcoded como no legado).
- Multi-tenant em base única (shared schema) para baixo custo operacional.

---

## 2. Stack tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | ASP.NET Core | 8 LTS |
| ORM | EF Core + Npgsql | 8.x |
| Banco | PostgreSQL | 16+ |
| Realtime | SignalR | nativo .NET 8 |
| Auth | JWT próprio (Argon2id para senhas) | — |
| Billing | Stripe (lib `Stripe.net`) | última |
| Storage | S3-compatível (Cloudflare R2) | — |
| Frontend | React + Vite + TypeScript | React 19, Vite 7 |
| DI Frontend | Inversify | já no Katalyst |
| UI | Tailwind 4 + shadcn/ui + Radix | já no Katalyst |
| Estado servidor | TanStack Query | já no Katalyst |
| Tabelas | TanStack Table + Virtual | já no Katalyst |
| Forms | react-hook-form + zod | já no Katalyst |
| TTS | Web Speech API (browser nativo) | — |
| Dev DB | Docker Compose | — |
| Testes | xUnit (backend), Vitest (frontend) | — |

---

## 3. Estrutura de pastas do repositório

```
c:\GIT\Sysconf\
├── sistema-de-conferencia/    LEGADO — WinForms .NET Framework 4.8. Não alterar.
├── katalyst/                  TEMPLATE — referência do Katalyst. Não alterar.
├── backend/                   NOVO — solution .NET 8
│   ├── src/
│   │   ├── SisConf.Api/                 ASP.NET Core API + SignalR + webhooks
│   │   ├── SisConf.Application/         Use cases por módulo
│   │   ├── SisConf.Domain/              Entidades + regras puras
│   │   ├── SisConf.Infrastructure/      EF Core, parsers, Stripe, Storage, Auth
│   │   └── SisConf.Workers/             BackgroundServices
│   ├── tests/
│   │   └── SisConf.Tests/
│   └── SisConf.sln
├── frontend/                  NOVO — derivado do katalyst-vite
│   └── (estrutura padrão Katalyst com módulos próprios)
├── docker-compose.yml         Postgres + pgAdmin para dev local
├── ARCHITECTURE.md            Este arquivo
└── README.md
```

---

## 4. Multi-tenancy

**Estratégia**: Shared database, shared schema, coluna `tenant_id` em todas as tabelas
transacionais. Filtros aplicados automaticamente pelo EF Core via `HasQueryFilter`.

**Resolução do tenant**: claim `tenant_id` no JWT (definido no login). Subdomínio
(`acme.sysconf.app`) fica para fase 2.

**Defesa em profundidade**: Row Level Security (RLS) do PostgreSQL ativada em todas as
tabelas com `tenant_id`. Policy:

```sql
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pedido
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

`TenantResolutionMiddleware` executa `SET app.tenant_id = '<uuid>'` no início de cada
request autenticada.

**Tenant context** (`ITenantContext`, scoped):
- `Guid TenantId`
- `Guid UsuarioId`
- `string[] Permissoes`
- `bool EhOwner`

---

## 5. Modelo de dados (PostgreSQL)

Convenções:
- snake_case em tabelas e colunas
- PKs `uuid` (v7 onde ordenação temporal importa, v4 nos demais)
- `tenant_id` em toda tabela transacional
- `criado_em timestamptz default now()`, `atualizado_em timestamptz`
- Soft delete via `deletado_em timestamptz null` (onde aplicável)

### 5.1 Tenant & Billing

```
tenant
  id uuid PK
  slug text UNIQUE                          -- ex: 'acme'
  razao_social text
  documento text                            -- CPF ou CNPJ
  email_admin text
  telefone text
  status text                               -- trial | ativo | em_atraso | suspenso | cancelado
  trial_termina_em timestamptz null
  stripe_customer_id text null UNIQUE
  criado_em, atualizado_em

plano
  id uuid PK
  nome text                                 -- 'Basic', 'Pro', 'Enterprise'
  codigo text UNIQUE                        -- 'basic', 'pro', 'enterprise'
  preco_mensal_centavos int
  limite_importacoes_mes int                -- -1 = ilimitado
  stripe_price_id text                      -- price_xxx no Stripe
  recursos_json jsonb                       -- feature flags { "relatorios_avancados": true, ... }
  ativo bool default true
  ordem int                                 -- ordenação na landing

assinatura
  id uuid PK
  tenant_id uuid FK UNIQUE                  -- 1 assinatura por tenant
  plano_id uuid FK
  status text                               -- trialing | active | past_due | canceled
  iniciada_em timestamptz
  proxima_cobranca_em timestamptz
  cancelada_em timestamptz null
  stripe_subscription_id text UNIQUE

fatura
  id uuid PK
  tenant_id uuid FK
  assinatura_id uuid FK
  stripe_invoice_id text UNIQUE
  numero text
  valor_centavos int
  vencimento date
  status text                               -- aberta | paga | vencida | cancelada
  pago_em timestamptz null
  payment_method text                       -- boleto | pix | card
  link_pagamento text null                  -- hosted_invoice_url do Stripe
  link_pdf text null
  criado_em

stripe_evento
  id uuid PK
  tipo text                                 -- 'invoice.paid' etc.
  stripe_event_id text UNIQUE
  payload_json jsonb
  processado_em timestamptz null
  erro_processamento text null
  recebido_em
```

### 5.2 Identidade & Autorização

```
usuario
  id uuid PK
  tenant_id uuid FK
  email citext                              -- case-insensitive
  senha_hash text                           -- Argon2id
  nome text
  eh_owner bool default false               -- 1 por tenant, fixed após signup
  ativo bool default true
  ultimo_login_em timestamptz null
  criado_em
  UNIQUE(tenant_id, email)

role
  id uuid PK
  tenant_id uuid null                       -- null = role global do SaaS
  nome text
  descricao text null
  eh_sistema bool default false             -- templates seed, não excluíveis

permissao                                   -- catálogo estático, populado por seed
  codigo text PK                            -- 'pedidos.conferir'
  modulo text                               -- 'pedidos'
  acao text                                 -- 'conferir'
  descricao text

usuario_role (usuario_id, role_id) PK composta
role_permissao (role_id, permissao_codigo) PK composta
```

**Catálogo de permissões** (seed):

```
pedidos.visualizar, pedidos.conferir, pedidos.alterar_box,
  pedidos.alterar_status, pedidos.alterar_grupo, pedidos.exportar
importacao.upload, importacao.visualizar, importacao.reprocessar, importacao.cancelar
status.gerenciar
boxes.gerenciar
layouts.gerenciar
grupos.gerenciar
usuarios.visualizar, usuarios.gerenciar, usuarios.atribuir_roles
roles.gerenciar
historico.visualizar, historico.exportar
relatorios.gerar
faturas.visualizar, faturas.gerenciar
tenant.configurar
admin_saas.*                                -- staff interno do SaaS
```

**Roles template** (criadas no signup de cada tenant, `eh_sistema=true`):

| Role | Permissões |
|---|---|
| Admin | tudo exceto `admin_saas.*` |
| Supervisor | `pedidos.*`, `historico.*`, `relatorios.gerar`, `importacao.visualizar`, `usuarios.visualizar` |
| Conferente | `pedidos.visualizar`, `pedidos.conferir` |
| Importador | `importacao.*`, `pedidos.visualizar` |

Tenant pode duplicar e customizar.

### 5.3 Domínio (núcleo)

```
status                                      -- cada tenant define os seus
  id uuid PK
  tenant_id uuid FK
  codigo text                               -- 'NORMAL', 'CONFERENCIA'
  nome text
  cor_hex text                              -- '#22C55E'
  ordem int                                 -- ordenação visual e regra de avanço padrão
  eh_inicial bool default false             -- 1 por tenant
  eh_terminal bool default false
  eh_bloqueio bool default false            -- pedido nesse status não pode ser conferido
  tts_texto text null                       -- texto falado ao entrar nesse status (override)
  UNIQUE(tenant_id, codigo)

status_transicao                            -- regras finas (opcional)
  status_de_id uuid FK
  status_para_id uuid FK
  PK(status_de_id, status_para_id)

box
  id uuid PK
  tenant_id uuid FK
  codigo text                               -- ex: '3' ou 'A-12'
  nome text
  tts_texto text null                       -- override do texto falado (default = "Box {codigo}")
  ativo bool default true
  UNIQUE(tenant_id, codigo)

layout                                      -- CATÁLOGO GLOBAL, tenant_id sempre NULL
  id uuid PK
  nome text                                 -- 'Todeschini', 'Italinea', etc.
  parser_key text UNIQUE                    -- chave registrada no DI: 'TodeschiniParser'
  descricao text
  exemplo_arquivo_url text null
  ativo bool default true

tenant_layout_ativo                         -- opt-in por tenant
  tenant_id uuid FK
  layout_id uuid FK
  ativado_em timestamptz
  ativado_por_usuario_id uuid FK
  PK(tenant_id, layout_id)

grupo
  id uuid PK
  tenant_id uuid FK
  nome text
  criado_por_usuario_id uuid FK
  criado_em

arquivo_importacao
  id uuid PK
  tenant_id uuid FK
  nome_arquivo text
  layout_id uuid FK
  storage_key text                          -- chave no S3/R2
  storage_tamanho_bytes bigint
  status text                               -- recebido | processando | concluido | erro | cancelado
  total_linhas int null
  linhas_ok int null
  linhas_erro int null
  iniciado_em timestamptz null
  finalizado_em timestamptz null
  usuario_id uuid FK
  criado_em

arquivo_importacao_erro
  id uuid PK
  arquivo_importacao_id uuid FK
  numero_linha int
  conteudo text
  mensagem text

pedido
  id uuid PK (v7)
  tenant_id uuid FK
  arquivo_importacao_id uuid FK
  layout_id uuid FK
  box_id uuid FK null
  grupo_id uuid FK null
  status_id uuid FK                         -- aponta para o último status (denormalizado)
  etiqueta text                             -- código de barras
  ordem_compra text null
  cliente text null
  pe_cliente text null                      -- pedido do cliente
  produto text null
  descricao text null
  qtde int null
  volume text null
  sequencia bigint null
  -- locking distribuído
  lock_session_id text null                 -- connection id do SignalR
  lock_expires_at timestamptz null
  lock_usuario_id uuid FK null
  criado_em, atualizado_em
  INDEX(tenant_id, etiqueta)                -- bipagem ultra-rápida
  INDEX(tenant_id, status_id, box_id)       -- listagens
  INDEX(tenant_id, arquivo_importacao_id)

pedido_evento                               -- HISTÓRICO completo, source-of-truth
  id uuid PK (v7)
  tenant_id uuid FK
  pedido_id uuid FK
  status_anterior_id uuid FK null
  status_novo_id uuid FK
  usuario_id uuid FK
  client_event_id uuid UNIQUE               -- idempotência (gerado pelo browser)
  ocorreu_em timestamptz
  origem text                               -- 'web' | 'mobile' | 'import' | 'sistema'
  metadata_json jsonb null                  -- payload extra (ip, ua, etc.)
  INDEX(tenant_id, ocorreu_em DESC)
  INDEX(tenant_id, pedido_id, ocorreu_em DESC)
  INDEX(tenant_id, usuario_id, ocorreu_em DESC)
```

### 5.4 Limites & Configuração

```
uso_mensal                                  -- enforcement de limite por plano
  tenant_id uuid FK
  ano_mes int                               -- yyyymm, ex: 202605
  importacoes_count int default 0
  pedidos_processados_count int default 0
  PK(tenant_id, ano_mes)

tenant_config                               -- 1:1 com tenant
  tenant_id uuid PK FK
  tts_voz text null                         -- nome da voz pt-BR preferida
  tts_taxa numeric default 1.0              -- 0.5 a 2.0
  tts_volume numeric default 1.0            -- 0.0 a 1.0
  fuso_horario text default 'America/Sao_Paulo'
  logo_url text null
  cor_primaria text null
```

### 5.5 Auditoria

```
auditoria_log
  id uuid PK
  tenant_id uuid FK
  usuario_id uuid FK
  acao text                                 -- 'usuario.criou', 'pedido.alterou_box'
  entidade text
  entidade_id text
  antes_json jsonb null
  depois_json jsonb null
  ip inet null
  user_agent text null
  ocorreu_em timestamptz default now()
  INDEX(tenant_id, ocorreu_em DESC)
```

---

## 6. Autenticação e autorização

### 6.1 Senhas

- **Argon2id** via `Konscious.Security.Cryptography` ou `BC.NET`.
- Parâmetros: memory=64MB, iterations=3, parallelism=4.
- Nunca SHA/MD5/bcrypt.

### 6.2 JWT

**Access token** (15 min):
```json
{
  "sub": "<usuario_id>",
  "tenant_id": "<uuid>",
  "email": "...",
  "nome": "...",
  "eh_owner": false,
  "permissoes": ["pedidos.conferir", "pedidos.visualizar", ...],
  "exp": ...
}
```

**Refresh token** (30 dias, persistido em tabela `refresh_token` com revogação).

### 6.3 Autorização por permissão

Attribute custom:

```csharp
[HasPermission("pedidos.conferir")]
[HttpPost("/api/conferencias")]
public Task<IActionResult> Conferir(...) { ... }
```

Validação inspeciona o array `permissoes` da claim. Suporta wildcard (`pedidos.*`).

### 6.4 Tenant isolation

`TenantResolutionMiddleware` antes do MVC:
1. Lê JWT, extrai `tenant_id`.
2. Carrega `Tenant` (cache `MemoryCache` 5min).
3. Bloqueia se `tenant.status == 'suspenso'` (retorna **402 Payment Required**).
4. Popula `ITenantContext`.
5. Executa `SET app.tenant_id = '<uuid>'` na conexão Postgres (para RLS).

`SisConfDbContext.OnModelCreating`:
```csharp
modelBuilder.Entity<Pedido>().HasQueryFilter(p => p.TenantId == _tenantContext.TenantId);
// idem para todas as entidades multi-tenant
```

---

## 7. Billing — Stripe

### 7.1 Fluxo de signup

```
1. POST /api/public/signup
   { razaoSocial, cnpj, emailAdmin, nomeAdmin, senhaAdmin, planoId }

2. Backend (transação):
   - cria tenant (status='trial', trial_termina_em=now()+14d)
   - cria usuario (eh_owner=true)
   - atribui role 'Admin'
   - cria tenant_config defaults
   - cria 4 roles seed (Admin, Supervisor, Conferente, Importador)
   - cria status seed mínimos (Normal, Conferido, Saída, Entregue)
   - POST Stripe /v1/customers → stripe_customer_id
   - POST Stripe /v1/subscriptions
        items=[{price: plano.stripe_price_id}], trial_period_days=14
   - retorna JWT
```

### 7.2 Webhook

`POST /api/webhooks/stripe`:
1. Valida header `stripe-signature` com HMAC SHA-256.
2. Insere em `stripe_evento` (idempotência via `stripe_event_id UNIQUE`).
3. Despacha por tipo:

| Evento Stripe | Ação |
|---|---|
| `customer.subscription.created` | `assinatura.status = trialing/active` |
| `customer.subscription.updated` | atualiza status/plano |
| `customer.subscription.deleted` | `tenant.status = cancelado` |
| `invoice.created` | cria `fatura` local |
| `invoice.paid` | `fatura.status=paga`; `tenant.status=ativo` |
| `invoice.payment_failed` | marca; após N tentativas Stripe cancela |

### 7.3 Customer Portal (substitui parte da tela "Faturas" no MVP)

```
POST /api/billing/portal-session
→ retorna URL temporária do Stripe Customer Portal
→ front redireciona; cliente baixa boletos/atualiza pagamento por lá
```

### 7.4 Pagamento BR

Habilitar `payment_method_types: ['card', 'boleto']` na subscription. Pix quando
disponível na conta. Stripe envia boleto por email automaticamente; nossa tela mostra
o link.

---

## 8. Fluxo de conferência (assíncrono)

### 8.1 Ciclo no browser

```
operador bipa código → input dispara on(Enter)
  ↓
1. clientEventId = crypto.randomUUID()
2. lookup local (último Montar() em memória / IndexedDB)
3. se encontrou e válido → speechSynthesis.speak("Box {n}")  ← som otimista
4. enqueue({clientEventId, etiqueta, statusDestinoId}) em IndexedDB
5. flush() → POST /api/conferencias  → 202 Accepted
6. SignalR push:
   - ok: confirma na UI (cor verde), atualiza contadores
   - erro: fala mensagem de erro, marca linha em vermelho, oferece reverter
```

### 8.2 Ciclo no backend

```
POST /api/conferencias
  ↓
1. Valida claim, tenant ativo, permissão pedidos.conferir
2. Enfileira em Channel<ConferenciaCommand>
3. Retorna 202

Worker ConferenciaProcessor:
1. SELECT pedido WHERE tenant_id=? AND etiqueta=? FOR UPDATE
2. Verifica idempotência: já existe pedido_evento com client_event_id?
3. Valida transição: status atual permite ir para statusDestinoId?
4. Valida bloqueio: outro tenant/sessão segurando lock?
5. INSERT pedido_evento
6. UPDATE pedido.status_id, atualizado_em
7. COMMIT
8. SignalR Hub.SendAsync(usuarioId, { tipo: 'conferencia.ok',
     tts: status.tts_texto ?? `Box ${box.codigo}`, ... })
```

### 8.3 Locking distribuído

Substitui `FlBloqueio + PECOMPUTADOR` do legado.

- Quando operador inicia uma "sessão de conferência" em um lote → cria locks com TTL 2min.
- Heartbeat SignalR a cada 30s renova `lock_expires_at`.
- Background `LockGC` libera locks expirados a cada 1min.
- Tenta conferir um pedido locked por outro → 409 Conflict + nome do bloqueador.

### 8.4 Idempotência

`client_event_id UNIQUE` na `pedido_evento`. Replay de fila é seguro.

---

## 9. Importação de arquivos

### 9.1 Upload

```
POST /api/importacoes (multipart)
  arquivo + layoutId
  ↓
1. Verifica uso_mensal vs plano.limite_importacoes_mes
   se excedeu → 429 + { erro: 'limite_plano_excedido', ... }
2. Verifica tenant_layout_ativo(tenant_id, layout_id)
   se não ativado → 403
3. Upload para R2 → storage_key
4. INSERT arquivo_importacao (status='recebido')
5. INSERT ou UPDATE uso_mensal (count+1)
6. Enfileira ImportacaoCommand
7. Retorna 202 + importacaoId
```

### 9.2 Worker ImportacaoProcessor

```csharp
var parser = _parsers[layout.ParserKey];      // resolvido via DI
await foreach (var pedidoBruto in parser.Parse(stream)) {
    // insere pedido com status inicial do tenant
}
```

`IPedidoImportParser`: 1 implementação por layout (~27 portados do legado).

### 9.3 Acompanhamento

- SignalR push de progresso (`importacao.progresso { id, linhas_ok, linhas_erro, total }`).
- Tela "Importações" lista histórico, status, contadores, link para arquivo original
  e tabela de erros.

---

## 10. TTS (Text-to-Speech)

**100% no browser**, via Web Speech API. Zero custo, zero latência.

```typescript
// frontend/src/modules/conferencia/infrastructure/audio/AudioService.ts
class AudioService {
  speak(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = tenantConfig.tts_taxa;
    u.volume = tenantConfig.tts_volume;
    u.voice = this.pickVoice();
    speechSynthesis.cancel();   // não acumula fila — bipe rápido
    speechSynthesis.speak(u);
  }

  private pickVoice() {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.name === tenantConfig.tts_voz)
        ?? voices.find(v => v.lang === 'pt-BR')
        ?? voices[0];
  }
}
```

Texto vem do backend via SignalR:
- Sucesso: `status.tts_texto` (se configurado) ou `"Box {codigo}, {status.nome}"`.
- Erro: `"Etiqueta não encontrada"`, `"Peça bloqueada"`, etc.

**Fallback**: se `speechSynthesis` indisponível, beep curto via Web Audio API.

---

## 11. Frontend — módulos

Reutiliza a arquitetura DI/modular do Katalyst ([module-loader.ts](katalyst/React/katalyst-vite/src/core/di/module-loader.ts)).

### 11.1 Módulos a criar

```
src/modules/
├── public/                landing + signup + login (layout: 'none')
├── auth/                  adaptar template existente para nosso JWT
├── tenant/                configurações do tenant (TTS, logo, cores, fuso)
├── status/                CRUD + drag&drop + color picker + transições
├── boxes/                 CRUD + texto TTS por box
├── layouts/               lista do catálogo + opt-in por tenant
├── grupos/                CRUD
├── usuarios/              CRUD + atribuição de roles + transferir owner
├── roles/                 CRUD + matriz role × permissão
├── pedidos/               TanStack Table colorida + ações em lote + export
├── conferencia/           bipagem com fila IndexedDB + SignalR + TTS
├── importacao/            upload + acompanhamento + histórico + erros
├── historico/             tabela de eventos com filtros (período, usuário, status)
├── relatorios/            geração assíncrona + lista de jobs + download
├── faturas/               lista local + link Customer Portal Stripe
└── assinatura/            plano atual, uso vs limite, upgrade/downgrade
```

### 11.2 Módulos do Katalyst a remover (não usamos)

```
apps/calendar, apps/chat, apps/email, apps/kanban, apps/invoicing, apps/inbox
dashboards/executive, dashboards/sales, dashboards/ecommerce, dashboards/projects,
  dashboards/shipments
management/notifications, management/teams, management/integrations
showcase, playground, pages/pricing, pages/errors (manter só Error404)
home (substituído por dashboard próprio)
```

### 11.3 Tipos de layout (`layoutBehavior` no Katalyst)

| Rotas | Layout |
|---|---|
| `/`, `/precos`, `/sobre`, `/contato`, `/termos`, `/privacidade` | `none` |
| `/cadastro`, `/login`, `/recuperar-senha` | `auth` |
| Todo o resto | `app` (sidebar + topbar + ProtectedRoute) |

---

## 12. Endpoints da API (resumo)

### Públicos
```
POST /api/public/signup
POST /api/public/contato
GET  /api/public/planos
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/recuperar-senha
POST /api/auth/redefinir-senha
```

### Autenticados (todos checam tenant ativo + permissão)
```
# Conferência (async)
POST /api/conferencias                      { clientEventId, etiqueta, statusDestinoId }
GET  /api/conferencias/pendentes            (replay da fila do operador)

# Pedidos
GET  /api/pedidos                           ?status&box&grupo&search&arquivo&page
POST /api/pedidos/lote/alterar-box
POST /api/pedidos/lote/alterar-status
POST /api/pedidos/lote/alterar-grupo
GET  /api/pedidos/exportar.xlsx

# Importação
POST /api/importacoes                       (multipart)
GET  /api/importacoes
GET  /api/importacoes/{id}
GET  /api/importacoes/{id}/erros
POST /api/importacoes/{id}/reprocessar
POST /api/importacoes/{id}/cancelar

# Cadastros
GET/POST/PUT/DELETE /api/status
PUT  /api/status/reordenar
GET/POST/PUT/DELETE /api/boxes
GET                 /api/layouts            (catálogo global)
POST /api/layouts/{id}/ativar
POST /api/layouts/{id}/desativar
GET/POST/PUT/DELETE /api/grupos
GET/POST/PUT/DELETE /api/usuarios
POST /api/usuarios/{id}/transferir-owner
GET/POST/PUT/DELETE /api/roles
GET                 /api/permissoes

# Histórico
GET  /api/eventos                           ?pedidoId&usuarioId&de&ate&statusId&page
GET  /api/eventos/exportar.xlsx

# Relatórios
POST /api/relatorios/{tipo}/gerar           { filtros } → { jobId }
GET  /api/relatorios/{jobId}                → status, downloadUrl quando pronto

# Billing
GET  /api/assinatura
GET  /api/assinatura/uso
POST /api/assinatura/alterar-plano
GET  /api/faturas
POST /api/billing/portal-session            → { url }

# Tenant
GET/PUT /api/tenant
GET/PUT /api/tenant/config

# Webhook
POST /api/webhooks/stripe                   (HMAC signature)
```

---

## 13. Custos operacionais estimados

Faixa inicial — 1 a 20 tenants pequenos:

| Item | Provedor | Custo/mês |
|---|---|---|
| API .NET | Railway / Fly.io / Hetzner CX22 | $5–10 |
| PostgreSQL | Neon free → $19 ou Supabase free | $0–19 |
| Storage S3 | Cloudflare R2 (10GB grátis, egress zero) | $0 |
| Email transacional | Resend (3k/mês free) | $0 |
| Domínio | Registro.br | ~R$40/ano |
| Stripe | % por transação (sem mensalidade) | variável |
| Sentry (erros) | Free tier | $0 |
| **Total fixo** | | **$10–30** |

A partir de ~50 tenants: DB $25-50, API 2vCPU $20. Modelo continua barato pelo
shared schema.

---

## 14. Ambiente de desenvolvimento

### 14.1 Pré-requisitos

- **.NET 8 SDK** ([dotnet.microsoft.com](https://dotnet.microsoft.com/download))
- **Node.js 20+** + npm
- **Docker Desktop** (necessário para Postgres local)
- **Git**

### 14.2 Docker Compose

`docker-compose.yml` na raiz subirá:
- PostgreSQL 16
- pgAdmin 4 (web UI em `localhost:5050`)

### 14.3 Comandos comuns (a documentar no README quando criados)

```powershell
# Subir banco
docker compose up -d

# Backend
cd backend
dotnet ef database update --project src/SisConf.Infrastructure --startup-project src/SisConf.Api
dotnet run --project src/SisConf.Api

# Frontend
cd frontend
npm install
npm run dev
```

---

## 15. Plano de migração faseado

| Fase | Escopo | Critério de saída |
|---|---|---|
| **F0 Foundations** | Solution .NET, Docker compose, migrations iniciais, seed permissões/roles/planos, CI básico | `dotnet run` sobe, migrations rodam, seed popula |
| **F1 Auth + Tenant** | JWT, signup público, login, refresh, `TenantResolutionMiddleware`, `[HasPermission]`, landing básica | Tenant consegue signup + login |
| **F2 Cadastros** | `status`, `boxes`, `layouts` (catálogo + opt-in), `grupos`, `roles`, `usuarios` | Tenant configura seu fluxo completo |
| **F3 Conferência MVP** | Endpoint async + SignalR + fila IndexedDB + TTS + grid colorida + locking | Piloto com 1 cliente real funciona |
| **F4 Importação** | Upload, parsers (porta 1-pra-1 do legado), histórico, erros, enforcement de limite | Cliente importa arquivo real |
| **F5 Histórico + Relatórios** | Tabela eventos + filtros + jobs de relatório + migração histórico legado | Operação completa replicada |
| **F6 Billing** | Stripe integration + webhook + Customer Portal + suspensão automática | SaaS comercializável |
| **F7 Mobile API** | API pública versionada para mobile | Substitui MySQL legado |
| **F8 Refinamento** | SEO landing, observabilidade (Sentry/OTel), RLS Postgres, hardening | Pronto para escala |

---

## 16. Decisões locked

Estas decisões foram fechadas e não devem ser revisitadas sem nova discussão:

1. **Stack**: .NET 8 + EF Core + PostgreSQL + React 19 (Katalyst) + Stripe + SignalR
2. **Multi-tenant**: shared DB + shared schema + `tenant_id` + RLS Postgres + JWT claim
3. **Trial**: 14 dias completos (importação + conferência liberadas)
4. **Owner**: flag `eh_owner` em `usuario`; 1 por tenant; transferível; não excluível
5. **Roles**: 4 templates seed (Admin, Supervisor, Conferente, Importador); tenant customiza
6. **Planos**: Basic / Pro / Enterprise; limite em **importações/mês**; preços no Stripe
7. **Layouts**: catálogo global (`tenant_id NULL`), parsers em código, opt-in via tabela ponte
8. **Billing**: Stripe (não Cobrefacil); Customer Portal para o cliente
9. **Pagamento BR**: boleto + cartão + Pix (quando disponível na conta Stripe)
10. **TTS**: Web Speech API no browser; configurável por tenant
11. **Status**: configurável por tenant (cor, ordem, transições, TTS)
12. **Idempotência**: `client_event_id` UUID em toda conferência
13. **Locking**: `lock_session_id + lock_expires_at` + heartbeat SignalR (substitui FlBloqueio)
14. **Histórico**: tabela `pedido_evento` é source-of-truth; legado migrado uma única vez
15. **Landing**: rotas públicas no mesmo Vite (não Next.js separado)
16. **Áudio do BOX**: TTS dinâmico (não mais 80 WAVs estáticos)

---

## 17. Pontos abertos (a decidir antes ou durante implementação)

- Preços exatos de cada plano (definir antes de F6).
- Catálogo inicial de layouts a portar — quais dos 27 do legado ainda têm clientes ativos?
- Política de retenção de `auditoria_log` e `stripe_evento` (provavelmente 12 meses + arquivamento).
- Estratégia de backup do Postgres (Neon faz automaticamente; auto-host requer config).
- Tema visual da landing (cores, logo, copy).
- Domínio final do produto (`sysconf.app`? `sisconf.com.br`?).

---

## Apêndice A — Sistema legado (referência)

Localização: `sistema-de-conferencia/`. **Não alterar.**

Camadas:
- `App/` — WinForms (Form1 é o coração da conferência)
- `Negocio/` — boPedido, boUsuario, boSincronizarMobile, etc.
- `Persistencia/` — daPedido, daSincronizarMobile (SqlClient + Stored Procedures)
- `Entidade/` — voPedido, voBox, voLayout, voHistorico, etc.
- `Relatorio/` — PrintDocument para impressão

Pontos relevantes para consulta durante a migração:
- [Form1.cs:190-327](sistema-de-conferencia/App/Form1.cs#L190-L327) — `ChecarEtiqueta`, lógica
  central de bipagem que será replicada de forma assíncrona.
- [boPedido.cs:102-262](sistema-de-conferencia/Negocio/boPedido.cs#L102-L262) — switch
  por LayoutId que será convertido em `IPedidoImportParser`.
- [daSincronizarMobile.cs](sistema-de-conferencia/Persistencia/daSincronizarMobile.cs) —
  sync MySQL para o mobile, será aposentado (mobile passa a consumir API REST).
- [Util.cs](sistema-de-conferencia/App/Util.cs) — mapeamento de sons (substituído por TTS).
