-- =============================================================================
-- SysConf - Inclusão da tabela BOX
-- Arquivo : supabase/migrations/20260914000003_incluir_tabela_box.sql
--
-- Contexto (inventário do código):
--   * App/Form1.Designer.cs tem a coluna "BOX" no grid e App/Models/Pedido.cs tem Box/NmBox.
--   * Entidade/voPedido.cs possui NmBox (string) e IdBox (int).
--   * Entidade/voPedidoImportBulk.cs (payload do InserirBulk) envia IdBox = 1 em TODOS os
--     parsers de Negocio/boPedido.cs; por isso o caixa 1 é obrigatório na carga inicial.
--   * Nomes das colunas seguem o padrão legado, apenas em minúsculo (o cliente converte
--     NmBox -> nmbox e IdBox -> idbox em Persistencia/ApiExtensions.cs).
--
-- Aplicar depois da 20260914000002 (substituição do schema).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. TABELA
-- -----------------------------------------------------------------------------
create table if not exists public.box (
    idbox integer      not null,                 -- = PEDIDO.IdBox / voPedido.IdBox
    nmbox varchar(60)  not null,                 -- = voPedido.NmBox (nome exibido no grid)
    ativo integer      not null default 1,       -- mesmo padrão de LAYOUT.FlAtivo
    constraint pk_box primary key (idbox)
);


-- -----------------------------------------------------------------------------
-- 2. CARGA INICIAL
-- O legado grava IdBox = 1 em toda importação, então o caixa 1 precisa existir.
-- -----------------------------------------------------------------------------
insert into public.box (idbox, nmbox, ativo) values
    (1, 'Box 01', 1),
    (2, 'Box 02', 1),
    (3, 'Box 03', 1)
on conflict (idbox) do nothing;


-- -----------------------------------------------------------------------------
-- 3. PERMISSÕES (o app usa a chave publishable -> role anon)
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.box to anon, authenticated, service_role;
alter table public.box disable row level security;


-- -----------------------------------------------------------------------------
-- 4. ÍNDICES
-- Sem FK: no banco legado PEDIDO.IdBox era um inteiro solto (nem sempre havia o cadastro),
-- então o vínculo é mantido apenas por índice para não quebrar as importações existentes.
-- -----------------------------------------------------------------------------
create index if not exists ix_pedido_idbox on public.pedido (idbox);


-- -----------------------------------------------------------------------------
-- 5. VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- select * from public.box order by idbox;
-- select c.column_name, c.data_type from information_schema.columns c
--   where c.table_schema='public' and c.table_name='box' order by c.ordinal_position;
-- O cliente monta: GET {url}/rest/v1/box?select=idbox,nmbox&ativo=eq.1&order=nmbox


-- -----------------------------------------------------------------------------
-- 6. ROLLBACK
-- -----------------------------------------------------------------------------
-- drop index if exists public.ix_pedido_idbox;
-- drop table if exists public.box;
