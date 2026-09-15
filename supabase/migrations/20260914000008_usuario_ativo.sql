-- =============================================================================
-- SysConf - Ativação/inativação de usuário + login por empresa respeitando isso
-- Arquivo : supabase/migrations/20260914000008_usuario_ativo.sql
--
-- A tela de gestão de usuários (empresa logada) precisa inativar um usuário sem
-- apagá-lo. Por isso a coluna `ativo` e o ajuste do RPC de login.
-- =============================================================================

alter table public.usuario add column if not exists ativo boolean not null default true;

-- usuários criados antes desta migração ficam ativos
update public.usuario set ativo = true where ativo is null;


-- -----------------------------------------------------------------------------
-- Login por empresa passa a exigir usuário ativo
-- -----------------------------------------------------------------------------
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
      and u.ativo
      and lower(u.login) = lower(btrim(coalesce(p_login, '')))
      and u.senha = coalesce(p_senha, '')
    limit 1;
$$;

revoke all on function public.login_usuario(text, text, text) from public;
grant execute on function public.login_usuario(text, text, text) to anon, authenticated;


-- -----------------------------------------------------------------------------
-- VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- select login, perfil, ativo from public.usuario order by empresa_id, login;
-- select * from public.login_usuario('novomundo','OPERADOR','trocar@123');  -- com ativo=false deve voltar vazio


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- alter table public.usuario drop column if exists ativo;
