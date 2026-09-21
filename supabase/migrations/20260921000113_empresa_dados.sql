-- =============================================================================
-- SysConf - Dados da empresa logada (tela "Dados da empresa")
-- Arquivo : supabase/migrations/20260921000113_empresa_dados.sql
--
-- OBJETIVO (pedido do cliente): o administrador da empresa passa a corrigir os
-- dados cadastrais da PROPRIA empresa pela tela, sem abrir chamado.
--
-- O QUE PODE MUDAR: nome, responsavel e e-mail de contato.
--
-- *** O SLUG NAO MUDA *** (esta e a regra pedida). O slug e o link de acesso
-- (/sysconf/<slug>) que a equipe do cliente ja tem salvo, colado no atalho da
-- area de trabalho e enviado aos operadores. Trocar o endereco quebraria todos
-- esses links de uma vez, entao a funcao de gravacao simplesmente NAO recebe
-- esse campo — nao ha como altera-lo por aqui.
--
-- O QUE FICA DE FORA DE PROPOSITO (continua com a Softwerd, pelo SQL Editor):
--   * `ativo`      -> liga/desliga a empresa (suspensao);
--   * `trial_ate`  -> prazo do teste gratis (se o cliente pudesse editar, o
--                     teste seria eterno);
--   * `log_retencao_dias` -> ja tem tela propria em Logs de conferencia.
-- A tela mostra esses tres campos apenas como informacao.
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. LEITURA (ADMIN da empresa)
-- -----------------------------------------------------------------------------
create or replace function public.empresa_dados(p_token text)
returns table (
    id                 bigint,
    slug               varchar,
    nome               varchar,
    ativo              integer,
    criado_em          timestamp,
    responsavel        varchar,
    email_contato      varchar,
    trial_ate          timestamptz,
    log_retencao_dias  integer,
    usuarios           bigint,
    fabricas           bigint,
    pedidos            bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    perform public.exigir_admin(v_sessao);

    return query
        select e.id,
               e.slug,
               e.nome,
               e.ativo,
               e.criado_em,
               e.responsavel,
               e.email_contato,
               e.trial_ate,
               e.log_retencao_dias,
               (select count(*) from public.usuario u where u.empresa_id = e.id)::bigint,
               (select count(*) from public.layout l where l.empresa_id = e.id)::bigint,
               (select count(*) from public.pedido p where p.empresa_id = e.id)::bigint
          from public.empresa e
         where e.id = v_sessao.empresa_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. GRAVACAO (ADMIN da empresa) — sem o slug, por decisao do cliente
-- -----------------------------------------------------------------------------
create or replace function public.empresa_atualizar(
    p_token         text,
    p_nome          text,
    p_responsavel   text default null,
    p_email_contato text default null
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome   text := btrim(coalesce(p_nome, ''));
    v_resp   varchar(120) := nullif(btrim(coalesce(p_responsavel, '')), '');
    v_email  varchar(160) := nullif(btrim(coalesce(p_email_contato, '')), '');
begin
    perform public.exigir_admin(v_sessao);

    if length(v_nome) < 2 or length(v_nome) > 120 then
        raise exception 'Informe o nome da empresa (de 2 a 120 caracteres).';
    end if;

    if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'E-mail de contato inválido: "%".', v_email;
    end if;

    /* NOTE: nenhuma referencia a `slug` de proposito — o link de acesso
       (/sysconf/<slug>) e imutavel por aqui. */
    update public.empresa e
       set nome          = v_nome,
           responsavel   = v_resp,
           email_contato = v_email
     where e.id = v_sessao.empresa_id;

    if not found then
        raise exception 'Empresa da sessao nao encontrada.' using errcode = 'P0002';
    end if;

    return 1;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.empresa_dados(text) from public;
revoke all on function public.empresa_atualizar(text, text, text, text) from public;
grant execute on function public.empresa_dados(text) to anon, authenticated;
grant execute on function public.empresa_atualizar(text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- select * from public.empresa_dados('<token>');
-- select public.empresa_atualizar('<token>', 'Novo Mundo', 'Fulano', 'compras@empresa.com.br');
--
-- ROLLBACK
-- drop function if exists public.empresa_dados(text);
-- drop function if exists public.empresa_atualizar(text, text, text, text);
