-- =============================================================================
-- SysConf - Autocadastro de empresa (SaaS) + 30 dias de teste gratis
-- Arquivo : supabase/migrations/20260914000009_rpc_registrar_empresa.sql
--
-- Contexto: o SysConf passa a ser comercializado como SaaS e ganha uma landing
-- page com area de registro. Ate aqui o cadastro de empresa era feito SOMENTE
-- pelo banco (migracao 0006). Agora o autocadastro cria a empresa ATIVA e o
-- primeiro usuario ADMIN e libera o acesso imediatamente, com 30 dias de teste.
--
-- Por que uma FUNCAO e nao um INSERT direto do navegador?
--   * valida tudo em um unico lugar (slug da URL, login, senha, e-mail);
--   * cria EMPRESA + ADMIN na MESMA transacao (nunca existe empresa sem admin);
--   * e porque, a partir daqui, `empresa` NAO aceita mais escrita pela chave
--     publishable (INSERT/UPDATE/DELETE revogados de anon/authenticated): a
--     unica porta de entrada de empresa passa a ser esta funcao.
--
-- Decisao do cliente: "usar de graca por 30 dias", acesso imediato (sem
-- aprovacao manual) e sem dominio proprio por enquanto.
--
-- AVISO: as DEMAIS tabelas continuam sem RLS (usuario.senha em texto plano,
-- chave publishable no navegador) — endurecimento completo e a fase 2.
--
-- Chamada: POST /rest/v1/rpc/registrar_empresa
--          {"p_empresa":"Moveis Silva","p_slug":"moveis-silva","p_login":"ADMIN",
--           "p_senha":"...","p_nome":"Joao Silva","p_email":"joao@silva.com.br"}
--
-- Retorna a MESMA forma de `login_usuario` (a tela ja entra logada).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. COLUNAS NOVAS EM EMPRESA
-- -----------------------------------------------------------------------------
alter table public.empresa add column if not exists trial_ate     timestamptz;
alter table public.empresa add column if not exists responsavel   varchar(120);
alter table public.empresa add column if not exists email_contato varchar(160);

comment on column public.empresa.trial_ate is
    'Fim do teste gratis (30 dias a partir do autocadastro). NULL = sem prazo (cliente antigo).';
comment on column public.empresa.responsavel is
    'Nome do responsavel informado no autocadastro (contato comercial).';
comment on column public.empresa.email_contato is
    'E-mail de contato informado no autocadastro.';


-- -----------------------------------------------------------------------------
-- 2. FUNCAO DE REGISTRO
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

    /* ---- criacao (empresa + admin na mesma transacao) --------------------- */
    /* ATENCAO: os nomes das colunas de saida do RETURNS TABLE (id, login, nome,
       perfil, empresa_id, empresa_slug, empresa_nome) viram variaveis do
       PL/pgSQL — por isso TODO nome de coluna aqui precisa ser qualificado
       (sem isso: "column reference id is ambiguous", erro 42702). */
    insert into public.empresa (slug, nome, ativo, trial_ate, responsavel, email_contato)
    values (v_slug, v_empresa, 1, now() + interval '30 days', v_nome, v_email)
    returning empresa.id into v_id;

    insert into public.usuario (empresa_id, login, senha, nivel, nome, perfil, ativo)
    values (v_id, v_login, v_senha, 'ADMIN', coalesce(v_nome, v_login), 'ADMIN', true);

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

comment on function public.registrar_empresa(text, text, text, text, text, text) is
    'Autocadastro SaaS: cria a empresa ativa (30 dias de teste) + o primeiro usuario ADMIN e devolve a sessao.';


-- -----------------------------------------------------------------------------
-- 3. PERMISSOES
-- -----------------------------------------------------------------------------
revoke all on function public.registrar_empresa(text, text, text, text, text, text) from public;
grant execute on function public.registrar_empresa(text, text, text, text, text, text) to anon, authenticated;

-- a empresa passa a ser criada SOMENTE por esta funcao:
-- leitura continua livre (a URL resolve o slug), escrita nao.
revoke insert, update, delete on public.empresa from anon, authenticated;
grant select on public.empresa to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 4. RECARREGA O CACHE DO POSTGREST (senao a funcao nova da 404)
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (rodar depois de aplicar)
-- -----------------------------------------------------------------------------
-- select public.registrar_empresa('Moveis Teste', 'moveis-teste', 'ADMIN', 'teste123', 'Joao', 'joao@teste.com');
-- select slug, nome, ativo, trial_ate, responsavel, email_contato from public.empresa order by id;
-- select e.slug, u.login, u.perfil, u.ativo from public.usuario u join public.empresa e on e.id = u.empresa_id order by e.slug;
-- erros esperados (mensagem P0001):
--   select public.registrar_empresa('X',                    'moveis-teste', 'ADMIN', 'teste123'); -- nome curto
--   select public.registrar_empresa('Nova Empresa',         'sysconf',      'ADMIN', 'teste123'); -- slug reservado
--   select public.registrar_empresa('Nova Empresa',         'moveis-teste', 'ADMIN', 'teste123'); -- slug em uso
--   select public.registrar_empresa('Nova Empresa',         'nova-empresa', 'AD',    'teste123'); -- login curto
--   select public.registrar_empresa('Nova Empresa',         'nova-empresa', 'ADMIN', '123');     -- senha curta
-- limpeza dos testes:
--   delete from public.usuario where empresa_id in (select id from public.empresa where responsavel = 'Joao');
--   delete from public.empresa where slug = 'moveis-teste';


-- -----------------------------------------------------------------------------
-- ROLLBACK
-- -----------------------------------------------------------------------------
-- revoke execute on function public.registrar_empresa(text, text, text, text, text, text) from anon, authenticated;
-- drop function if exists public.registrar_empresa(text, text, text, text, text, text);
-- grant insert, update, delete on public.empresa to anon, authenticated;
-- alter table public.empresa drop column if exists email_contato;
-- alter table public.empresa drop column if exists responsavel;
-- alter table public.empresa drop column if exists trial_ate;
