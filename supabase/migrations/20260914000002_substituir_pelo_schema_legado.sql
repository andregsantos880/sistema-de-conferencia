-- =============================================================================
-- SysConf - SUBSTITUIÇÃO do schema do Supabase pelo schema LEGADO do sistema
-- Arquivo : supabase/migrations/20260914000002_substituir_pelo_schema_legado.sql
--
-- O que este script faz:
--   1) Copia as tabelas atuais para o schema de backup `backup_saas_20260914`;
--   2) DROPA o modelo SaaS atual (tenant / usuario com email+hash / pedido com uuid ...);
--   3) CRIA o schema LEGADO que o WinForms realmente consulta:
--        usuario (login, senha, nivel, nome)
--        layout  (controle, nome, flativo)
--        pedido  (id, arquivo, produto, volume, ...)
--   4) Concede permissões de leitura/escrita para as chaves do Supabase (anon);
--   5) Popula o cadastro de fábricas (LAYOUT) e um usuário de teste.
--
-- -----------------------------------------------------------------------------
-- AVISOS (leia antes de aplicar)
-- -----------------------------------------------------------------------------
-- [1] DESTRUTIVO. O modelo SaaS atual é removido. Um BACKUP é criado no schema
--     `backup_saas_20260914` antes dos DROP, então os dados ficam recuperáveis
--     (ver seção 7 - Rollback).
-- [2] Existe uma tabela `__EFMigrationsHistory` no public: ou seja, há um
--     backend EF Core (fora deste repositório) que usa este banco. Ele deixará
--     de funcionar com esta substituição.
-- [3] `usuario.senha` fica em TEXTO PLANO porque o legado compara a senha
--     digitada direto no filtro da URL (`...&senha=eq.<senha>`) — ver
--     App/FormLogin.cs:113. Consequência: quem tiver a chave publishable lê as
--     senhas. Trate a chave como segredo e/ou migre o login para RPC no futuro.
--
-- Como aplicar: Supabase CLI (`supabase db push`) ou SQL Editor (colar tudo).
-- Pré-requisito: nenhuma outra aplicação gravando nestas tabelas no momento.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. BACKUP do modelo atual (schema separado, não interfere no public)
-- -----------------------------------------------------------------------------
create schema if not exists backup_saas_20260914;

do $backup$
declare
    r record;
begin
    for r in select tablename from pg_tables where schemaname = 'public' order by tablename
    loop
        execute format('create table if not exists backup_saas_20260914.%I as select * from public.%I',
                       r.tablename, r.tablename);
    end loop;
    raise notice 'Backup concluido em backup_saas_20260914';
end
$backup$;


-- -----------------------------------------------------------------------------
-- 2. REMOÇÃO do modelo SaaS atual
-- Mantém o schema `public` e as RPCs de fallback do cliente
-- (exec_sql / exec_dml / exec_scalar), que continuam sendo usadas pelo tradutor.
-- -----------------------------------------------------------------------------
do $drop$
declare
    r record;
begin
    -- 2.1 views
    for r in select viewname from pg_views where schemaname = 'public'
    loop
        execute format('drop view if exists public.%I cascade', r.viewname);
    end loop;

    -- 2.2 tabelas (inclui __EFMigrationsHistory e as FKs/índices "cascade")
    for r in select tablename from pg_tables where schemaname = 'public'
    loop
        execute format('drop table if exists public.%I cascade', r.tablename);
    end loop;

    -- 2.3 sequences órfãs
    for r in select sequence_name from information_schema.sequences where sequence_schema = 'public'
    loop
        execute format('drop sequence if exists public.%I cascade', r.sequence_name);
    end loop;

    -- 2.4 funções do modelo SaaS (preserva as 3 RPCs do tradutor)
    for r in select p.oid::regprocedure::text as assinatura
             from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public'
               and p.proname not in ('exec_sql', 'exec_dml', 'exec_scalar')
    loop
        execute 'drop function if exists ' || r.assinatura || ' cascade';
    end loop;
end
$drop$;


-- =============================================================================
-- 3. SCHEMA LEGADO
-- Nomes exatamente como o SQL do sistema usa, apenas em minúsculo (o PostgreSQL
-- dobra identificadores não citados). O cliente WinForms converte
-- MAIÚSCULO/PascalCase -> minúsculo em Persistencia/ApiExtensions.cs.
-- =============================================================================

