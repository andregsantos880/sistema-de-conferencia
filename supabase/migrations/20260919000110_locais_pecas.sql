-- =============================================================================
-- SysConf - Locais das pecas (onde a peca deve ficar, por estagio)
-- Arquivo : supabase/migrations/20260919000110_locais_pecas.sql
--
-- OBJETIVO (pedido do cliente): o "local" e o lugar fisico onde a peca deve
-- ficar (Box 01, Prateleira superior, Piso...). Cada peca tem UM LOCAL POR
-- ESTAGIO (1=CONFERENCIA, 2=SAIDA, 3=ENTREGA) -- ao bipar, o operador sabe
-- onde colocar.
--
--   * CADASTRO: a tabela `box` (idbox, nmbox, ativo, empresa_id) ja existia e
--     passa a ser o cadastro de locais, agora com tela de criar/renomear/
--     ativar/desativar (so ADMIN). Basta o NOME.
--   * VINCULO: `pedido_local` = uma linha por (peca, estagio) dizendo onde ela
--     fica naquele estagio.
--   * IMPORTACAO: o local e escolhido na propria lista de grupos (a ORD.COMPRA
--     inteira e o agrupamento -- um cliente pode ter varios pedidos) e aplicado
--     a todas as pecas do grupo.
--   * POS-IMPORTACAO: o ADMIN reajusta o local das pecas ja carregadas, com
--     filtros e aplicacao em massa.
--   * ALTERACAO DE LOCAL NAO ENTRA NO LOG DE CONFERENCIA (decisao do cliente):
--     o log continua so com bipagem e alteracao de status.
--
-- COMPATIBILIDADE: `pedido.idbox` fica INTOCADO (o sistema antigo grava
-- IdBox = 1 e nao vamos mexer nele). O backfill abaixo copia esse valor para os
-- tres estagios das pecas que ja estavam na base, para nada regredir na tela.
--
-- Armadilha conhecida: `box.idbox` e PK GLOBAL (nao (empresa_id, idbox)) --
-- por isso `local_criar` gera o proximo id sob advisory lock, igual ao catalogo
-- de fabricas.
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
--               (aplique DEPOIS da 20260919000109_log_conferencia.sql)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. VINCULO PECA x ESTAGIO x LOCAL
-- -----------------------------------------------------------------------------
create table if not exists public.pedido_local (
    pedido_id     bigint       not null references public.pedido (id) on delete cascade,
    estagio       integer      not null,              -- 1=CONFERENCIA 2=SAIDA 3=ENTREGA
    idbox         integer      not null references public.box (idbox),
    empresa_id    bigint       not null references public.empresa (id) on delete cascade,
    definido_por  varchar(50),
    atualizado_em timestamp    not null default now(),
    constraint pk_pedido_local primary key (pedido_id, estagio),
    constraint ck_pedido_local_estagio check (estagio between 1 and 3)
);

comment on table public.pedido_local is
    'Local (lugar fisico) onde cada peca deve ficar, por estagio: 1=CONFERENCIA, 2=SAIDA, 3=ENTREGA.';
comment on column public.pedido_local.definido_por is
    'Login de quem definiu o local (ou "sistema antigo" no backfill). Alteracao de local nao vai para o log de conferencia.';

alter table public.pedido_local enable row level security;
revoke all on table public.pedido_local from anon, authenticated;

create index if not exists ix_pedido_local_box     on public.pedido_local (idbox);
create index if not exists ix_pedido_local_empresa on public.pedido_local (empresa_id, estagio);

/* o cadastro de locais nao pode ter dois nomes iguais na mesma empresa */
create unique index if not exists ux_box_empresa_nome on public.box (empresa_id, lower(nmbox));


-- -----------------------------------------------------------------------------
-- 2. BACKFILL: as pecas que ja estao na base herdam o box do sistema antigo
-- -----------------------------------------------------------------------------
insert into public.pedido_local (pedido_id, estagio, idbox, empresa_id, definido_por)
select p.id, e.estagio, coalesce(p.idbox, 1), p.empresa_id, 'sistema antigo'
  from public.pedido p
  cross join (values (1), (2), (3)) as e(estagio)
 where p.empresa_id is not null
   and exists (select 1 from public.box b where b.idbox = coalesce(p.idbox, 1))
on conflict (pedido_id, estagio) do nothing;


