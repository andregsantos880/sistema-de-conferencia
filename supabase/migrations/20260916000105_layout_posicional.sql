-- =============================================================================
-- SysConf - Layout POSICIONAL (largura fixa) + catalogo de layouts do legado
-- Arquivo : supabase/migrations/20260916000105_layout_posicional.sql
--
-- PROBLEMA: a 00104 so cobria arquivo DELIMITADO (CSV/TXT com separador). No
-- legado, 10 das 29 fabricas usam arquivo POSICIONAL (largura fixa), entre elas
-- a Transpaese, que hoje e lida no modo generico e nao gera pedido nenhum.
--
-- SOLUCAO:
--   1. `layout_mapa` ganha `tipo` ('delimitado' | 'posicional'), `linha_minima`,
--      `fixos` (valor quando o campo vem vazio) e `derivados` (campo montado a
--      partir de outro, ex.: o produto da Transpaese sai de dentro da etiqueta).
--   2. No modo posicional cada campo passa a ser {"pos": N, "len": M, "zeros": b}
--      (len 0 = ate o fim da linha); no delimitado continua sendo o indice.
--   3. O catalogo de layouts do legado (`catalogo_layout`) entra com a Transpaese,
--      e `aplicar_layout_catalogo(empresa)` grava o layout nas fabricas de mesmo
--      nome que ainda nao tem layout (backfill + autocadastro).
--
-- Transpaese (Negocio/boPedido.cs -> InserirTranspaese, LayoutId 16):
--   pos  0..19  (20)  ORDCOMPRA  -> carga/romaneio, sem zeros a esquerda, "--" se vazio
--   pos 20..45  (26)  ETIQUETA   -> codigo de barras
--   pos 36..42   (7)  PECLIENTE  -> pedido do cliente
--   pos 46..49   (4)  VOLUME     -> 1 quando vazio/invalido
--   pos 70..fim       DESCRICAO1 -> "SEM DESCRICAO" quando vazio
--   PRODUTO   -> etiqueta: comeca com "00000" -> pos 5 len 9; senao pos 0 len 14 sem zeros
--   SEQUENCIA -> ultimos 3 digitos da etiqueta
--   CLIENTE   -> "NAO INFORMADO"  |  QTDE -> 1
--   linhas com menos de 70 caracteres sao ignoradas
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. COLUNAS NOVAS EM layout_mapa
-- -----------------------------------------------------------------------------
alter table public.layout_mapa add column if not exists tipo          varchar(12) not null default 'delimitado';
alter table public.layout_mapa add column if not exists linha_minima  integer     not null default 0;
alter table public.layout_mapa add column if not exists fixos         jsonb       not null default '{}'::jsonb;
alter table public.layout_mapa add column if not exists derivados     jsonb       not null default '{}'::jsonb;

do $constraint$
begin
    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.layout_mapa'::regclass
          and conname  = 'ck_layout_mapa_tipo'
    ) then
        alter table public.layout_mapa
            add constraint ck_layout_mapa_tipo check (tipo in ('delimitado', 'posicional'));
    end if;
end;
$constraint$;

comment on column public.layout_mapa.tipo is
    'delimitado = colunas separadas por caractere; posicional = largura fixa (posicao + tamanho).';
comment on column public.layout_mapa.linha_minima is
    'Posicional: descarta linhas menores que isto (cabecalho de pagina/rodape).';

/* o nome da fabrica e a ponte entre cadastro e catálogo de layouts do legado */
create or replace function public.normalizar_nome_fabrica(p_nome text)
returns text
language sql
immutable
as $$
    select upper(
        regexp_replace(
            translate(
                coalesce(p_nome, ''),
                'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ',
                'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'
            ),
            '[^a-zA-Z0-9]+', ' ', 'g'
        )
    );
$$;


-- -----------------------------------------------------------------------------
-- 2. VALIDACAO DO MAPA (delimitado x posicional)
-- -----------------------------------------------------------------------------
drop function if exists public.layout_campos_validar(jsonb);