-- 3.1 LAYOUT  (fábricas / formatos de arquivo)  -> "SELECT NOME, CONTROLE FROM LAYOUT WHERE LAYOUT.FlAtivo = 1 ORDER BY NOME"
create table if not exists public.layout (
    controle integer      not null,                 -- App/Models/Fabrica.cs: Controle (int) - é a FK de pedido.idlayout
    nome     varchar(60)  not null,                 -- Fabrica.Nome
    flativo  integer      not null default 1,       -- WHERE LAYOUT.FlAtivo = 1 (numérico, não boolean!)
    constraint pk_layout primary key (controle)
);

-- 3.2 USUARIO  -> "SELECT COUNT(*) FROM USUARIO WHERE LOGIN='..' AND SENHA='..'"
create table if not exists public.usuario (
    id    bigint       not null generated by default as identity,
    login varchar(50)  not null,                    -- Entidade/voUsuario.cs: LOGIN
    senha varchar(50)  not null,                    -- texto plano (ver AVISO [3])
    nivel varchar(20),                              -- voUsuario.NIVEL
    nome  varchar(80),                              -- voUsuario.NOME
    constraint pk_usuario primary key (id)
);
create unique index if not exists ux_usuario_login on public.usuario (lower(login));

-- 3.3 PEDIDO
--     Colunas = união de: SQL do App (Form1/TabeLayo), Entidade/voPedido.cs,
--     Entidade/voPedidoImportBulk.cs (PedidoImport - payload do InserirBulk)
--     e Entidade/Models/Pedido.cs.
--     `id` NÃO é enviado pelo cliente -> gerado pelo banco (identity).
create table if not exists public.pedido (
    id           bigint       not null generated by default as identity,
    arquivo      varchar(255),                      -- PEDIDO.ARQUIVO (nome do arquivo importado + Guid)
    ordcompra    varchar(30),                       -- PEDIDO.ORDCOMPRA
    cliente      varchar(70),                       -- PEDIDO.CLIENTE
    pecliente    varchar(30),                       -- PEDIDO.PECLIENTE
    produto      varchar(70),                       -- PEDIDO.PRODUTO
    descricao1   varchar(80),                       -- PEDIDO.DESCRICAO1
    qtde         numeric(18,3)  default 0,          -- PEDIDO.QTDE
    etiqueta     varchar(50),                       -- PEDIDO.ETIQUETA (chave lógica da conferência)
    volume       numeric(18,3)  default 0,          -- PEDIDO.VOLUME
    sequencia    numeric(18,3)  default 0,          -- PEDIDO.SEQUENCIA
    status       integer        not null default 0, -- PEDIDO.STATUS: 0=Normal 1=Conferência 2=Saída 3=Entrega
    datainc      timestamp      not null default now(), -- PEDIDO.DATAINC
    idlayout     integer,                           -- PEDIDO.IdLayout  -> layout.controle
    idbox        integer        not null default 1, -- PEDIDO.IdBox (legado sempre 1)
    flbloqueio   boolean        not null default false, -- PEDIDO.FlBloqueio
    pecomputador varchar(60),                       -- PEDIDO.PECOMPUTADOR (só leitura)
    pecoletor    varchar(60),                       -- só DTO PedidoImport (nunca preenchido)
    codcliente   varchar(30),                       -- só DTO PedidoImport (nunca preenchido)
    volume2      numeric(18,3),                     -- só DTO PedidoImport (nunca preenchido)
    idgrupo      integer,                           -- só DTO voPedido
    constraint pk_pedido primary key (id),
    constraint fk_pedido_layout foreign key (idlayout) references public.layout (controle)
);

create index if not exists ix_pedido_idlayout  on public.pedido (idlayout);
create index if not exists ix_pedido_etiqueta  on public.pedido (etiqueta);
create index if not exists ix_pedido_status    on public.pedido (status);
create index if not exists ix_pedido_arquivo   on public.pedido (arquivo);
create index if not exists ix_pedido_datainc   on public.pedido (datainc);


-- -----------------------------------------------------------------------------
-- 4. PERMISSÕES (Supabase)
-- O app usa a chave publishable -> role `anon`. Sem estes GRANTs o PostgREST
-- devolve 401/403 ou lista vazia.
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables    in schema public to anon, authenticated, service_role;
grant usage, select                  on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
    grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
    grant usage, select on sequences to anon, authenticated, service_role;

-- RLS desabilitado (comportamento idêntico ao banco legado, que não tinha RLS).
-- ATENÇÃO: é isto que permite o app filtrar por senha via URL. Ver AVISO [3].
alter table public.usuario disable row level security;
alter table public.layout  disable row level security;
alter table public.pedido  disable row level security;


