-- =============================================================================
-- SysConf - RPC de login para o app web
-- Arquivo : supabase/migrations/20260914000005_rpc_login_usuario.sql
--
-- Por que existe:
--   No WinForms o login é `SELECT COUNT(*) FROM USUARIO WHERE LOGIN='..' AND SENHA='..'`
--   (App/FormLogin.cs:113), ou seja, a senha viaja na URL e a coluna `usuario.senha`
--   é lida com a chave publishable.
--   No navegador isso é pior (a chave é visível), então o app web autentica por esta
--   função SECURITY DEFINER: a senha vai no corpo do POST e o cliente recebe apenas
--   id/login/nome/nivel — nunca a coluna `senha`.
--
-- O app web chama: POST /rest/v1/rpc/login_usuario  {"p_login":"ADMIN","p_senha":"..."}
-- Compatível com o WinForms, que continua usando a consulta direta na tabela.
-- =============================================================================

create or replace function public.login_usuario(p_login text, p_senha text)
returns table (
    id    bigint,
    login varchar,
    nome  varchar,
    nivel varchar
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select u.id, u.login, u.nome, u.nivel
    from public.usuario u
    where lower(u.login) = lower(btrim(coalesce(p_login, '')))
      and u.senha = coalesce(p_senha, '')
    limit 1;
$$;

comment on function public.login_usuario(text, text) is
    'Autentica pelo cadastro legado (usuario.login/senha) sem expor a coluna senha ao cliente.';

revoke all on function public.login_usuario(text, text) from public;
grant execute on function public.login_usuario(text, text) to anon, authenticated;


-- -----------------------------------------------------------------------------
-- VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- select * from public.login_usuario('ADMIN', 'trocar@123');   -- deve retornar 1 linha
-- select * from public.login_usuario('ADMIN', 'errada');       -- deve retornar 0 linhas


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- drop function if exists public.login_usuario(text, text);
