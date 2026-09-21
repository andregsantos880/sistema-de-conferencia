-- =============================================================================
-- SysConf - Estagios cadastraveis (o fluxo da conferencia por empresa)
-- Arquivo : supabase/migrations/20260921000111_estagios.sql
--
-- OBJETIVO (pedido do cliente): o administrador cadastra os ESTAGIOS da empresa
-- (nome, cor, ordem) e a tela principal passa a ter um seletor de estagio + o
-- botao de conferir. Assim a empresa pode trabalhar com 4 ou 5 etapas com os
-- nomes dela (RECEBIMENTO, CONFERENCIA, SEPARACAO, EXPEDICAO...).
--
-- OS TRES ESTAGIOS ATUAIS JA VEM PRE-CADASTRADOS para TODA empresa existente
-- (CONFERENCIA, SAIDA e ENTREGA, com as cores do sistema):
--   1 = CONFERENCIA (#90ee90)   2 = SAIDA (#f08080)   3 = ENTREGA (#0000ff)
-- Entao, por padrao, NADA MUDA em relacao a hoje.
--
-- REGRA DE VALIDACAO (decisao do cliente): a etiqueta vai de um estagio para
-- o SEGUINTE e nada mais. Nao pode pular (1 -> 3, 2 -> 4) e nao pode voltar
-- (3 -> 2). A unica transicao valida e `status` = `estagio escolhido - 1`.
-- Quem aplica a regra e a tela de conferencia; o banco guarda o numero do
-- estagio em PEDIDO.STATUS (0 = NORMAL, ainda nao bipado).
--
-- LIMITES DESTA VERSAO (de proposito, para nao embaralhar o fluxo):
--   * o estagio novo entra SEMPRE NO FIM da sequencia;
--   * so o ULTIMO estagio ativo pode ser desativado/excluido, e nunca se
--     houver peca parada nele ou local definido nele;
--   * renomear e trocar a cor pode a qualquer momento;
--   * sao permitidos de 1 a 9 estagios.
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
--               (aplique DEPOIS da 20260919000110_locais_pecas.sql)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. TABELA
-- -----------------------------------------------------------------------------
create table if not exists public.estagio (
    empresa_id bigint      not null references public.empresa (id) on delete cascade,
    numero     integer     not null,                 -- 1,2,3... define a ORDEM do fluxo
    nome       varchar(40) not null,
    cor        varchar(20),                          -- cor das linhas do grid (hex)
    ativo      integer     not null default 1,
    constraint pk_estagio primary key (empresa_id, numero),
    constraint ck_estagio_numero check (numero between 1 and 9)
);

comment on table public.estagio is
    'Estagios da conferencia por empresa (1..9). Numero = ordem do fluxo; PEDIDO.STATUS guarda o estagio atual (0 = NORMAL).';
comment on column public.estagio.cor is
    'Cor de fundo das linhas do grid neste estagio (hex). Nulo usa a paleta padrao do sistema.';

alter table public.estagio enable row level security;
revoke all on table public.estagio from anon, authenticated;

/* nomes diferentes na mesma empresa */
create unique index if not exists ux_estagio_empresa_nome on public.estagio (empresa_id, lower(nome));


-- -----------------------------------------------------------------------------
-- 2. SEMEAR OS TRES ESTAGIOS ATUAIS EM TODAS AS EMPRESAS
-- -----------------------------------------------------------------------------
insert into public.estagio (empresa_id, numero, nome, cor)
select e.id, x.numero, x.nome, x.cor
  from public.empresa e
  cross join (values
        (1, 'CONFERENCIA', '#90ee90'),
        (2, 'SAIDA',       '#f08080'),
        (3, 'ENTREGA',     '#0000ff')
    ) as x(numero, nome, cor)
on conflict (empresa_id, numero) do nothing;


-- -----------------------------------------------------------------------------
-- 3. O VINCULO DE LOCAL PASSA A ACEITAR ATE 9 ESTAGIOS
-- -----------------------------------------------------------------------------
alter table public.pedido_local drop constraint if exists ck_pedido_local_estagio;
alter table public.pedido_local
    add constraint ck_pedido_local_estagio check (estagio between 1 and 9);


-- -----------------------------------------------------------------------------
-- 4. LEITURA
-- -----------------------------------------------------------------------------
/** Estagios da empresa (a leitura é livre: a conferência mostra os nomes). */
create or replace function public.estagios_listar(p_token text)
returns table (
    numero integer,
    nome   varchar,
    cor    varchar,
    ativo  integer,
    pecas  bigint
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
        select e.numero, e.nome, e.cor, e.ativo,
               (select count(*) from public.pedido p
                 where p.empresa_id = e.empresa_id and p.status = e.numero) as pecas
          from public.estagio e
         where e.empresa_id = v_sessao.empresa_id
         order by e.numero;
end;
$$;


-- -----------------------------------------------------------------------------
-- 5. CADASTRO (so ADMIN)
-- -----------------------------------------------------------------------------
/** Cria o estagio NO FIM da sequencia e devolve o numero dele. */
create or replace function public.estagio_criar(
    p_token text,
    p_nome  text,
    p_cor   text default null
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome   text := btrim(coalesce(p_nome, ''));
    v_cor    varchar(20) := nullif(btrim(coalesce(p_cor, '')), '');
    v_numero integer;
begin
    perform public.exigir_admin(v_sessao);

    if length(v_nome) < 2 or length(v_nome) > 40 then
        raise exception 'Informe o nome do estagio (de 2 a 40 caracteres).';
    end if;

    if exists (select 1 from public.estagio e
                where e.empresa_id = v_sessao.empresa_id and lower(e.nome) = lower(v_nome)) then
        raise exception 'Ja existe um estagio chamado "%".', v_nome;
    end if;

    perform pg_advisory_xact_lock(hashtext('sysconf.estagio.' || v_sessao.empresa_id::text));

    select coalesce(max(e.numero), 0) + 1 into v_numero
      from public.estagio e where e.empresa_id = v_sessao.empresa_id;

    if v_numero > 9 then
        raise exception 'Limite de 9 estagios por empresa.';
    end if;

    insert into public.estagio (empresa_id, numero, nome, cor, ativo)
    values (v_sessao.empresa_id, v_numero, v_nome, v_cor, 1);

    return v_numero;
end;
$$;

/** Renomeia / troca a cor / ativa / desativa um estagio. */
create or replace function public.estagio_atualizar(
    p_token  text,
    p_numero integer,
    p_nome   text,
    p_cor    text default null,
    p_ativo  integer default 1
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome    text := btrim(coalesce(p_nome, ''));
    v_cor     varchar(20) := nullif(btrim(coalesce(p_cor, '')), '');
    v_ativo   integer := case when coalesce(p_ativo, 1) = 0 then 0 else 1 end;
    v_ultimo  integer;
    v_pecas   bigint;
begin
    perform public.exigir_admin(v_sessao);

    if length(v_nome) < 2 or length(v_nome) > 40 then
        raise exception 'Informe o nome do estagio (de 2 a 40 caracteres).';
    end if;

    if not exists (select 1 from public.estagio e
                    where e.empresa_id = v_sessao.empresa_id and e.numero = p_numero) then
        raise exception 'Estagio nao encontrado nesta empresa.' using errcode = 'P0002';
    end if;

    if exists (select 1 from public.estagio e
                where e.empresa_id = v_sessao.empresa_id
                  and e.numero <> p_numero
                  and lower(e.nome) = lower(v_nome)) then
        raise exception 'Ja existe um estagio chamado "%".', v_nome;
    end if;

    /* desativar só o último da fila, e só sem peça parada nele */
    if v_ativo = 0 then
        select max(e.numero) into v_ultimo
          from public.estagio e
         where e.empresa_id = v_sessao.empresa_id and e.ativo = 1;

        if p_numero <> v_ultimo then
            raise exception 'Para desativar, o estagio precisa ser o ultimo da sequencia (hoje e o %).', v_ultimo;
        end if;

        select count(*) into v_pecas
          from public.pedido p
         where p.empresa_id = v_sessao.empresa_id and p.status = p_numero;

        if v_pecas > 0 then
            raise exception 'Ha % peca(s) parada(s) neste estagio -- conclua ou mova as pecas antes de desativar.', v_pecas;
        end if;
    end if;

    update public.estagio e
       set nome = v_nome, cor = v_cor, ativo = v_ativo
     where e.empresa_id = v_sessao.empresa_id and e.numero = p_numero;

    return 1;
end;
$$;

/** Exclui o estagio (só o último da sequencia, sem peças e sem local definido). */
create or replace function public.estagio_excluir(p_token text, p_numero integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_ultimo integer;
    v_pecas  bigint;
    v_locais bigint;
begin
    perform public.exigir_admin(v_sessao);

    select max(e.numero) into v_ultimo
      from public.estagio e
     where e.empresa_id = v_sessao.empresa_id and e.ativo = 1;

    if p_numero <> coalesce(v_ultimo, 0) then
        raise exception 'Para excluir, o estagio precisa ser o ultimo da sequencia (hoje e o %).', coalesce(v_ultimo, 0);
    end if;

    select count(*) into v_pecas from public.pedido p
     where p.empresa_id = v_sessao.empresa_id
       and (p.status = p_numero or (p.status + 1) = p_numero);

    if v_pecas > 0 then
        raise exception 'Ha % peca(s) chegando/passando por este estagio -- conclua a conferencia antes de excluir.', v_pecas;
    end if;

    select count(*) into v_locais from public.pedido_local pl
     where pl.empresa_id = v_sessao.empresa_id and pl.estagio = p_numero;

    if v_locais > 0 then
        raise exception 'Ha % peca(s) com local definido neste estagio -- limpe esses locais antes de excluir.', v_locais;
    end if;

    delete from public.estagio e
     where e.empresa_id = v_sessao.empresa_id and e.numero = p_numero;

    return 0;
end;
$$;


-- -----------------------------------------------------------------------------
-- 6. AS RPCs DE LOCAL/LOG ACEITAM ATE 9 ESTAGIOS
-- -----------------------------------------------------------------------------
/* local_aplicar: só troca a faixa de validação do estagio (1..3 -> 1..9) */
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
    if p_estagio is null or p_estagio < 1 or p_estagio > 9 then
        raise exception 'Estagio invalido: informe de 1 a 9 (veja os estagios cadastrados).';
    end if;

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

/** locais_definir: valida o estagio no CADASTRO da empresa (e não mais 1..3). */
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

    if not exists (select 1 from public.estagio e
                    where e.empresa_id = v_sessao.empresa_id and e.numero = p_estagio) then
        raise exception 'Estagio invalido: escolha um estagio cadastrado.' using errcode = 'P0002';
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

/** locais_definir_lote: aceita qualquer estagio CADASTRADO na empresa. */
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
        if r.estagio between 1 and 9
           and r.idbox is not null
           and exists (select 1 from public.box b
                        where b.idbox = r.idbox and b.empresa_id = v_sessao.empresa_id)
           and exists (select 1 from public.estagio e
                        where e.empresa_id = v_sessao.empresa_id and e.numero = r.estagio) then
            v_total := v_total + public.local_aplicar(
                v_sessao.empresa_id, v_login, p_idlayout, r.estagio, r.idbox,
                r.ordcompra, null, null, p_importacao_id, null, false
            );
        end if;
    end loop;

    return v_total;
end;
$$;

/** log_registrar: o estagio do log passa a ser 0..9. */
create or replace function public.log_registrar(
    p_token      text,
    p_controle   integer,
    p_estagio    integer,
    p_desfecho   text,
    p_valor_lido text,
    p_pedido_id  bigint default null,
    p_mensagem   text default null
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao    public.sessao := public.sessao_aberta(p_token);
    v_desfecho  varchar(20) := lower(btrim(coalesce(p_desfecho, '')));
    v_controle  integer;
    v_estagio   integer;
    v_antes     integer;
begin
    if v_desfecho not in ('sucesso', 'ja_lida', 'bloqueada', 'nao_encontrada', 'massa') then
        raise exception 'Desfecho de log invalido: %', v_desfecho;
    end if;

    if exists (select 1 from public.layout l
                where l.controle = p_controle and l.empresa_id = v_sessao.empresa_id) then
        v_controle := p_controle;
    end if;

    /* estagio so aceita 0..9 (fora disso fica 0 = nao se aplica) */
    v_estagio := case when p_estagio between 0 and 9 then p_estagio else 0 end;

    if p_pedido_id is not null then
        select p.status into v_antes
          from public.pedido p
         where p.id = p_pedido_id and p.empresa_id = v_sessao.empresa_id;
    end if;

    return public.log_gravar(
        v_sessao.empresa_id, v_sessao.usuario_id, public.login_da_sessao(v_sessao),
        v_controle, v_estagio, v_desfecho, p_valor_lido, 'bipagem',
        p_pedido_id, v_antes, null, p_mensagem
    );
end;
$$;


-- -----------------------------------------------------------------------------
-- 7. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.estagios_listar(text) from public;
revoke all on function public.estagio_criar(text, text, text) from public;
revoke all on function public.estagio_atualizar(text, integer, text, text, integer) from public;
revoke all on function public.estagio_excluir(text, integer) from public;

/* leitura: a conferencia mostra os nomes dos estagios para qualquer usuario */
grant execute on function public.estagios_listar(text)                     to anon, authenticated;

/* cadastro: so ADMIN */
grant execute on function public.estagio_criar(text, text, text)           to anon, authenticated;
grant execute on function public.estagio_atualizar(text, integer, text, text, integer) to anon, authenticated;
grant execute on function public.estagio_excluir(text, integer)            to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- 9. TELAS AUXILIARES PASSAM A DEVOLVER OS ESTAGIOS EM JSON
--    (antes eram colunas fixas estagio_1/2/3 e local_conf/saida/entrega)
-- -----------------------------------------------------------------------------
/** Resumo dos logs: `estagios` = {"1": 12, "2": 3, ...} por número de estágio. */
create or replace function public.logs_resumo(
    p_token     text,
    p_de        date    default null,
    p_ate       date    default null,
    p_controle  integer default null,
    p_usuario   text    default null,
    p_desfecho  text    default null,
    p_texto     text    default null,
    p_ordcompra text    default null
)
returns table (
    total          bigint,
    sucesso        bigint,
    ja_lida        bigint,
    bloqueada      bigint,
    nao_encontrada bigint,
    massa          bigint,
    estagios       jsonb,
    operadores     bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    perform public.exigir_admin(v_sessao);

    return query
    with filtrado as (
        select l.estagio, l.desfecho, l.usuario_login
          from public.log_conferencia l
         where l.empresa_id = v_sessao.empresa_id
           and (p_de        is null or l.criado_em >= p_de::timestamp)
           and (p_ate       is null or l.criado_em <  (p_ate + 1)::timestamp)
           and (p_controle  is null or l.layout_controle = p_controle)
           and (p_usuario   is null or btrim(p_usuario) = ''
                or lower(l.usuario_login) like '%' || lower(btrim(p_usuario)) || '%')
           and (p_desfecho  is null or btrim(p_desfecho) = ''
                or l.desfecho = lower(btrim(p_desfecho)))
           and (p_ordcompra is null or btrim(p_ordcompra) = ''
                or l.ordcompra ilike '%' || btrim(p_ordcompra) || '%')
           and (p_texto     is null or btrim(p_texto) = ''
                or l.etiqueta      ilike '%' || btrim(p_texto) || '%'
                or l.valor_lido    ilike '%' || btrim(p_texto) || '%'
                or l.produto       ilike '%' || btrim(p_texto) || '%'
                or l.descricao1    ilike '%' || btrim(p_texto) || '%'
                or l.ordcompra     ilike '%' || btrim(p_texto) || '%'
                or l.pecliente     ilike '%' || btrim(p_texto) || '%'
                or l.cliente       ilike '%' || btrim(p_texto) || '%'
                or l.usuario_login ilike '%' || btrim(p_texto) || '%')
    )
    select (select count(*) from filtrado)::bigint,
           (select count(*) from filtrado where desfecho = 'sucesso')::bigint,
           (select count(*) from filtrado where desfecho = 'ja_lida')::bigint,
           (select count(*) from filtrado where desfecho = 'bloqueada')::bigint,
           (select count(*) from filtrado where desfecho = 'nao_encontrada')::bigint,
           (select count(*) from filtrado where desfecho = 'massa')::bigint,
           (select coalesce(jsonb_object_agg(x.estagio::text, x.quantidade), '{}'::jsonb)
              from (select f.estagio, count(*) as quantidade
                      from filtrado f
                     where f.estagio > 0
                     group by f.estagio) x) as estagios,
           (select count(distinct f.usuario_login) from filtrado f)::bigint;
end;
$$;

/** Locais das peças: `locais` = {"1": "Box 01", "2": "Prateleira", ...} por estágio. */
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
    pedido_id  bigint,
    etiqueta   varchar,
    ordcompra  varchar,
    cliente    varchar,
    pecliente  varchar,
    produto    varchar,
    descricao1 varchar,
    qtde       numeric,
    status     integer,
    locais     jsonb
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
               coalesce(
                   (select jsonb_object_agg(pl.estagio::text, b.nmbox)
                      from public.pedido_local pl
                      join public.box b on b.idbox = pl.idbox
                     where pl.pedido_id = p.id),
                   '{}'::jsonb
               ) as locais
          from public.pedido p
         where p.empresa_id = v_sessao.empresa_id
           and p.idlayout = p_idlayout
           and (p_ordcompra     is null or btrim(p_ordcompra) = '' or p.ordcompra = btrim(p_ordcompra))
           and (p_cliente       is null or btrim(p_cliente) = ''   or p.cliente  ilike '%' || btrim(p_cliente) || '%')
           and (p_etiqueta      is null or btrim(p_etiqueta) = ''  or p.etiqueta ilike '%' || btrim(p_etiqueta) || '%')
           and (p_status        is null or p.status = p_status)
           and (p_importacao_id is null or p.importacao_id = p_importacao_id)
           and (p_sem_local_estagio is null
                or not exists (select 1 from public.pedido_local pl
                                where pl.pedido_id = p.id and pl.estagio = p_sem_local_estagio))
         order by p.ordcompra, p.etiqueta
         limit greatest(coalesce(p_limite, 500), 1);
end;
$$;

revoke all on function public.logs_resumo(text, date, date, integer, text, text, text, text) from public;
revoke all on function public.locais_pecas_listar(text, integer, text, text, text, integer, bigint, integer, integer) from public;
grant execute on function public.logs_resumo(text, date, date, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.locais_pecas_listar(text, integer, text, text, text, integer, bigint, integer, integer) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- -- 1) os tres estagios ja vem cadastrados em cada empresa:
-- select e.slug, s.numero, s.nome, s.cor, s.ativo
--   from public.empresa e join public.estagio s on s.empresa_id = e.id
--  order by e.slug, s.numero;
--
-- -- 2) pecas por estagio (0 = ainda NORMAL):
-- select p.status, count(*) from public.pedido p
--  where p.empresa_id = (select id from public.empresa where slug = 'novomundo')
--  group by p.status order by 1;


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- drop function if exists public.estagio_excluir(text, integer);
-- drop function if exists public.estagio_atualizar(text, integer, text, text, integer);
-- drop function if exists public.estagio_criar(text, text, text);
-- drop function if exists public.estagios_listar(text);
-- alter table public.pedido_local drop constraint if exists ck_pedido_local_estagio;
-- alter table public.pedido_local add constraint ck_pedido_local_estagio check (estagio between 1 and 3);
-- drop table if exists public.estagio;
-- (local_aplicar / locais_definir / locais_definir_lote / log_registrar voltam rodando a 00110 e a 00109)
