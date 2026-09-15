-- =============================================================================
-- SysConf - Catalogo padrao de fabricas no autocadastro (SaaS)
-- Arquivo : supabase/migrations/20260914000100_catalogo_fabricas_padrao.sql
--
-- PROBLEMA: `layout` e POR EMPRESA (migracao 0006). Uma empresa criada pelo
-- autocadastro (0009) nascia SEM fabrica nenhuma — o cliente entrava no sistema
-- e nao conseguia importar arquivo algum, porque o combo "Fabrica" vinha vazio.
--
-- SOLUCAO: um catalogo padrao (o mesmo conjunto de fabricas que tem integracao
-- instalada, vindo de Negocio/boPedido.cs) copiado para a empresa no momento do
-- autocadastro, pela funcao criar_fabricas_padrao().
--
-- ATENCAO a PK de `layout`: `controle` e PRIMARY KEY GLOBAL (migracao 0002),
-- nao (empresa_id, controle). Por isso os controles da empresa nova sao
-- calculados como max(controle) + ordem, sob pg_advisory_xact_lock para que
-- dois autocadastros simultaneos nao colidam.
--
-- O cliente pode editar o catalogo (incluir/remover fabricas padrao) direto na
-- tabela public.catalogo_fabrica. Ele NAO altera empresas ja criadas.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. CATALOGO
-- -----------------------------------------------------------------------------
create table if not exists public.catalogo_fabrica (
    ordem integer     not null,
    nome  varchar(60) not null,
    constraint pk_catalogo_fabrica primary key (ordem)
);

comment on table public.catalogo_fabrica is
    'Catalogo padrao de fabricas copiado para a empresa no autocadastro (criar_fabricas_padrao).';

/* As 29 fabricas do switch de Negocio/boPedido.cs + o layout generico.
   A ordem define apenas o `controle` gerado (a tela ordena por integracao e nome). */
insert into public.catalogo_fabrica (ordem, nome) values
    ( 1, 'CSV Padrão'),
    ( 2, 'Todeschini'),
    ( 3, 'Criare'),
    ( 4, 'Italinea'),
    ( 5, 'Unicasa'),
    ( 6, 'DalMobile'),
    ( 7, 'Romanzza'),
    ( 8, 'Inusitta'),
    ( 9, 'Idelli'),
    (10, 'SCA'),
    (11, 'Vitta'),
    (12, 'Rudnick'),
    (13, 'Simonetto'),
    (14, 'Marel'),
    (15, 'Italinea Loja'),
    (16, 'Kasak'),
    (17, 'Transpaese'),
    (18, 'IMOBAL'),
    (19, 'RIMO'),
    (20, 'CASTINI'),
    (21, 'Simonetto V2'),
    (22, 'Bartzen'),
    (23, 'Vivatto'),
    (24, 'HRM'),
    (25, 'MANFROI'),
    (26, 'Jaeli'),
    (27, 'Evviva'),
    (28, 'BARTZ'),
    (29, 'Evviva V2'),
    (30, 'MovelMar')
on conflict (ordem) do update set nome = excluded.nome;


-- -----------------------------------------------------------------------------
-- 2. COPIA DO CATALOGO PARA UMA EMPRESA
-- -----------------------------------------------------------------------------
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
    return v_criadas;
end;
$$;

comment on function public.criar_fabricas_padrao(bigint) is
    'Copia o catalogo padrao de fabricas para a empresa (usado no autocadastro; tambem serve para completar uma empresa existente).';


-- -----------------------------------------------------------------------------
-- 3. AUTOCADASTRO PASSA A SEMEAR O CATALOGO
--    (mesma funcao da migracao 0009 + a chamada de criar_fabricas_padrao)
-- -----------------------------------------------------------------------------
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
    empresa_nome varchar
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_empresa text := btrim(coalesce(p_empresa, ''));
    v_slug    text := lower(btrim(coalesce(p_slug, '')));
    v_login   text := upper(btrim(coalesce(p_login, '')));
    v_senha   text := coalesce(p_senha, '');
    v_nome    text := nullif(btrim(coalesce(p_nome, '')), '');
    v_email   text := nullif(lower(btrim(coalesce(p_email, ''))), '');
    v_id      bigint;
