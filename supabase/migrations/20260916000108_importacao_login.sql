-- =============================================================================
-- SysConf - Correcao do registro de importacao
-- Arquivo : supabase/migrations/20260916000108_importacao_login.sql
--
-- MOTIVO: a migracao 00107 foi aplicada e, no primeiro teste, a tela respondeu
--   record "v_sessao" has no field "login"
--
-- A tabela public.sessao guarda token, usuario_id, empresa_id, perfil, criado_em,
-- expira_em e ativo -- o LOGIN do usuario nao esta na sessao. O corpo do
-- importacao_registrar tentava ler v_sessao.login. Aqui a funcao e recriada
-- buscando o login em public.usuario (mesmo idioma usado por sessao_aberta, que
-- ja faz join com usuario).
--
-- Alem da correcao, este arquivo REPETE o backfill das importacoes antigas: os
-- pedidos que entraram sem vinculo (por causa do erro acima) passam a aparecer
-- na tela de Importacoes, agrupados por empresa + fabrica + nome do arquivo.
-- O backfill e idempotente: so olha pedidos com importacao_id nulo.
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. importacao_registrar corrigido (login vindo de public.usuario)
-- -----------------------------------------------------------------------------
create or replace function public.importacao_registrar(
    p_token              text,
    p_controle           integer,
    p_nome_arquivo       text,
    p_tamanho_bytes      integer,
    p_codificacao        text,
    p_linhas_lidas       integer,
    p_linhas_importadas  integer,
    p_linhas_descartadas integer,
    p_conteudo_base64    text
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao  public.sessao := public.sessao_aberta(p_token);
    v_nome    text := btrim(coalesce(p_nome_arquivo, ''));
    v_arquivo text := nullif(p_conteudo_base64, '');
    v_login   varchar(50);
    v_id      bigint;
begin
    if v_nome = '' or length(v_nome) > 255 then
        raise exception 'Nome de arquivo invalido.';
    end if;
    if not exists (
        select 1 from public.layout l
        where l.controle = p_controle and l.empresa_id = v_sessao.empresa_id
    ) then
        raise exception 'Fabrica invalida para esta empresa.' using errcode = 'P0002';
    end if;

    /* a sessao guarda o usuario_id, nao o login: o login vem da tabela usuario */
    select u.login::varchar(50) into v_login
      from public.usuario u
     where u.id = v_sessao.usuario_id;

    /* guarda o arquivo, mas nao aceita arquivo gigante no banco */
    if v_arquivo is not null and length(v_arquivo) > 5500000 then
        v_arquivo := null;
    end if;

    insert into public.importacao (
        empresa_id, layout_controle, nome_arquivo, tamanho_bytes, codificacao,
        linhas_lidas, linhas_importadas, linhas_descartadas,
        usuario_id, usuario_login, conteudo
    )
    values (
        v_sessao.empresa_id, p_controle, v_nome, greatest(coalesce(p_tamanho_bytes, 0), 0),
        coalesce(nullif(btrim(p_codificacao), ''), 'UTF-8'),
        greatest(coalesce(p_linhas_lidas, 0), 0),
        greatest(coalesce(p_linhas_importadas, 0), 0),
        greatest(coalesce(p_linhas_descartadas, 0), 0),
        v_sessao.usuario_id, v_login, v_arquivo
    )
    returning importacao.id into v_id;

    return v_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. BACKFILL (idempotente): pedidos sem vinculo ganham um cabecalho
-- -----------------------------------------------------------------------------
insert into public.importacao (
    empresa_id, layout_controle, nome_arquivo, linhas_importadas,
    usuario_login, criado_em, codificacao
)
select p.empresa_id,
       p.idlayout,
       p.arquivo,
       count(*),
       'sistema antigo',
       min(p.datainc),
       'NAO GUARDADO'
from public.pedido p
where p.importacao_id is null
  and p.arquivo is not null
  and btrim(p.arquivo) <> ''
group by p.empresa_id, p.idlayout, p.arquivo;

update public.pedido p
   set importacao_id = i.id
  from public.importacao i
 where p.importacao_id is null
   and i.empresa_id = p.empresa_id
   and i.layout_controle = p.idlayout
   and i.nome_arquivo = p.arquivo;


-- -----------------------------------------------------------------------------
-- 3. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.importacao_registrar(text, integer, text, integer, text, integer, integer, integer, text) from public;
grant execute on function public.importacao_registrar(text, integer, text, integer, text, integer, integer, integer, text) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- -- 1) quantos pedidos ficaram sem vinculo (deve ser 0):
-- select count(*) as pedidos_sem_importacao from public.pedido where importacao_id is null;
--
-- -- 2) como ficou a tela de Importacoes:
-- select i.id, l.nome as fabrica, i.nome_arquivo, i.linhas_importadas,
--        i.usuario_login, i.codificacao, i.criado_em,
--        (select count(*) from public.pedido p where p.importacao_id = i.id) as pedidos,
--        (i.conteudo is not null) as tem_arquivo
--   from public.importacao i
--   join public.layout l on l.controle = i.layout_controle
--  order by i.criado_em desc
--  limit 10;