-- -----------------------------------------------------------------------------
-- 3. GRAVACAO INTERNA (aplica um local a todas as pecas que casam com o filtro)
-- -----------------------------------------------------------------------------
/**
 * Insere/atualiza o local de UM estagio para todas as pecas do filtro.
 * Filtros vazios (null/'') sao ignorados. Devolve quantas pecas foram atingidas.
 */
create or replace function public.local_aplicar(
    p_empresa_id    bigint,
    p_login         varchar,
    p_idlayout      integer,
    p_estagio       integer,
    p_idbox         integer,
    p_ordcompra     text,
    p_cliente       text,
    p_etiqueta      text,
    p_importacao_id bigint,
    p_status        integer,
    p_sem_local     boolean
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_total integer;
begin
    insert into public.pedido_local (pedido_id, estagio, idbox, empresa_id, definido_por, atualizado_em)
    select p.id, p_estagio, p_idbox, p_empresa_id, p_login, now()
      from public.pedido p
     where p.empresa_id = p_empresa_id
       and p.idlayout = p_idlayout
       and (p_ordcompra     is null or btrim(p_ordcompra) = '' or p.ordcompra = btrim(p_ordcompra))
       and (p_cliente       is null or btrim(p_cliente) = ''   or p.cliente  ilike '%' || btrim(p_cliente) || '%')
       and (p_etiqueta      is null or btrim(p_etiqueta) = ''  or p.etiqueta ilike '%' || btrim(p_etiqueta) || '%')
       and (p_importacao_id is null or p.importacao_id = p_importacao_id)
       and (p_status        is null or p.status = p_status)
       and (not coalesce(p_sem_local, false)
            or not exists (select 1 from public.pedido_local pl
                            where pl.pedido_id = p.id and pl.estagio = p_estagio))
    on conflict (pedido_id, estagio)
    do update set idbox = excluded.idbox,
                  definido_por = excluded.definido_por,
                  atualizado_em = now();

    get diagnostics v_total = row_count;
    return v_total;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. CADASTRO DE LOCAIS (leitura livre; escrita so ADMIN)
-- -----------------------------------------------------------------------------
/** Locais da empresa. */
create or replace function public.locais_listar(p_token text)
returns table (
    idbox   integer,
    nmbox   varchar,
    ativo   integer,
    pecas   bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select b.idbox, b.nmbox, b.ativo,
               (select count(*) from public.pedido_local pl where pl.idbox = b.idbox) as pecas
          from public.box b
         where b.empresa_id = v_sessao.empresa_id
         order by b.ativo desc, b.nmbox;
end;
$$;

/** Cria um local e devolve o idbox gerado. */
create or replace function public.local_criar(p_token text, p_nome text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome   text := btrim(coalesce(p_nome, ''));
    v_id     integer;
begin
    perform public.exigir_admin(v_sessao);

    if v_nome = '' or length(v_nome) > 60 then
        raise exception 'Informe o nome do local (de 1 a 60 caracteres).';
    end if;

    if exists (select 1 from public.box b
                where b.empresa_id = v_sessao.empresa_id and lower(b.nmbox) = lower(v_nome)) then
        raise exception 'Ja existe um local chamado "%".', v_nome;
    end if;

    /* box.idbox e PK global: gera o proximo id com trava (igual ao catalogo de fabricas) */
    perform pg_advisory_xact_lock(hashtext('sysconf.box.idbox'));
    select coalesce(max(b.idbox), 0) + 1 into v_id from public.box b;

    insert into public.box (idbox, nmbox, ativo, empresa_id)
    values (v_id, v_nome, 1, v_sessao.empresa_id);

    return v_id;
end;
$$;

/** Renomeia / ativa / desativa um local. */
create or replace function public.local_atualizar(
    p_token text,
    p_idbox integer,
    p_nome  text,
    p_ativo integer
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome   text := btrim(coalesce(p_nome, ''));
    v_ativo  integer := case when coalesce(p_ativo, 1) = 0 then 0 else 1 end;
    v_linhas integer;
begin
    perform public.exigir_admin(v_sessao);

    if v_nome = '' or length(v_nome) > 60 then
        raise exception 'Informe o nome do local (de 1 a 60 caracteres).';
    end if;

    if exists (select 1 from public.box b
                where b.empresa_id = v_sessao.empresa_id
                  and lower(b.nmbox) = lower(v_nome)
                  and b.idbox <> p_idbox) then
        raise exception 'Ja existe um local chamado "%".', v_nome;
    end if;

    update public.box b
       set nmbox = v_nome, ativo = v_ativo
     where b.idbox = p_idbox
       and b.empresa_id = v_sessao.empresa_id;

    get diagnostics v_linhas = row_count;
    if v_linhas = 0 then
        raise exception 'Local nao encontrado nesta empresa.' using errcode = 'P0002';
    end if;

    return v_linhas;
end;
$$;

/** Exclui o local -- apenas se nenhuma peca estiver usando. */
create or replace function public.local_excluir(p_token text, p_idbox integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_pecas  bigint;
begin
    perform public.exigir_admin(v_sessao);

    if not exists (select 1 from public.box b
                    where b.idbox = p_idbox and b.empresa_id = v_sessao.empresa_id) then
        raise exception 'Local nao encontrado nesta empresa.' using errcode = 'P0002';
    end if;

    select count(*) into v_pecas from public.pedido_local pl where pl.idbox = p_idbox;
    if v_pecas > 0 then
        raise exception 'Este local esta definido para % peca(s) -- troque o local delas ou apenas desative este local.', v_pecas;
    end if;

    delete from public.box b where b.idbox = p_idbox and b.empresa_id = v_sessao.empresa_id;

    return 0;
end;
$$;


-- -----------------------------------------------------------------------------
-- 5. LEITURA DOS LOCAIS (usado pela conferencia e pela tela de pos-importacao)
-- -----------------------------------------------------------------------------
/** Local de cada peca por estagio, na fabrica (o painel de conferencia usa isto). */
create or replace function public.locais_dos_pedidos(p_token text, p_idlayout integer)
returns table (
    pedido_id bigint,
    estagio   integer,
    idbox     integer,
    nmbox     varchar
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select pl.pedido_id, pl.estagio, pl.idbox, b.nmbox::varchar
          from public.pedido_local pl
          join public.pedido p on p.id = pl.pedido_id
          join public.box    b on b.idbox = pl.idbox
         where pl.empresa_id = v_sessao.empresa_id
           and p.idlayout = p_idlayout;
end;
$$;

/**
 * Local mais usado de cada grupo (ORD.COMPRA) por estagio -- a importacao usa
 * isto para ja vir preenchida quando o grupo tem local definido.
 */
create or replace function public.locais_por_grupo(p_token text, p_idlayout integer)
returns table (
    ordcompra varchar,
    estagio   integer,
    idbox     integer,
    nmbox     varchar,
    pecas     bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select g.ordcompra, g.estagio, g.idbox, b.nmbox::varchar, g.pecas
          from (
                select p.ordcompra::varchar as ordcompra,
                       pl.estagio,
                       pl.idbox,
                       count(*) as pecas,
                       row_number() over (partition by p.ordcompra, pl.estagio
                                              order by count(*) desc, pl.idbox) as rn
                  from public.pedido_local pl
                  join public.pedido p on p.id = pl.pedido_id
                 where pl.empresa_id = v_sessao.empresa_id
                   and p.idlayout = p_idlayout
                 group by p.ordcompra, pl.estagio, pl.idbox
               ) g
          join public.box b on b.idbox = g.idbox
         where g.rn = 1;
end;
$$;


/**
 * Lista as pecas da fabrica com o local dos tres estagios (a tela "Locais das
 * pecas"). `p_sem_local_estagio` = 1/2/3 mostra so as pecas SEM local naquele
 * estagio -- e assim que se acha o que ficou faltando. Somente ADMIN.
 */
create or replace function public.locais_pecas_listar(
    p_token             text,
    p_idlayout          integer,
    p_ordcompra         text    default null,
    p_cliente           text    default null,
    p_etiqueta          text    default null,
    p_status            integer default null,
    p_importacao_id     bigint  default null,
    p_sem_local_estagio integer default null,
    p_limite            integer default 500
)
returns table (
    pedido_id     bigint,
    etiqueta      varchar,
    ordcompra     varchar,
    cliente       varchar,
    pecliente     varchar,
    produto       varchar,
    descricao1    varchar,
    qtde          numeric,
    status        integer,
    local_conf    varchar,
    local_saida   varchar,
    local_entrega varchar
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
        select p.id,
               p.etiqueta,
               p.ordcompra,
               p.cliente,
               p.pecliente,
               p.produto,
               p.descricao1,
               p.qtde,
               p.status,
               lc.nmbox::varchar,
               ls.nmbox::varchar,
               le.nmbox::varchar
          from public.pedido p
          left join public.pedido_local pc on pc.pedido_id = p.id and pc.estagio = 1
          left join public.box lc on lc.idbox = pc.idbox
          left join public.pedido_local ps on ps.pedido_id = p.id and ps.estagio = 2
          left join public.box ls on ls.idbox = ps.idbox
          left join public.pedido_local pe on pe.pedido_id = p.id and pe.estagio = 3
          left join public.box le on le.idbox = pe.idbox
         where p.empresa_id = v_sessao.empresa_id
           and p.idlayout = p_idlayout
           and (p_ordcompra     is null or btrim(p_ordcompra) = '' or p.ordcompra = btrim(p_ordcompra))
           and (p_cliente       is null or btrim(p_cliente) = ''   or p.cliente  ilike '%' || btrim(p_cliente) || '%')
           and (p_etiqueta      is null or btrim(p_etiqueta) = ''  or p.etiqueta ilike '%' || btrim(p_etiqueta) || '%')
           and (p_status        is null or p.status = p_status)
           and (p_importacao_id is null or p.importacao_id = p_importacao_id)
           and (p_sem_local_estagio is null
                or (p_sem_local_estagio = 1 and pc.idbox is null)
                or (p_sem_local_estagio = 2 and ps.idbox is null)
                or (p_sem_local_estagio = 3 and pe.idbox is null))
         order by p.ordcompra, p.etiqueta
         limit greatest(coalesce(p_limite, 500), 1);
end;
$$;


-- -----------------------------------------------------------------------------
-- 7. DEFINIR LOCAIS
-- -----------------------------------------------------------------------------
/**
 * POS-IMPORTACAO (so ADMIN): define o local de UM estagio para todas as pecas
 * do filtro. E a tela "Locais das pecas".
 */
create or replace function public.locais_definir(
    p_token         text,
    p_idlayout      integer,
    p_estagio       integer,
    p_idbox         integer,
    p_ordcompra     text    default null,
    p_cliente       text    default null,
    p_etiqueta      text    default null,
    p_importacao_id bigint  default null,
    p_status        integer default null,
    p_sem_local     boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    perform public.exigir_admin(v_sessao);

    if p_estagio is null or p_estagio not between 1 and 3 then
        raise exception 'Estagio invalido: use 1=CONFERENCIA, 2=SAIDA ou 3=ENTREGA.';
    end if;

    if not exists (select 1 from public.layout l
                    where l.controle = p_idlayout and l.empresa_id = v_sessao.empresa_id) then
        raise exception 'Fabrica invalida para esta empresa.' using errcode = 'P0002';
    end if;

    if not exists (select 1 from public.box b
                    where b.idbox = p_idbox and b.empresa_id = v_sessao.empresa_id) then
        raise exception 'Local invalido para esta empresa.' using errcode = 'P0002';
    end if;

    return public.local_aplicar(
        v_sessao.empresa_id, public.login_da_sessao(v_sessao), p_idlayout, p_estagio, p_idbox,
        p_ordcompra, p_cliente, p_etiqueta, p_importacao_id, p_status, p_sem_local
    );
end;
$$;

/**
 * IMPORTACAO (qualquer usuario que importa): aplica de uma vez os locais
 * escolhidos na lista de grupos. `p_locais` = [{ordcompra, estagio, idbox}, ...].
 */
create or replace function public.locais_definir_lote(
    p_token         text,
    p_idlayout      integer,
    p_importacao_id bigint,
    p_locais        jsonb
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_login  varchar(50) := public.login_da_sessao(v_sessao);
    v_total  integer := 0;
    r        record;
begin
    if p_locais is null or jsonb_typeof(p_locais) <> 'array' then
        return 0;
    end if;

    if not exists (select 1 from public.layout l
                    where l.controle = p_idlayout and l.empresa_id = v_sessao.empresa_id) then
        raise exception 'Fabrica invalida para esta empresa.' using errcode = 'P0002';
    end if;

    if p_importacao_id is not null and not exists (
        select 1 from public.importacao i
         where i.id = p_importacao_id and i.empresa_id = v_sessao.empresa_id
    ) then
        raise exception 'Importacao invalida para esta empresa.' using errcode = 'P0002';
    end if;

    for r in
        select x.ordcompra, x.estagio, x.idbox
          from jsonb_to_recordset(p_locais) as x(ordcompra varchar, estagio integer, idbox integer)
    loop
        /* ignora combinacao invalida em vez de derrubar a importacao inteira */
        if r.estagio between 1 and 3
           and r.idbox is not null
           and exists (select 1 from public.box b
                        where b.idbox = r.idbox and b.empresa_id = v_sessao.empresa_id) then
            v_total := v_total + public.local_aplicar(
                v_sessao.empresa_id, v_login, p_idlayout, r.estagio, r.idbox,
                r.ordcompra, null, null, p_importacao_id, null, false
            );
        end if;
    end loop;

    return v_total;
end;
$$;


-- -----------------------------------------------------------------------------
-- 8. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.local_aplicar(bigint, varchar, integer, integer, integer, text, text, text, bigint, integer, boolean) from public;

revoke all on function public.locais_listar(text) from public;
revoke all on function public.locais_dos_pedidos(text, integer) from public;
revoke all on function public.locais_por_grupo(text, integer) from public;
revoke all on function public.locais_pecas_listar(text, integer, text, text, text, integer, bigint, integer, integer) from public;
revoke all on function public.locais_definir(text, integer, integer, integer, text, text, text, bigint, integer, boolean) from public;
revoke all on function public.locais_definir_lote(text, integer, bigint, jsonb) from public;
revoke all on function public.local_criar(text, text) from public;
revoke all on function public.local_atualizar(text, integer, text, integer) from public;
revoke all on function public.local_excluir(text, integer) from public;

/* leitura: o operador precisa ver o nome do local na conferencia */
grant execute on function public.locais_listar(text)                    to anon, authenticated;
grant execute on function public.locais_dos_pedidos(text, integer)      to anon, authenticated;
grant execute on function public.locais_por_grupo(text, integer)        to anon, authenticated;

/* definir na importacao: quem importa (o operador tambem importa) */
grant execute on function public.locais_definir_lote(text, integer, bigint, jsonb) to anon, authenticated;

/* pos-importacao e cadastro de locais: so ADMIN */
grant execute on function public.locais_pecas_listar(text, integer, text, text, text, integer, bigint, integer, integer) to anon, authenticated;
grant execute on function public.locais_definir(text, integer, integer, integer, text, text, text, bigint, integer, boolean) to anon, authenticated;
grant execute on function public.local_criar(text, text)                to anon, authenticated;
grant execute on function public.local_atualizar(text, integer, text, integer) to anon, authenticated;
grant execute on function public.local_excluir(text, integer)           to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- -- 1) quantas pecas ja tem local nos tres estagios (backfill):
-- select pl.estagio, count(*) from public.pedido_local pl group by pl.estagio order by 1;
--
-- -- 2) locais da empresa:
-- select b.idbox, b.nmbox, b.ativo, count(pl.pedido_id) as pecas
--   from public.box b left join public.pedido_local pl on pl.idbox = b.idbox
--  where b.empresa_id = (select id from public.empresa where slug = 'novomundo')
--  group by b.idbox, b.nmbox, b.ativo order by b.idbox;
--
-- -- 3) local por grupo (o que a importacao mostra preenchido):
-- select p.ordcompra, pl.estagio, b.nmbox, count(*)
--   from public.pedido_local pl join public.pedido p on p.id = pl.pedido_id
--   join public.box b on b.idbox = pl.idbox
--  where p.idlayout = 12 group by p.ordcompra, pl.estagio, b.nmbox order by 1, 2;


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- drop function if exists public.local_excluir(text, integer);
-- drop function if exists public.local_atualizar(text, integer, text, integer);
-- drop function if exists public.local_criar(text, text);
-- drop function if exists public.locais_definir_lote(text, integer, bigint, jsonb);
-- drop function if exists public.locais_definir(text, integer, integer, integer, text, text, text, bigint, integer, boolean);
-- drop function if exists public.locais_pecas_listar(text, integer, text, text, text, integer, bigint, integer, integer);
-- drop function if exists public.locais_por_grupo(text, integer);
-- drop function if exists public.locais_dos_pedidos(text, integer);
-- drop function if exists public.locais_listar(text);
-- drop function if exists public.local_aplicar(bigint, varchar, integer, integer, integer, text, text, text, bigint, integer, boolean);
-- drop table if exists public.pedido_local;
-- drop index if exists public.ux_box_empresa_nome;
