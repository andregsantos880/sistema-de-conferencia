-- =============================================================================
-- SysConf - Fecha o acesso direto as tabelas (parte 2 — PENDENTE DE APLICACAO)
-- Arquivo : supabase/migrations/20260914000103_fechar_acesso_direto_tabelas.sql
--
-- ############################################################################
-- # NAO APLICAR COM O WinForms EM USO.                                       #
-- ############################################################################
--   O WinForms fala com o PostgREST usando a chave publishable (role `anon`) e
--   depende de SELECT/INSERT/UPDATE direto nas tabelas — inclusive LE
--   USUARIO.SENHA para comparar LOGIN/SENHA no login dele. Sem esses GRANTs ele
--   recebe 401/403 e para de funcionar.
--
--   Aplicar SOMENTE depois de confirmado que o WinForms foi desativado, pelo
--   SQL Editor do Supabase (depois da migracao 00102 o caminho por REST nao
--   existe mais).
--
-- O que falta fechar (medido em 15/09 com a chave publishable):
--   * `select login, senha from usuario`            -> PERMITIDO hoje
--   * ler pedido de OUTRA empresa                   -> PERMITIDO hoje
--   * `POST /usuario` criando um ADMIN              -> PERMITIDO hoje
--   * `DELETE /pedido`                              -> PERMITIDO hoje
--
-- Como aplicar: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo
-- (sem os comentarios de rollback) -> Run. Depois conferir os itens de
-- VERIFICACAO no fim do arquivo.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. RLS: nega tudo para anon/authenticated
--    Sem policy = ninguem passa (menos o dono `postgres`, que e quem executa os
--    RPCs SECURITY DEFINER, e quem tem BYPASSRLS).
-- -----------------------------------------------------------------------------
alter table public.empresa          enable row level security;
alter table public.usuario          enable row level security;
alter table public.pedido           enable row level security;
alter table public.layout           enable row level security;
alter table public.box              enable row level security;
alter table public.catalogo_fabrica enable row level security;
alter table public.sessao           enable row level security;   -- ja estava


-- -----------------------------------------------------------------------------
-- 2. REVOGA OS GRANTS DE TABELA E SEQUENCIA
-- -----------------------------------------------------------------------------
revoke all on table public.empresa          from anon, authenticated;
revoke all on table public.usuario          from anon, authenticated;
revoke all on table public.pedido           from anon, authenticated;
revoke all on table public.layout           from anon, authenticated;
revoke all on table public.box              from anon, authenticated;
revoke all on table public.catalogo_fabrica from anon, authenticated;
revoke all on table public.sessao           from anon, authenticated;

revoke all on all sequences in schema public from anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- 1) GET /rest/v1/usuario?select=login,senha   -> deve falhar (401/403)
-- 2) GET /rest/v1/pedido?select=id             -> deve falhar
-- 3) POST /rest/v1/empresa (body qualquer)     -> deve falhar
-- 4) app web: login, grid, bipe, importacao, usuarios, busca, autocadastro -> OK
-- 5) estado no banco:
--      select relname, relrowsecurity from pg_class
--       where relnamespace = 'public'::regnamespace and relkind = 'r';
--      select grantee, privilege_type from information_schema.role_table_grants
--       where table_schema = 'public' and grantee in ('anon','authenticated');


-- -----------------------------------------------------------------------------
-- ROLLBACK (reabre o acesso direto — religa o WinForms)
-- -----------------------------------------------------------------------------
-- grant select, insert, update, delete on public.empresa          to anon, authenticated;
-- grant select, insert, update, delete on public.usuario          to anon, authenticated;
-- grant select, insert, update, delete on public.pedido           to anon, authenticated;
-- grant select, insert, update, delete on public.layout           to anon, authenticated;
-- grant select, insert, update, delete on public.box              to anon, authenticated;
-- grant select on public.catalogo_fabrica to anon, authenticated;
-- grant usage, select on all sequences in schema public to anon, authenticated;
-- alter table public.empresa  disable row level security;
-- alter table public.usuario  disable row level security;
-- alter table public.pedido   disable row level security;
-- alter table public.layout   disable row level security;
-- alter table public.box      disable row level security;
-- alter table public.catalogo_fabrica disable row level security;
