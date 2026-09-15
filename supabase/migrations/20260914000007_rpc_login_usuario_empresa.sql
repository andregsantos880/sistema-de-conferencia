-- =============================================================================
-- SysConf - Login por empresa (RPC) para o app web
-- Arquivo : supabase/migrations/20260914000007_rpc_login_usuario_empresa.sql
--
-- A empresa vem da URL (/sysconf/<slug>/login). O login passa a validar que o
-- usuário pertence àquela empresa e devolve o perfil (ADMIN | OPERADOR), que o
-- front usa para decidir a visibilidade da coluna de código de barras.
--
-- Substitui a versão anterior login_usuario(p_login, p_senha) — a assinatura
-- antiga é removida para não haver ambiguidade no PostgREST.
--
-- Chamada: POST /rest/v1/rpc/login_usuario
--          {"p_empresa":"novomundo","p_login":"ADMIN","p_senha":"..."}
-- =============================================================================

drop function if exists public.login_usuario(text, text);

create or replace function public.login_usuario(p_empresa text, p_login text, p_senha text)
returns table (
    id           bigint,
    login        varchar,
    nome         varchar,
    perfil       varchar,
    empresa_id   bigint,
    empresa_slug varchar,
    empresa_nome varchar
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select u.id,
           u.login,
           u.nome,
           coalesce(u.perfil, 'OPERADOR') as perfil,
           e.id,
           e.slug,
           e.nome
    from public.usuario u
    join public.empresa e on e.id = u.empresa_id
    where lower(e.slug) = lower(btrim(coalesce(p_empresa, '')))
      and e.ativo = 1
      and lower(u.login) = lower(btrim(coalesce(p_login, '')))
      and u.senha = coalesce(p_senha, '')
    limit 1;
$$;

comment on function public.login_usuario(text, text, text) is
    'Login do app web: valida usuário dentro da empresa (slug da URL) e devolve o perfil.';

revoke all on function public.login_usuario(text, text, text) from public;
grant execute on function public.login_usuario(text, text, text) to anon, authenticated;


-- -----------------------------------------------------------------------------
-- VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- select * from public.login_usuario('novomundo',  'ADMIN',    'trocar@123');  -- ADMIN da Novo Mundo
-- select * from public.login_usuario('novomundo',  'OPERADOR', 'trocar@123');  -- OPERADOR da Novo Mundo
-- select * from public.login_usuario('homologacao','ADMIN',    'trocar@123');  -- ADMIN da Homologação
-- select * from public.login_usuario('novomundo',  'ADMIN',    'errada');      -- 0 linhas
-- select * from public.login_usuario('inexistente','ADMIN',    'trocar@123');  -- 0 linhas


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- drop function if exists public.login_usuario(text, text, text);
-- (a versão anterior de 2 parâmetros está preservada em 20260914000005)