/** Valida e normaliza o mapa de campos recebido do navegador. */
create or replace function public.layout_campos_validar(p_tipo text, p_campos jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
    v_permitidos text[] := array['ordcompra','cliente','pecliente','produto','descricao1','qtde','etiqueta','volume','sequencia'];
    v_tipo  text := coalesce(nullif(btrim(p_tipo), ''), 'delimitado');
    v_chave text;
    v_valor jsonb;
    v_saida jsonb := '{}'::jsonb;
    v_pos   integer;
    v_len   integer;
begin
    if v_tipo not in ('delimitado', 'posicional') then
        raise exception 'Tipo de layout invalido: %', v_tipo;
    end if;
    if p_campos is null or jsonb_typeof(p_campos) <> 'object' then
        raise exception 'Mapa de colunas invalido.';
    end if;

    for v_chave, v_valor in select * from jsonb_each(p_campos) loop
        if not (v_chave = any (v_permitidos)) then
            raise exception 'Campo desconhecido no layout: %', v_chave;
        end if;
        if v_valor is null or v_valor = 'null'::jsonb then
            continue;
        end if;

        if v_tipo = 'posicional' then
            if jsonb_typeof(v_valor) <> 'object' then
                raise exception 'No layout posicional o campo % precisa de posicao e tamanho.', v_chave;
            end if;
            begin
                v_pos := (v_valor ->> 'pos')::integer;
                v_len := coalesce((v_valor ->> 'len')::integer, 0);
            exception when others then
                raise exception 'Posicao/tamanho invalido para o campo %.', v_chave;
            end;
            if v_pos is null or v_pos < 0 or v_pos > 2000 then
                raise exception 'Posicao fora do intervalo para o campo %: %', v_chave, v_pos;
            end if;
            if v_len is null or v_len < 0 or v_len > 2000 then
                raise exception 'Tamanho fora do intervalo para o campo %: %', v_chave, v_len;
            end if;
            v_saida := v_saida || jsonb_build_object(v_chave, jsonb_strip_nulls(jsonb_build_object(
                'pos', v_pos,
                'len', v_len,
                'zeros', (v_valor ->> 'zeros')::boolean
            )));
        else
            begin
                v_pos := (v_valor #>> '{}')::integer;
            exception when others then
                raise exception 'Coluna invalida para o campo %: %', v_chave, v_valor #>> '{}';
            end;
            if v_pos < 0 or v_pos > 500 then
                raise exception 'Coluna fora do intervalo para o campo %: %', v_chave, v_pos;
            end if;
            v_saida := v_saida || jsonb_build_object(v_chave, v_pos);
        end if;
    end loop;

    /* a etiqueta e a chave da conferencia: sem ela o layout nao serve */
    if not (v_saida ? 'etiqueta') then
        raise exception 'Escolha qual coluna do arquivo tem a ETIQUETA (codigo de barras).';
    end if;

    return v_saida;
end;
$$;

/** Valores usados quando o campo vem vazio (ex.: QTDE 1 na Transpaese). */
create or replace function public.layout_fixos_validar(p_fixos jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
    v_permitidos text[] := array['ordcompra','cliente','pecliente','produto','descricao1','qtde','etiqueta','volume','sequencia'];
    v_chave text;
    v_valor jsonb;
    v_saida jsonb := '{}'::jsonb;
begin
    if p_fixos is null or p_fixos = 'null'::jsonb or jsonb_typeof(p_fixos) <> 'object' then
        return '{}'::jsonb;
    end if;

    for v_chave, v_valor in select * from jsonb_each(p_fixos) loop
        if not (v_chave = any (v_permitidos)) then
            raise exception 'Campo desconhecido nos valores padrao: %', v_chave;
        end if;
        if v_chave = 'etiqueta' then
            raise exception 'A etiqueta nao pode ser valor fixo: cada pedido tem a sua.';
        end if;
        if v_valor is null or v_valor = 'null'::jsonb then
            continue;
        end if;
        if jsonb_typeof(v_valor) not in ('string', 'number') then
            raise exception 'Valor padrao invalido para o campo %.', v_chave;
        end if;
        v_saida := v_saida || jsonb_build_object(v_chave, v_valor);
    end loop;

    return v_saida;
end;
$$;

/** Regras de campo montado a partir de outro (ex.: produto dentro da etiqueta). */
create or replace function public.layout_derivados_validar(p_derivados jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
    v_permitidos text[] := array['ordcompra','cliente','pecliente','produto','descricao1','qtde','etiqueta','volume','sequencia'];
    v_numericos  text[] := array['pos','len','ultimos','senao_pos','senao_len'];
    v_chave text;
    v_regra jsonb;
    v_de    text;
    v_item  text;
    v_num   integer;
    v_saida jsonb := '{}'::jsonb;
begin
    if p_derivados is null or p_derivados = 'null'::jsonb or jsonb_typeof(p_derivados) <> 'object' then
        return '{}'::jsonb;
    end if;

    for v_chave, v_regra in select * from jsonb_each(p_derivados) loop
        if not (v_chave = any (v_permitidos)) then
            raise exception 'Campo desconhecido nas regras: %', v_chave;
        end if;
        if v_chave = 'etiqueta' then
            raise exception 'A etiqueta nao pode ser derivada: ela vem do arquivo.';
        end if;
        if jsonb_typeof(v_regra) <> 'object' then
            raise exception 'Regra invalida para o campo %.', v_chave;
        end if;

        v_de := v_regra ->> 'de';
        if v_de is null or not (v_de = any (v_permitidos)) then
            raise exception 'Diga de qual campo "%" e montado.', v_chave;
        end if;
        if v_de = v_chave then
            raise exception 'O campo "%" nao pode ser montado a partir dele mesmo.', v_chave;
        end if;

        foreach v_item in array v_numericos loop
            if v_regra ? v_item then
                begin
                    v_num := (v_regra ->> v_item)::integer;
                exception when others then
                    raise exception 'Valor invalido em % na regra do campo %.', v_item, v_chave;
                end;
                if v_num < 0 or v_num > 2000 then
                    raise exception '% fora do intervalo na regra do campo %: %', v_item, v_chave, v_num;
                end if;
            end if;
        end loop;

        v_saida := v_saida || jsonb_build_object(v_chave, jsonb_strip_nulls(v_regra));
    end loop;

    return v_saida;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. RPCs (drop porque o tipo de retorno / a lista de parametros mudou)
-- -----------------------------------------------------------------------------
drop function if exists public.layout_da_fabrica(text, integer);
drop function if exists public.layout_salvar(text, integer, text, integer, boolean, jsonb);
drop function if exists public.fabricas_admin(text);

/** Lista completa para a tela de fabricas: situacao, pedidos e se tem layout. */
create or replace function public.fabricas_admin(p_token text)
returns table (
    controle       integer,
    nome           varchar,
    ativo          integer,
    pedidos        bigint,
    tem_layout     boolean,
    layout_tipo    varchar,
    layout_campos  jsonb,
    layout_delim   varchar
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
        select l.controle,
               l.nome,
               l.flativo,
               (select count(*) from public.pedido p where p.idlayout = l.controle) as pedidos,
               (m.id is not null) as tem_layout,
               m.tipo,
               m.campos,
               m.delimitador
        from public.layout l
        left join public.layout_mapa m on m.layout_controle = l.controle
        where l.empresa_id = v_sessao.empresa_id
        order by l.nome;
end;
$$;

/** Leitura usada pela importacao (operador tambem precisa). */
create or replace function public.layout_da_fabrica(p_token text, p_controle integer)
returns table (
    tipo          varchar,
    delimitador   varchar,
    linha_inicial integer,
    tem_cabecalho boolean,
    linha_minima  integer,
    campos        jsonb,
    fixos         jsonb,
    derivados     jsonb
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
        select m.tipo,
               m.delimitador,
               m.linha_inicial,
               m.tem_cabecalho,
               m.linha_minima,
               m.campos,
               m.fixos,
               m.derivados
        from public.layout_mapa m
        join public.layout l on l.controle = m.layout_controle
        where m.layout_controle = p_controle
          and l.empresa_id = v_sessao.empresa_id;
end;
$$;

/** Grava (ou substitui) o layout da fabrica - delimitado ou posicional. */
create or replace function public.layout_salvar(
    p_token         text,
    p_controle      integer,
    p_tipo          text,
    p_delimitador   text,
    p_linha_inicial integer,
    p_tem_cabecalho boolean,
    p_linha_minima  integer,
    p_campos        jsonb,
    p_fixos         jsonb,
    p_derivados     jsonb
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao   public.sessao := public.sessao_aberta(p_token);
    v_tipo     text := coalesce(nullif(btrim(p_tipo), ''), 'delimitado');
    v_delim    text;
    v_linha    integer := coalesce(p_linha_inicial, 1);
    v_minima   integer := coalesce(p_linha_minima, 0);
    v_campos   jsonb;
    v_fixos    jsonb;
    v_derivados jsonb;
    v_chave    text;
    v_regra    jsonb;
    v_id       bigint;
begin
    perform public.exigir_admin(v_sessao);

    if v_tipo not in ('delimitado', 'posicional') then
        raise exception 'Tipo de layout invalido: %', v_tipo;
    end if;

    if not exists (
        select 1 from public.layout l
        where l.controle = p_controle and l.empresa_id = v_sessao.empresa_id
    ) then
        raise exception 'Fabrica nao encontrada nesta empresa.' using errcode = 'P0002';
    end if;

    if v_linha < 1 or v_linha > 100 then
        raise exception 'A linha inicial deve ficar entre 1 e 100.';
    end if;
    if v_minima < 0 or v_minima > 4000 then
        raise exception 'O tamanho minimo da linha deve ficar entre 0 e 4000.';
    end if;

    if v_tipo = 'posicional' then
        /* no posicional o separador nao existe: guardamos ';' por preenchimento */
        v_delim := ';';
    else
        v_delim := case p_delimitador
                     when '\t'   then E'\t'
                     when 'tab'  then E'\t'
                     when 'TAB'  then E'\t'
                     else coalesce(nullif(btrim(p_delimitador), ''), ';')
                   end;
        if v_delim not in (';', ',', '|', E'\t') then
            raise exception 'Delimitador invalido. Use ponto e virgula, virgula, barra vertical ou TAB.';
        end if;
    end if;

    v_campos    := public.layout_campos_validar(v_tipo, p_campos);
    v_fixos     := public.layout_fixos_validar(p_fixos);
    v_derivados := public.layout_derivados_validar(p_derivados);

    /* o campo que serve de base para uma regra precisa existir no layout */
    for v_chave, v_regra in select * from jsonb_each(v_derivados) loop
        if not (v_campos ? (v_regra ->> 'de')) and not (v_derivados ? (v_regra ->> 'de')) then
            raise exception 'O campo "%" e montado a partir de "%", que nao esta no layout.',
                v_chave, v_regra ->> 'de';
        end if;
    end loop;

    insert into public.layout_mapa (
        empresa_id, layout_controle, tipo, delimitador, linha_inicial,
        tem_cabecalho, linha_minima, codificacao, campos, fixos, derivados
    )
    values (
        v_sessao.empresa_id, p_controle, v_tipo, v_delim, v_linha,
        coalesce(p_tem_cabecalho, false), v_minima, 'UTF-8', v_campos, v_fixos, v_derivados
    )
    on conflict (layout_controle) do update
        set tipo          = excluded.tipo,
            delimitador   = excluded.delimitador,
            linha_inicial = excluded.linha_inicial,
            tem_cabecalho = excluded.tem_cabecalho,
            linha_minima  = excluded.linha_minima,
            codificacao   = excluded.codificacao,
            campos        = excluded.campos,
            fixos         = excluded.fixos,
            derivados     = excluded.derivados,
            atualizado_em = now()
    returning layout_mapa.id into v_id;

    return v_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. CATALOGO DE LAYOUTS DO LEGADO
-- -----------------------------------------------------------------------------
create table if not exists public.catalogo_layout (
    nome_normalizado text        not null,
    tipo            varchar(12)  not null default 'posicional',
    delimitador     varchar(4)   not null default ';',
    linha_inicial   integer      not null default 1,
    tem_cabecalho   boolean      not null default false,
    linha_minima    integer      not null default 0,
    campos          jsonb        not null default '{}'::jsonb,
    fixos           jsonb        not null default '{}'::jsonb,
    derivados       jsonb        not null default '{}'::jsonb,
    atualizado_em   timestamp    not null default now(),
    constraint pk_catalogo_layout primary key (nome_normalizado)
);

comment on table public.catalogo_layout is
    'Layouts das fabricas com integracao, transcritos de Negocio/boPedido.cs. Servem de semente: a empresa pode ajustar pela tela Fabricas.';

alter table public.catalogo_layout enable row level security;
revoke all on table public.catalogo_layout from anon, authenticated;

/* Transpaese (LayoutId 16 no legado) */
insert into public.catalogo_layout (
    nome_normalizado, tipo, delimitador, linha_inicial, tem_cabecalho, linha_minima,
    campos, fixos, derivados
)
values (
    public.normalizar_nome_fabrica('Transpaese'),
    'posicional',
    ';',
    1,
    false,
    70,
    '{
        "ordcompra":  {"pos": 0,  "len": 20, "zeros": true},
        "etiqueta":   {"pos": 20, "len": 26},
        "pecliente":  {"pos": 36, "len": 7},
        "volume":     {"pos": 46, "len": 4},
        "descricao1": {"pos": 70, "len": 0}
     }'::jsonb,
    '{"ordcompra": "--", "descricao1": "SEM DESCRIÇÃO", "cliente": "NÃO INFORMADO", "qtde": 1, "volume": 1}'::jsonb,
    '{
        "produto": {
            "de": "etiqueta",
            "se_prefixo": "00000",
            "pos": 5,
            "len": 9,
            "senao_pos": 0,
            "senao_len": 14,
            "senao_zeros": true,
            "padrao": "0"
        },
        "sequencia": {"de": "etiqueta", "ultimos": 3}
     }'::jsonb
)
on conflict (nome_normalizado) do update
    set tipo          = excluded.tipo,
        linha_minima  = excluded.linha_minima,
        campos        = excluded.campos,
        fixos         = excluded.fixos,
        derivados     = excluded.derivados,
        atualizado_em = now();

/** Aplica o catalogo nas fabricas da empresa que ainda NAO tem layout. */
create or replace function public.aplicar_layout_catalogo(p_empresa_id bigint)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_aplicados integer;
begin
    if p_empresa_id is null then
        raise exception 'Informe a empresa.';
    end if;

    insert into public.layout_mapa (
        empresa_id, layout_controle, tipo, delimitador, linha_inicial,
        tem_cabecalho, linha_minima, codificacao, campos, fixos, derivados
    )
    select l.empresa_id,
           l.controle,
           c.tipo,
           c.delimitador,
           c.linha_inicial,
           c.tem_cabecalho,
           c.linha_minima,
           'UTF-8',
           c.campos,
           c.fixos,
           c.derivados
    from public.layout l
    join public.catalogo_layout c
      on c.nome_normalizado = public.normalizar_nome_fabrica(l.nome)
    where l.empresa_id = p_empresa_id
      and not exists (
          select 1 from public.layout_mapa m where m.layout_controle = l.controle
      );

    get diagnostics v_aplicados = row_count;
    return v_aplicados;
end;
$$;

comment on function public.aplicar_layout_catalogo(bigint) is
    'Grava o layout do catalogo nas fabricas da empresa que ainda nao tem layout (nunca sobrescreve o que o cliente configurou).';

revoke all on function public.aplicar_layout_catalogo(bigint) from public;
grant execute on function public.aplicar_layout_catalogo(bigint) to service_role;

/* autocadastro passa a semear tambem os layouts conhecidos */
create or replace function public.criar_fabricas_padrao(p_empresa_id bigint)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_base    integer;
    v_criadas integer;
begin
    if p_empresa_id is null then
        raise exception 'Informe a empresa.';
    end if;

    /* `controle` e PK global: serializa o calculo para dois cadastros ao mesmo tempo */
    perform pg_advisory_xact_lock(hashtext('sysconf.layout.controle'));

    select coalesce(max(l.controle), 0) into v_base from public.layout l;

    insert into public.layout (controle, nome, flativo, empresa_id)
    select v_base + c.ordem, c.nome, 1, p_empresa_id
    from public.catalogo_fabrica c
    where not exists (
        select 1
        from public.layout existente
        where existente.empresa_id = p_empresa_id
          and lower(existente.nome) = lower(c.nome)
    )
    order by c.ordem;

    get diagnostics v_criadas = row_count;

    /* fabricas recem-criadas que tem layout no catalogo (ex.: Transpaese) */
    perform public.aplicar_layout_catalogo(p_empresa_id);

    return v_criadas;
end;
$$;

/* BACKFILL: aplica o catalogo nas empresas que ja existem */
do $backfill$
declare
    v_empresa record;
    v_total   integer := 0;
    v_parcial integer;
begin
    for v_empresa in select e.id from public.empresa e loop
        select public.aplicar_layout_catalogo(v_empresa.id) into v_parcial;
        v_total := v_total + coalesce(v_parcial, 0);
    end loop;
    raise notice 'Layouts do catalogo aplicados: %', v_total;
end;
$backfill$;


-- -----------------------------------------------------------------------------
-- 5. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.fabricas_admin(text) from public;
revoke all on function public.layout_da_fabrica(text, integer) from public;
revoke all on function public.layout_salvar(text, integer, text, text, integer, boolean, integer, jsonb, jsonb, jsonb) from public;
revoke all on function public.layout_campos_validar(text, jsonb) from public;
revoke all on function public.layout_fixos_validar(jsonb) from public;
revoke all on function public.layout_derivados_validar(jsonb) from public;

grant execute on function public.fabricas_admin(text)                                                        to anon, authenticated;
grant execute on function public.layout_da_fabrica(text, integer)                                            to anon, authenticated;
grant execute on function public.layout_salvar(text, integer, text, text, integer, boolean, integer, jsonb, jsonb, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- select empresa_id, layout_controle, tipo, linha_minima from public.layout_mapa order by empresa_id, layout_controle;
-- select l.nome, m.tipo, m.campos from public.layout l
--   join public.layout_mapa m on m.layout_controle = l.controle where l.nome ilike 'transpaese';
-- erro esperado: layout_salvar posicional sem etiqueta -> 'Escolha qual coluna ... ETIQUETA'
-- erro esperado: fixos com etiqueta  -> 'A etiqueta nao pode ser valor fixo'
-- erro esperado: derivado de campo inexistente -> '... nao esta no layout.'


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- delete from public.layout_mapa where tipo = 'posicional';
-- drop function if exists public.aplicar_layout_catalogo(bigint);
-- drop table if exists public.catalogo_layout;
-- alter table public.layout_mapa drop column if exists derivados;
-- alter table public.layout_mapa drop column if exists fixos;
-- alter table public.layout_mapa drop column if exists linha_minima;
-- alter table public.layout_mapa drop column if exists tipo;
-- (as funcoes antigas voltam rodando a migracao 00104 de novo)
