-- =============================================================================
-- SysConf - Trocar o ENDERECO (slug) da empresa, sem quebrar os links antigos
-- Arquivo : supabase/migrations/20260921000114_empresa_slug.sql
--
-- PEDIDO DO CLIENTE: poder configurar o endereco (/sysconf/<slug>) na tela
-- "Dados da empresa". A regra anterior era "o slug nao muda"; agora muda, mas
-- com uma rede de protecao:
--
--   1. o endereco ANTIGO fica guardado na tabela `empresa_slug` (apelido);
--   2. `empresa_por_slug` resolve o endereco ATUAL e tambem os apelidos, entao
--      o atalho/ link que a equipe ja tem continua abrindo o sistema;
--   3. o app, ao cair por um endereco antigo, REDIRECIONA para o atual (o
--      navegador passa a mostrar o endereco novo) — o link velho nunca da 404.
--
-- VALIDACOES DO NOVO ENDERECO (as mesmas do autocadastro):
--   * 3 a 30 caracteres, letras sem acento/numeros/hifen, sem comecar ou
--     terminar com hifen;
--   * nao pode ser um nome reservado do sistema (sysconf, entrar, registrar...);
--   * nao pode estar em uso por outra empresa (nem como apelido dela);
--   * se o endereco pedido for um apelido da PROPRIA empresa, ele volta a ser
--     o endereco atual (isso permite voltar atras depois de trocar).
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
--               (aplique DEPOIS da 20260921000113_empresa_dados.sql)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. APELIDOS (enderecos antigos da empresa)
-- -----------------------------------------------------------------------------
create table if not exists public.empresa_slug (
    empresa_id bigint      not null references public.empresa (id) on delete cascade,
    slug       varchar(40) not null,
    criado_em  timestamp   not null default now(),
    constraint pk_empresa_slug primary key (empresa_id, slug)
);

comment on table public.empresa_slug is
    'Enderecos ANTIGOS da empresa: continuam resolvendo para ela (o app redireciona para o endereco atual).';

alter table public.empresa_slug enable row level security;
revoke all on table public.empresa_slug from anon, authenticated;

/* o endereco e um espaco unico: nem duas empresas nem um apelido podem repetir */
create unique index if not exists ux_empresa_slug_antigo on public.empresa_slug (lower(slug));


-- -----------------------------------------------------------------------------
-- 2. RESOLVER O ENDERECO (atual ou antigo)
--    O retorno traz sempre o slug ATUAL — e o que o app usa para redirecionar.
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
    union all
    select e.id, e.slug, e.nome, e.ativo, e.trial_ate
      from public.empresa_slug a
      join public.empresa e on e.id = a.empresa_id
     where lower(a.slug) = lower(btrim(coalesce(p_slug, '')))
     limit 1;
$$;


-- -----------------------------------------------------------------------------
-- 3. GRAVAR: nome, responsavel, e-mail e (agora) o ENDERECO
--    O tipo de retorno continua `integer`, mas a lista de argumentos ganha o
--    p_slug — por isso o DROP antes: mudar a assinatura cria uma SOBRECARGA, e
--    ficariam duas versoes da funcao no banco.
-- -----------------------------------------------------------------------------
drop function if exists public.empresa_atualizar(text, text, text, text);

create or replace function public.empresa_atualizar(
    p_token         text,
    p_nome          text,
    p_responsavel   text default null,
    p_email_contato text default null,
    p_slug          text default null
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_sessao  public.sessao := public.sessao_aberta(p_token);
    v_nome    text := btrim(coalesce(p_nome, ''));
    v_resp    varchar(120) := nullif(btrim(coalesce(p_responsavel, '')), '');
    v_email   varchar(160) := nullif(btrim(coalesce(p_email_contato, '')), '');
    v_slug    text := lower(btrim(coalesce(p_slug, '')));
    v_atual   varchar(40);
    v_trocou  boolean := false;
begin
    perform public.exigir_admin(v_sessao);

    /* ---- dados cadastrais ------------------------------------------------- */
    if length(v_nome) < 2 or length(v_nome) > 120 then
        raise exception 'Informe o nome da empresa (de 2 a 120 caracteres).';
    end if;

    if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'E-mail de contato inválido: "%".', v_email;
    end if;

    select e.slug into v_atual from public.empresa e where e.id = v_sessao.empresa_id;

    if v_atual is null then
        raise exception 'Empresa da sessao nao encontrada.' using errcode = 'P0002';
    end if;

    /* ---- endereco (so quando veio preenchido e diferente do atual) -------- */
    if v_slug <> '' and lower(v_slug) <> lower(v_atual) then

        if v_slug !~ '^[a-z0-9]([a-z0-9-]{1,28})[a-z0-9]$' then
            raise exception 'O endereco deve ter de 3 a 30 caracteres, apenas letras sem acento, numeros e hifen (nao pode comecar nem terminar com hifen).';
        end if;

        if v_slug in ('sysconf', 'entrar', 'registrar', 'login', 'api', 'admin', 'www',
                      'app', 'suporte', 'contato', 'painel', 'conferencia',
                      'importacao', 'usuarios', 'empresa', 'estagios', 'locais', 'logs') then
            raise exception 'O endereco "%" e reservado pelo sistema. Escolha outro.', v_slug;
        end if;

        if exists (select 1 from public.empresa e
                    where lower(e.slug) = v_slug and e.id <> v_sessao.empresa_id) then
            raise exception 'O endereco "%" ja esta em uso por outra empresa. Escolha outro.', v_slug;
        end if;

        if exists (select 1 from public.empresa_slug a
                    where lower(a.slug) = v_slug and a.empresa_id <> v_sessao.empresa_id) then
            raise exception 'O endereco "%" ja foi usado por outra empresa. Escolha outro.', v_slug;
        end if;

        /* voltar para um endereco que ja foi desta empresa: ele deixa de ser apelido */
        delete from public.empresa_slug a
         where a.empresa_id = v_sessao.empresa_id and lower(a.slug) = v_slug;

        /* o endereco que sai vira apelido, para o link antigo continuar valendo */
        insert into public.empresa_slug (empresa_id, slug)
        values (v_sessao.empresa_id, v_atual)
        on conflict (empresa_id, slug) do nothing;

        update public.empresa e set slug = v_slug where e.id = v_sessao.empresa_id;
        v_trocou := true;
    end if;

    update public.empresa e
       set nome          = v_nome,
           responsavel   = v_resp,
           email_contato = v_email
     where e.id = v_sessao.empresa_id;

    return case when v_trocou then 2 else 1 end;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.empresa_atualizar(text, text, text, text, text) from public;
grant execute on function public.empresa_atualizar(text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- select * from public.empresa_por_slug('novomundo');   -- endereco atual
-- select * from public.empresa_por_slug('novomundo2');  -- apelido (se trocou)
-- select e.slug as atual, a.slug as antigo
--   from public.empresa e left join public.empresa_slug a on a.empresa_id = e.id
--  order by e.id;
--
-- ROLLBACK
-- drop function if exists public.empresa_atualizar(text, text, text, text, text);
-- drop table if exists public.empresa_slug;
-- (empresa_por_slug volta rodando a 20260914000101)