begin
    /* ---- empresa ---------------------------------------------------------- */
    if length(v_empresa) < 2 then
        raise exception 'Informe o nome da empresa (minimo 2 caracteres).';
    end if;
    if length(v_empresa) > 120 then
        raise exception 'O nome da empresa deve ter no maximo 120 caracteres.';
    end if;

    /* ---- endereco (slug) que vai na URL ---------------------------------- */
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

    /* ---- usuario administrador ------------------------------------------- */
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

    /* ---- criacao (empresa + admin + fabricas na mesma transacao) ---------- */
    /* ATENCAO: os nomes das colunas de saida do RETURNS TABLE (id, login, nome,
       perfil, empresa_id, empresa_slug, empresa_nome) viram variaveis do
       PL/pgSQL — por isso TODO nome de coluna aqui precisa ser qualificado
       (sem isso: "column reference id is ambiguous", erro 42702). */
    insert into public.empresa (slug, nome, ativo, trial_ate, responsavel, email_contato)
    values (v_slug, v_empresa, 1, now() + interval '30 days', v_nome, v_email)
    returning empresa.id into v_id;

    insert into public.usuario (empresa_id, login, senha, nivel, nome, perfil, ativo)
    values (v_id, v_login, v_senha, 'ADMIN', coalesce(v_nome, v_login), 'ADMIN', true);

    /* fabricas padrao: sem isso o cliente entra e nao tem o que importar */
    perform public.criar_fabricas_padrao(v_id);

    return query
        select u.id,
               u.login,
               u.nome,
               coalesce(u.perfil, 'ADMIN') as perfil,
               e.id,
               e.slug,
               e.nome
        from public.usuario u
        join public.empresa e on e.id = u.empresa_id
        where u.empresa_id = v_id
          and lower(u.login) = lower(v_login)
        limit 1;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. PERMISSOES
-- -----------------------------------------------------------------------------
-- catalogo: leitura livre, escrita nao (quem altera e o dono, via SQL/service role)
grant select on public.catalogo_fabrica to anon, authenticated;
revoke insert, update, delete on public.catalogo_fabrica from anon, authenticated;

-- criar_fabricas_padrao e chamada por dentro do autocadastro (SECURITY DEFINER),
-- nao precisa ser exposta na API:
revoke all on function public.criar_fabricas_padrao(bigint) from public;
grant execute on function public.criar_fabricas_padrao(bigint) to service_role;

-- o navegador so LE fabricas; a escrita passa a ser exclusiva do dono (SQL)
revoke insert, update, delete on public.layout from anon, authenticated;
grant select on public.layout to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO
-- -----------------------------------------------------------------------------
-- select count(*) from public.catalogo_fabrica;                                  -- 30
-- select public.registrar_empresa('Fabrica Teste','fabrica-teste','ADMIN','teste123');
-- select count(*) from public.layout where empresa_id = (select id from public.empresa where slug='fabrica-teste');  -- 30
-- select count(*) from public.layout where empresa_id = (select id from public.empresa where slug='novomundo');     -- 16 (intacto)
-- limpeza:
--   delete from public.layout  where empresa_id in (select id from public.empresa where slug='fabrica-teste');
--   delete from public.usuario where empresa_id in (select id from public.empresa where slug='fabrica-teste');
--   delete from public.empresa where slug='fabrica-teste';

-- completar o catalogo em uma empresa existente (ex.: homologacao):
--   select public.criar_fabricas_padrao((select id from public.empresa where slug='homologacao'));


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- revoke select on public.catalogo_fabrica from anon, authenticated;
-- drop function if exists public.criar_fabricas_padrao(bigint);
-- grant insert, update, delete on public.layout to anon, authenticated;
--   (registrar_empresa sem o seed: reaplicar a versao da migracao 0009)
-- drop table if exists public.catalogo_fabrica;
