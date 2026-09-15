-- =============================================================================
-- SysConf - Sessao + RPCs autenticados (etapa 1 de 2 do endurecimento)
-- Arquivo : supabase/migrations/20260914000101_sessao_e_rpcs_autenticados.sql
--
-- MOTIVO (medido com a chave publishable, que vai no bundle do navegador):
--   1. `select login, senha from usuario`            -> PERMITIDO (senha em claro)
--   2. `select * from pedido` de outra empresa       -> PERMITIDO
--   3. RPC exec_scalar/exec_dml (SQL arbitrario)     -> PERMITIDO (ate DDL!)
--   4. `POST /usuario` criando um ADMIN              -> PERMITIDO
--   5. `DELETE /pedido`                              -> PERMITIDO
--
-- ESTA MIGRACAO E ADITIVA: nada e revogado aqui, o app antigo continua
-- funcionando. Ela cria a IDENTIDADE (token de sessao) e os RPCs que passam a
-- fazer todo o acesso a dados no lugar do REST direto.
--
-- A migracao 00102 fecha a porta: RLS em todas as tabelas, revoga os GRANTs das
-- tabelas para anon/authenticated e revoga exec_sql/exec_dml/exec_scalar.
-- Ela SO deve ser aplicada depois que o app novo (com token) estiver no ar.
--
-- SENHAS: `usuario.senha` (texto plano) continua existindo porque o WinForms
-- legado compara direto. A partir daqui o login usa `usuario.senha_hash`
-- (bcrypt/pgcrypto) quando existir e GRAVA o hash no primeiro login com senha
-- em claro. A coluna em claro so pode ser removida quando o WinForms morrer.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. SESSAO
-- -----------------------------------------------------------------------------
create table if not exists public.sessao (
    token      uuid        not null default gen_random_uuid(),
    usuario_id bigint      not null references public.usuario (id) on delete cascade,
    empresa_id bigint      not null references public.empresa (id) on delete cascade,
    perfil     varchar(20) not null default 'OPERADOR',
    criado_em  timestamp   not null default now(),
    expira_em  timestamp   not null,
    ativo      boolean     not null default true,
    constraint pk_sessao primary key (token)
);

create index if not exists ix_sessao_usuario on public.sessao (usuario_id);
create index if not exists ix_sessao_empresa on public.sessao (empresa_id);

comment on table public.sessao is
    'Sessoes do app web. O token e o que o navegador envia em cada RPC (12 horas).';

/* sem grant nenhum para anon/authenticated: a tabela so existe para os RPCs */
alter table public.sessao enable row level security;

alter table public.usuario add column if not exists senha_hash varchar(100);

comment on column public.usuario.senha_hash is
    'bcrypt (pgcrypto) usado pelo app web. `senha` em claro fica so para o WinForms legado.';


-- -----------------------------------------------------------------------------
-- 2. HELPERS DE SESSAO (uso interno dos RPCs, nao expostos na API)
-- -----------------------------------------------------------------------------
create or replace function public.sessao_aberta(p_token text)
returns public.sessao
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao;
begin
    if p_token is null or btrim(p_token) = '' then
        raise exception 'Sessao nao informada. Entre novamente.' using errcode = 'P0002';
    end if;

    if btrim(p_token) !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
        raise exception 'Sessao invalida. Entre novamente.' using errcode = 'P0002';
    end if;

    select s.* into v_sessao
    from public.sessao s
    join public.usuario u on u.id = s.usuario_id
    where s.token = btrim(p_token)::uuid
      and s.ativo
      and s.expira_em > now()
      and u.ativo;

    if not found then
        raise exception 'Sessao expirada ou usuario inativo. Entre novamente.' using errcode = 'P0002';
    end if;

    return v_sessao;
end;
$$;

create or replace function public.exigir_admin(p_sessao public.sessao)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if coalesce(p_sessao.perfil, 'OPERADOR') <> 'ADMIN' then
        raise exception 'Apenas o administrador da empresa pode fazer isso.' using errcode = 'P0002';
    end if;