-- -----------------------------------------------------------------------------
-- 5. CARGA INICIAL
-- -----------------------------------------------------------------------------

-- 5.1 Fábricas (LAYOUT). `controle` preserva a ordem alfabética do cadastro atual.
insert into public.layout (controle, nome, flativo) values
    ( 1, 'Bartzen',     1),
    ( 2, 'Criare',      1),
    ( 3, 'CSV Padrão',  1),
    ( 4, 'DalMobile',   1),
    ( 5, 'Evviva',      1),
    ( 6, 'HRM',         1),
    ( 7, 'Italinea',    1),
    ( 8, 'Jaeli',       1),
    ( 9, 'Kasak',       1),
    (10, 'Manfroi',     1),
    (11, 'Marel',       1),
    (12, 'Romanzza',    1),
    (13, 'SCA',         1),
    (14, 'Simonetto',   1),
    (15, 'Todeschini',  1),
    (16, 'Unicasa',     1),
    (17, 'Vivatto',     1)
on conflict (controle) do nothing;

-- 5.2 Usuário de teste.
-- TODO: trocar a senha imediatamente e cadastrar os usuários reais
--       (login digitado exatamente como será digitado na tela de login).
insert into public.usuario (login, senha, nivel, nome) values
    ('ADMIN', 'trocar@123', 'ADMIN', 'Administrador')
on conflict do nothing;

-- 5.3 Usuários reais (modelo) - descomente e ajuste:
-- insert into public.usuario (login, senha, nivel, nome) values
--     ('GVS001',  'senha1', 'OPERADOR', 'Operador Novo Rumo'),
--     ('RAFAEL',  'senha2', 'ADMIN',    'Rafael Italiplan')
-- on conflict do nothing;


-- -----------------------------------------------------------------------------
-- 6. VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- 6.1 Estrutura criada:
-- select table_name, string_agg(column_name, ', ' order by ordinal_position) as colunas
-- from information_schema.columns
-- where table_schema = 'public' group by table_name order by table_name;

-- 6.2 Backup íntegro (deve listar as 23 tabelas do modelo antigo):
-- select tablename, (select count(*) from information_schema.columns c
--                    where c.table_schema='backup_saas_20260914' and c.table_name=t.tablename) as colunas
-- from pg_tables t where schemaname = 'backup_saas_20260914' order by tablename;

-- 6.3 Simulação das URLs que o cliente vai montar
--     (Persistencia/ApiExtensions.cs converte MAIÚSCULO -> minúsculo):
--   SELECT NOME, CONTROLE FROM LAYOUT WHERE LAYOUT.FlAtivo = 1 ORDER BY NOME
--      -> POST {url}/rest/v1/layout?select=nome,controle&flativo=eq.1&order=nome
--   SELECT COUNT(*) FROM USUARIO WHERE LOGIN='ADMIN' AND SENHA='trocar@123';
--      -> GET  {url}/rest/v1/usuario?select=login&login=eq.ADMIN&senha=eq.trocar%40123  (Prefer: count=exact)
--   UPDATE PEDIDO SET STATUS=1 where ID IN(1,2)
--      -> PATCH {url}/rest/v1/pedido?id=in.(1,2)  body {"status":1}
--   SELECT PEDIDO.*, LAYOUT.Nome AS Nmlayout FROM PEDIDO JOIN LAYOUT ... (tem JOIN)
--      -> cai no fallback RPC: POST {url}/rest/v1/rpc/exec_sql  {"sql_query":"<sql original>"}


-- -----------------------------------------------------------------------------
-- 7. ROLLBACK (volta o modelo SaaS copiado para backup_saas_20260914)
-- -----------------------------------------------------------------------------
-- do $roll$
-- declare r record;
-- begin
--     -- 7.1 remove o schema legado
--     execute 'drop table if exists public.pedido  cascade';
--     execute 'drop table if exists public.layout  cascade';
--     execute 'drop table if exists public.usuario cascade';
--     -- 7.2 restaura cada tabela do backup
--     for r in select tablename from pg_tables where schemaname = 'backup_saas_20260914'
--     loop
--         execute format('create table public.%I as select * from backup_saas_20260914.%I',
--                        r.tablename, r.tablename);
--     end loop;
--     raise notice 'Modelo SaaS restaurado a partir do backup (sem PK/FK/índices).';
-- end
-- $roll$;