end;
$$;

/* helpers internos: nada de chamada pela API */
revoke all on function public.sessao_aberta(text) from public;
revoke all on function public.exigir_admin(public.sessao) from public;


-- -----------------------------------------------------------------------------
-- 3. LOGIN / SESSAO
-- -----------------------------------------------------------------------------
-- Passa a devolver o `token`. A comparacao usa o hash quando existir e, no
-- primeiro login com senha em claro (usuarios antigos), grava o hash.
-- (o DROP e obrigatorio: `create or replace` nao muda o tipo de retorno)
drop function if exists public.login_usuario(text, text, text);

create or replace function public.login_usuario(p_empresa text, p_login text, p_senha text)
returns table (
    id           bigint,
    login        varchar,
    nome         varchar,
    perfil       varchar,
    empresa_id   bigint,
    empresa_slug varchar,
    empresa_nome varchar,
    token        uuid
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
    v_empresa text := lower(btrim(coalesce(p_empresa, '')));
    v_login   text := lower(btrim(coalesce(p_login, '')));
    v_senha   text := coalesce(p_senha, '');
    v_usuario public.usuario;
    v_emp       public.empresa;
    v_token     uuid;
begin
    select * into v_emp from public.empresa e
    where lower(e.slug) = v_empresa and e.ativo = 1;

    if not found then
        return;         /* empresa inexistente/inativa: 0 linhas, como antes */
    end if;

    select * into v_usuario from public.usuario u
    where u.empresa_id = v_emp.id and lower(u.login) = v_login and u.ativo;

    if not found then
        return;
    end if;

    if v_usuario.senha_hash is not null then
        if v_usuario.senha_hash <> crypt(v_senha, v_usuario.senha_hash) then
            return;
        end if;
    else
        if coalesce(v_usuario.senha, '') <> v_senha then
            return;
        end if;
        /* migra para bcrypt sem exigir troca de senha */
        update public.usuario u
           set senha_hash = crypt(v_senha, gen_salt('bf', 10))
         where u.id = v_usuario.id;
    end if;

    /* limpa sessoes vencidas deste usuario e abre uma nova (12 horas) */
    delete from public.sessao s where s.usuario_id = v_usuario.id and s.expira_em < now();

    insert into public.sessao (usuario_id, empresa_id, perfil, expira_em)
    values (v_usuario.id, v_emp.id, coalesce(v_usuario.perfil, 'OPERADOR'), now() + interval '12 hours')
    returning sessao.token into v_token;

    return query
        select v_usuario.id, v_usuario.login, v_usuario.nome,
               coalesce(v_usuario.perfil, 'OPERADOR')::varchar, v_emp.id, v_emp.slug, v_emp.nome, v_token;
end;
$$;

/** Usada ao carregar a pagina: valida o token guardado e devolve a sessao. */
create or replace function public.sessao_atual(p_token text)
returns table (
    id           bigint,
    login        varchar,
    nome         varchar,
    perfil       varchar,
    empresa_id   bigint,
    empresa_slug varchar,
    empresa_nome varchar,
    token        uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao;
begin
    v_sessao := public.sessao_aberta(p_token);

    return query
        select u.id, u.login, u.nome, coalesce(u.perfil, 'OPERADOR')::varchar,
               e.id, e.slug, e.nome, v_sessao.token
        from public.usuario u
        join public.empresa e on e.id = u.empresa_id
        where u.id = v_sessao.usuario_id and u.ativo and e.ativo = 1;
end;
$$;

/** Encerra a sessao (botao Sair). */
create or replace function public.sair_usuario(p_token text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_apagadas integer;
begin
    if p_token is null or btrim(p_token) !~ '^[0-9a-fA-F-]{36}$' then
        return 0;
    end if;

    delete from public.sessao s where s.token = btrim(p_token)::uuid;
    get diagnostics v_apagadas = row_count;
    return v_apagadas;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. EMPRESA (sem token: a URL precisa resolver o slug ANTES do login)
-- -----------------------------------------------------------------------------
create or replace function public.empresa_por_slug(p_slug text)
returns table (id bigint, slug varchar, nome varchar, ativo integer, trial_ate timestamp)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select e.id, e.slug, e.nome, e.ativo, e.trial_ate
    from public.empresa e
    where lower(e.slug) = lower(btrim(coalesce(p_slug, '')))
    limit 1;
$$;

/** Diretorio publico: usado pelo campo "Empresa" da tela de entrada. */
create or replace function public.empresas_publicas()
returns table (slug varchar, nome varchar)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select e.slug, e.nome from public.empresa e where e.ativo = 1 order by e.nome;
$$;


-- -----------------------------------------------------------------------------
-- 5. CADASTROS DA EMPRESA (fabricas e boxes)
-- -----------------------------------------------------------------------------
create or replace function public.fabricas_listar(p_token text)
returns table (controle integer, nome varchar)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select l.controle, l.nome
        from public.layout l
        where l.empresa_id = v_sessao.empresa_id and l.flativo = 1
        order by l.nome;
end;
$$;

create or replace function public.boxes_listar(p_token text)
returns table (idbox integer, nmbox varchar)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select b.idbox, b.nmbox
        from public.box b
        where b.empresa_id = v_sessao.empresa_id and b.ativo = 1
        order by b.nmbox;
end;
$$;


-- -----------------------------------------------------------------------------
-- 6. PEDIDOS
-- -----------------------------------------------------------------------------
create or replace function public.pedidos_listar(p_token text, p_idlayout integer)
returns setof public.pedido
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
begin
    return query
        select p.*
        from public.pedido p
        where p.empresa_id = v_sessao.empresa_id
          and p.idlayout = p_idlayout
        order by p.id;
end;
$$;

/** Baixa de UMA etiqueta — gravada na hora, a cada bipagem com sucesso. */
create or replace function public.pedido_status_id(p_token text, p_id bigint, p_status integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_linhas integer;
begin
    update public.pedido p
       set status = p_status
     where p.id = p_id
       and p.empresa_id = v_sessao.empresa_id;      /* impede alterar pedido de outra empresa */

    get diagnostics v_linhas = row_count;
    return v_linhas;
end;
$$;

/** Menu de contexto: o legado grava por ETIQUETA. */
create or replace function public.pedido_status_etiquetas(p_token text, p_etiquetas text[], p_status integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_linhas integer;
begin
    update public.pedido p
       set status = p_status
     where p.empresa_id = v_sessao.empresa_id
       and p.etiqueta = any (p_etiquetas);

    get diagnostics v_linhas = row_count;
    return v_linhas;
end;
$$;

/** Importacao em lote. Empresa e fabrica vem da SESSAO, nunca do navegador. */
create or replace function public.pedidos_inserir(p_token text, p_idlayout integer, p_pedidos jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao    public.sessao := public.sessao_aberta(p_token);
    v_inseridos integer;
begin
    if p_pedidos is null or jsonb_typeof(p_pedidos) <> 'array' then
        raise exception 'Nenhuma linha para importar.';
    end if;

    if not exists (
        select 1 from public.layout l
        where l.controle = p_idlayout and l.empresa_id = v_sessao.empresa_id
    ) then
        raise exception 'Fabrica invalida para esta empresa.' using errcode = 'P0002';
    end if;

    insert into public.pedido (
        arquivo, ordcompra, cliente, pecliente, produto, descricao1, qtde, etiqueta,
        volume, sequencia, status, datainc, idlayout, idbox, flbloqueio, pecomputador,
        pecoletor, codcliente, volume2, idgrupo, empresa_id
    )
    select x.arquivo, x.ordcompra, x.cliente, x.pecliente, x.produto, x.descricao1,
           coalesce(x.qtde, 0), x.etiqueta, coalesce(x.volume, 0), coalesce(x.sequencia, 0),
           coalesce(x.status, 0), coalesce(x.datainc, now()::timestamp), p_idlayout,
           coalesce(x.idbox, 1), coalesce(x.flbloqueio, false), x.pecomputador,
           x.pecoletor, x.codcliente, x.volume2, x.idgrupo, v_sessao.empresa_id
    from jsonb_to_recordset(p_pedidos) as x(
        arquivo      varchar,
        ordcompra    varchar,
        cliente      varchar,
        pecliente    varchar,
        produto      varchar,
        descricao1   varchar,
        qtde         numeric,
        etiqueta     varchar,
        volume       numeric,
        sequencia    numeric,
        status       integer,
        datainc      timestamp,
        idbox        integer,
        flbloqueio   boolean,
        pecomputador varchar,
        pecoletor    varchar,
        codcliente   varchar,
        volume2      numeric,
        idgrupo      integer
    );

    get diagnostics v_inseridos = row_count;
    return v_inseridos;
end;
$$;


-- -----------------------------------------------------------------------------
-- 7. BUSCA (as duas consultas que antes iam por exec_sql)
-- -----------------------------------------------------------------------------
/** Combo "buscar em": mesma consulta do Form1, com coluna validada por lista. */
create or replace function public.buscar_valores(p_token text, p_idlayout integer, p_coluna text)
returns table (valor text, descricao text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_col    text;
    v_sql    text;
begin
    v_col := case upper(btrim(coalesce(p_coluna, '')))
                 when 'ORDCOMPRA' then 'ordcompra'
                 when 'PECLIENTE' then 'pecliente'
                 when 'ARQUIVO'   then 'arquivo'
                 else null
             end;
    if v_col is null then
        raise exception 'Coluna de busca invalida.';
    end if;

    /* %I com valor de lista fechada: sem risco de injecao */
    v_sql := format(
        'select p.%1$I::text as valor, '
        '       (p.%1$I::text || '' ('' || count(*)::text || '')'') as descricao '
        'from public.pedido p '
        'where p.empresa_id = $1 and p.idlayout = $2 %3$s '
        'group by p.%1$I order by p.%1$I',
        v_col,
        '',
        case when v_col = 'arquivo' then 'and p.datainc >= ''2023-12-10 00:00:00''::timestamp' else '' end
    );

    return query execute v_sql using v_sessao.empresa_id, p_idlayout;
end;
$$;

/** Busca do legado (btnBuscar_Click): substitui o conteudo do grid. */
create or replace function public.buscar_pedidos_filtro(
    p_token     text,
    p_idlayout  integer,
    p_coluna    text,
    p_valores   text[]
)
returns setof public.pedido
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_col    text;
    v_sql    text;
begin
    v_col := case upper(btrim(coalesce(p_coluna, '')))
                 when 'ORDCOMPRA' then 'ordcompra'
                 when 'PECLIENTE' then 'pecliente'
                 when 'ARQUIVO'   then 'arquivo'
                 else null
             end;
    if v_col is null then
        raise exception 'Coluna de busca invalida.';
    end if;

    v_sql := format(
        'select p.* from public.pedido p '
        'where p.empresa_id = $1 and p.idlayout = $2 '
        '  and trim(p.%1$I::text) = any ($3)',
        v_col
    );

    return query execute v_sql using v_sessao.empresa_id, p_idlayout, p_valores;
end;
$$;

/** O grid mostra a fabrica pelo nome (antes vinha de um JOIN no exec_sql). */
create or replace function public.fabrica_nome(p_token text, p_controle integer)
returns varchar
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_nome   varchar;
begin
    select l.nome into v_nome
    from public.layout l
    where l.controle = p_controle and l.empresa_id = v_sessao.empresa_id;
    return v_nome;
end;
$$;


-- -----------------------------------------------------------------------------
-- 8. USUARIOS DA EMPRESA (somente ADMIN, sempre da propria empresa)
-- -----------------------------------------------------------------------------
create or replace function public.usuarios_listar(p_token text)
returns table (id bigint, login varchar, nome varchar, perfil varchar, ativo boolean)
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
        select u.id, u.login, u.nome, coalesce(u.perfil, 'OPERADOR')::varchar, u.ativo
        from public.usuario u
        where u.empresa_id = v_sessao.empresa_id
        order by u.login;
end;
$$;

create or replace function public.usuario_criar(
    p_token  text,
    p_login  text,
    p_nome   text,
    p_senha  text,
    p_perfil text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_login  text := upper(btrim(coalesce(p_login, '')));
    v_perfil text := upper(btrim(coalesce(p_perfil, 'OPERADOR')));
    v_id     bigint;
begin
    perform public.exigir_admin(v_sessao);

    if length(v_login) < 3 or length(v_login) > 30 then
        raise exception 'O usuario deve ter de 3 a 30 caracteres.';
    end if;
    if v_login !~ '^[A-Z0-9][A-Z0-9._-]*$' then
        raise exception 'O usuario aceita apenas letras, numeros, ponto, hifen e sublinhado.';
    end if;
    if length(coalesce(p_senha, '')) < 4 or length(p_senha) > 15 then
        raise exception 'A senha deve ter de 4 a 15 caracteres.';
    end if;
    if v_perfil not in ('ADMIN', 'OPERADOR') then
        raise exception 'Perfil invalido.';
    end if;
    if exists (select 1 from public.usuario u
               where u.empresa_id = v_sessao.empresa_id and lower(u.login) = lower(v_login)) then
        raise exception 'Ja existe um usuario "%" nesta empresa.', v_login;
    end if;

    insert into public.usuario (empresa_id, login, senha, senha_hash, nivel, nome, perfil, ativo)
    values (v_sessao.empresa_id, v_login, p_senha, crypt(p_senha, gen_salt('bf', 10)),
            v_perfil, nullif(btrim(coalesce(p_nome, '')), ''), v_perfil, true)
    returning usuario.id into v_id;

    return v_id;
end;
$$;

create or replace function public.usuario_atualizar(
    p_token  text,
    p_id     bigint,
    p_login  text,
    p_nome   text,
    p_senha  text,
    p_perfil text,
    p_ativo  boolean
)
returns integer
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
    v_sessao  public.sessao := public.sessao_aberta(p_token);
    v_alvo    public.usuario;
    v_login   text := upper(btrim(coalesce(p_login, '')));
    v_perfil  text := nullif(upper(btrim(coalesce(p_perfil, ''))), '');
    v_admins  integer;
    v_linhas  integer;
begin
    perform public.exigir_admin(v_sessao);

    select * into v_alvo from public.usuario u
    where u.id = p_id and u.empresa_id = v_sessao.empresa_id;
    if not found then
        raise exception 'Usuario nao encontrado nesta empresa.' using errcode = 'P0002';
    end if;

    if length(v_login) < 3 or length(v_login) > 30 then
        raise exception 'O usuario deve ter de 3 a 30 caracteres.';
    end if;
    if v_login !~ '^[A-Z0-9][A-Z0-9._-]*$' then
        raise exception 'O usuario aceita apenas letras, numeros, ponto, hifen e sublinhado.';
    end if;
    if p_senha is not null and length(p_senha) > 0
       and (length(p_senha) < 4 or length(p_senha) > 15) then
        raise exception 'A senha deve ter de 4 a 15 caracteres.';
    end if;
    if v_perfil is not null and v_perfil not in ('ADMIN', 'OPERADOR') then
        raise exception 'Perfil invalido.';
    end if;
    if exists (select 1 from public.usuario u
               where u.empresa_id = v_sessao.empresa_id and lower(u.login) = lower(v_login)
                 and u.id <> p_id) then
        raise exception 'Ja existe um usuario "%" nesta empresa.', v_login;
    end if;

    /* nao deixar a empresa sem administrador, nem o proprio usuario se travar */
    if (v_alvo.id = v_sessao.usuario_id and coalesce(p_ativo, true) = false) then
        raise exception 'Voce nao pode inativar o proprio usuario.';
    end if;
    if (coalesce(v_alvo.perfil, 'OPERADOR') = 'ADMIN')
       and ((v_perfil is not null and v_perfil <> 'ADMIN') or coalesce(p_ativo, true) = false) then
        select count(*) into v_admins from public.usuario u
        where u.empresa_id = v_sessao.empresa_id
          and coalesce(u.perfil, 'OPERADOR') = 'ADMIN' and u.ativo;
        if v_admins <= 1 then
            raise exception 'A empresa precisa de pelo menos um administrador ativo.';
        end if;
    end if;

    update public.usuario u
       set login  = v_login,
           nivel  = coalesce(v_perfil, u.nivel),
           perfil = coalesce(v_perfil, u.perfil),
           nome   = nullif(btrim(coalesce(p_nome, '')), ''),
           ativo  = coalesce(p_ativo, u.ativo),
           senha  = case when p_senha is not null and length(p_senha) > 0 then p_senha else u.senha end,
           senha_hash = case when p_senha is not null and length(p_senha) > 0
                             then crypt(p_senha, gen_salt('bf', 10)) else u.senha_hash end,
           empresa_id = u.empresa_id          /* qualificado: veja nota do RETURNS TABLE */
     where u.id = p_id;

    get diagnostics v_linhas = row_count;

    /* se a senha do proprio usuario mudou, derruba as sessoes dele */
    if p_senha is not null and length(p_senha) > 0 then
        delete from public.sessao s
        where s.usuario_id = p_id and s.token <> v_sessao.token;
    end if;

    return v_linhas;
end;
$$;

create or replace function public.usuario_excluir(p_token text, p_id bigint)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao public.sessao := public.sessao_aberta(p_token);
    v_alvo   public.usuario;
    v_admins integer;
    v_linhas integer;
begin
    perform public.exigir_admin(v_sessao);

    select * into v_alvo from public.usuario u
    where u.id = p_id and u.empresa_id = v_sessao.empresa_id;
    if not found then
        raise exception 'Usuario nao encontrado nesta empresa.' using errcode = 'P0002';
    end if;
    if v_alvo.id = v_sessao.usuario_id then
        raise exception 'Voce nao pode excluir o proprio usuario.';
    end if;

    if coalesce(v_alvo.perfil, 'OPERADOR') = 'ADMIN' and v_alvo.ativo then
        select count(*) into v_admins from public.usuario u
        where u.empresa_id = v_sessao.empresa_id
          and coalesce(u.perfil, 'OPERADOR') = 'ADMIN' and u.ativo;
        if v_admins <= 1 then
            raise exception 'A empresa precisa de pelo menos um administrador ativo.';
        end if;
    end if;

    delete from public.usuario u where u.id = p_id;
    get diagnostics v_linhas = row_count;
    return v_linhas;
end;
$$;


-- -----------------------------------------------------------------------------
-- 9. AUTOCADASTRO passa a devolver o token (para o app ja entrar logado)
-- -----------------------------------------------------------------------------
-- (o DROP e obrigatorio: `create or replace` nao muda o tipo de retorno)
drop function if exists public.registrar_empresa(text, text, text, text, text, text);

create or replace function public.registrar_empresa(
    p_empresa text,
    p_slug    text,
    p_login   text,
    p_senha   text,
    p_nome    text default null,
    p_email   text default null
)
returns table (
    id           bigint,
    login        varchar,
    nome         varchar,
    perfil       varchar,
    empresa_id   bigint,
    empresa_slug varchar,
    empresa_nome varchar,
    token        uuid
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
    v_empresa text := btrim(coalesce(p_empresa, ''));
    v_slug    text := lower(btrim(coalesce(p_slug, '')));
    v_login   text := upper(btrim(coalesce(p_login, '')));
    v_senha   text := coalesce(p_senha, '');
    v_nome    text := nullif(btrim(coalesce(p_nome, '')), '');
    v_email   text := nullif(lower(btrim(coalesce(p_email, ''))), '');
    v_id      bigint;
    v_usuario bigint;
    v_token   uuid;
begin
    if length(v_empresa) < 2 then
        raise exception 'Informe o nome da empresa (minimo 2 caracteres).';
    end if;
    if length(v_empresa) > 120 then
        raise exception 'O nome da empresa deve ter no maximo 120 caracteres.';
    end if;

    if v_slug !~ '^[a-z0-9]([a-z0-9-]{1,28})[a-z0-9]$' then
        raise exception 'O endereco deve ter de 3 a 30 caracteres, apenas letras sem acento, numeros e hifen (nao pode comecar nem terminar com hifen).';
    end if;
    if v_slug in ('sysconf', 'entrar', 'registrar', 'login', 'api', 'admin', 'www',
                  'app', 'suporte', 'contato', 'painel', 'conferencia',
                  'importacao', 'usuarios') then
        raise exception 'O endereco "%" e reservado pelo sistema. Escolha outro.', v_slug;
    end if;
    if exists (select 1 from public.empresa e where lower(e.slug) = v_slug) then
        raise exception 'O endereco "%" ja esta em uso. Escolha outro.', v_slug;
    end if;

    if length(v_login) < 3 then
        raise exception 'O usuario deve ter no minimo 3 caracteres.';
    end if;
    if length(v_login) > 30 then
        raise exception 'O usuario deve ter no maximo 30 caracteres.';
    end if;
    if v_login !~ '^[A-Z0-9][A-Z0-9._-]*$' then
        raise exception 'O usuario aceita apenas letras, numeros, ponto, hifen e sublinhado.';
    end if;
    if length(v_senha) < 4 then
        raise exception 'A senha deve ter no minimo 4 caracteres.';
    end if;
    if length(v_senha) > 15 then
        raise exception 'A senha deve ter no maximo 15 caracteres (limite do sistema).';
    end if;
    if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'E-mail invalido.';
    end if;

    /* ATENCAO: as colunas de saida do RETURNS TABLE sao variaveis do PL/pgSQL;
       todo nome de coluna aqui precisa ser qualificado (erro 42702). */
    insert into public.empresa (slug, nome, ativo, trial_ate, responsavel, email_contato)
    values (v_slug, v_empresa, 1, now() + interval '30 days', v_nome, v_email)
    returning empresa.id into v_id;

    insert into public.usuario (empresa_id, login, senha, senha_hash, nivel, nome, perfil, ativo)
    values (v_id, v_login, v_senha, crypt(v_senha, gen_salt('bf', 10)),
            'ADMIN', coalesce(v_nome, v_login), 'ADMIN', true)
    returning usuario.id into v_usuario;

    perform public.criar_fabricas_padrao(v_id);

    insert into public.sessao (usuario_id, empresa_id, perfil, expira_em)
    values (v_usuario, v_id, 'ADMIN', now() + interval '12 hours')
    returning sessao.token into v_token;

    return query
        select u.id, u.login, u.nome, coalesce(u.perfil, 'ADMIN')::varchar, e.id, e.slug, e.nome, v_token
        from public.usuario u
        join public.empresa e on e.id = u.empresa_id
        where u.id = v_usuario
        limit 1;
end;
$$;


-- -----------------------------------------------------------------------------
-- 10. PERMISSOES (nada e revogado nesta etapa: o app antigo segue funcionando)
-- -----------------------------------------------------------------------------
revoke all on function public.empresa_por_slug(text) from public;
revoke all on function public.empresas_publicas() from public;
revoke all on function public.login_usuario(text, text, text) from public;
revoke all on function public.sessao_atual(text) from public;
revoke all on function public.sair_usuario(text) from public;
revoke all on function public.fabricas_listar(text) from public;
revoke all on function public.boxes_listar(text) from public;
revoke all on function public.pedidos_listar(text, integer) from public;
revoke all on function public.pedido_status_id(text, bigint, integer) from public;
revoke all on function public.pedido_status_etiquetas(text, text[], integer) from public;
revoke all on function public.pedidos_inserir(text, integer, jsonb) from public;
revoke all on function public.buscar_valores(text, integer, text) from public;
revoke all on function public.buscar_pedidos_filtro(text, integer, text, text[]) from public;
revoke all on function public.fabrica_nome(text, integer) from public;
revoke all on function public.usuarios_listar(text) from public;
revoke all on function public.usuario_criar(text, text, text, text, text) from public;
revoke all on function public.usuario_atualizar(text, bigint, text, text, text, text, boolean) from public;
revoke all on function public.usuario_excluir(text, bigint) from public;
revoke all on function public.registrar_empresa(text, text, text, text, text, text) from public;

grant execute on function public.empresa_por_slug(text)                                  to anon, authenticated;
grant execute on function public.empresas_publicas()                                     to anon, authenticated;
grant execute on function public.login_usuario(text, text, text)                          to anon, authenticated;
grant execute on function public.sessao_atual(text)                                       to anon, authenticated;
grant execute on function public.sair_usuario(text)                                       to anon, authenticated;
grant execute on function public.fabricas_listar(text)                                    to anon, authenticated;
grant execute on function public.boxes_listar(text)                                       to anon, authenticated;
grant execute on function public.pedidos_listar(text, integer)                            to anon, authenticated;
grant execute on function public.pedido_status_id(text, bigint, integer)                  to anon, authenticated;
grant execute on function public.pedido_status_etiquetas(text, text[], integer)           to anon, authenticated;
grant execute on function public.pedidos_inserir(text, integer, jsonb)                    to anon, authenticated;
grant execute on function public.buscar_valores(text, integer, text)                      to anon, authenticated;
grant execute on function public.buscar_pedidos_filtro(text, integer, text, text[])       to anon, authenticated;
grant execute on function public.fabrica_nome(text, integer)                              to anon, authenticated;
grant execute on function public.usuarios_listar(text)                                    to anon, authenticated;
grant execute on function public.usuario_criar(text, text, text, text, text)              to anon, authenticated;
grant execute on function public.usuario_atualizar(text, bigint, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.usuario_excluir(text, bigint)                            to anon, authenticated;
grant execute on function public.registrar_empresa(text, text, text, text, text, text)    to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (rodar depois de aplicar)
-- -----------------------------------------------------------------------------
-- select id, login, perfil, token from public.login_usuario('novomundo','ADMIN','trocar@123');
-- select senha_hash is not null as tem_hash from public.usuario where login = 'ADMIN';
-- select * from public.sessao order by criado_em desc limit 5;


-- -----------------------------------------------------------------------------
-- ROLLBACK (volta o login para a versao sem token e remove os RPCs novos)
-- -----------------------------------------------------------------------------
-- drop function if exists public.usuario_excluir(text, bigint);
-- drop function if exists public.usuario_atualizar(text, bigint, text, text, text, text, boolean);
-- drop function if exists public.usuario_criar(text, text, text, text, text);
-- drop function if exists public.usuarios_listar(text);
-- drop function if exists public.fabrica_nome(text, integer);
-- drop function if exists public.buscar_pedidos_filtro(text, integer, text, text[]);
-- drop function if exists public.buscar_valores(text, integer, text);
-- drop function if exists public.pedidos_inserir(text, integer, jsonb);
-- drop function if exists public.pedido_status_etiquetas(text, text[], integer);
-- drop function if exists public.pedido_status_id(text, bigint, integer);
-- drop function if exists public.pedidos_listar(text, integer);
-- drop function if exists public.boxes_listar(text);
-- drop function if exists public.fabricas_listar(text);
-- drop function if exists public.sair_usuario(text);
-- drop function if exists public.sessao_atual(text);
-- drop function if exists public.exigir_admin(public.sessao);
-- drop function if exists public.sessao_aberta(text);
-- drop table if exists public.sessao;
-- alter table public.usuario drop column if exists senha_hash;
-- (login_usuario e registrar_empresa voltam as versoes das migracoes 0009/0010)
