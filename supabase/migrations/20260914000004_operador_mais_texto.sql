-- =============================================================================
-- SysConf - Compatibilidade de concatenação de texto (SQL Server -> PostgreSQL)
-- Arquivo : supabase/migrations/20260914000004_operador_mais_texto.sql
--
-- PROBLEMA
--   O legado foi escrito para SQL Server, onde `+` concatena strings:
--     App/Form1.cs:436
--       SELECT ORDCOMPRA + ' (' + CAST(COUNT(ORDCOMPRA) AS VARCHAR(5)) + ')' AS Descricao,
--              ORDCOMPRA AS Valor FROM PEDIDO WHERE Idlayout = {id} GROUP BY ORDCOMPRA ...
--     (idem linhas 439 e 442, com PECLIENTE e ARQUIVO)
--   No PostgreSQL `+` não existe para texto:
--     ERRO 42883: operator does not exist: character varying + unknown
--   e o PostgREST devolve HTTP 404 para 42883, derrubando o combo de busca do Form1.
--
-- SOLUÇÃO
--   Criar o operador `+` para texto, com a MESMA semântica do SQL Server:
--   se qualquer operando for NULL, o resultado é NULL (por isso não usamos `||` puro).
--   Assim o SQL legado roda sem alteração no cliente.
--
-- ALTERNATIVA (mais "limpa", porém mexe no app): trocar o `+` por `||` nas 3 linhas do
--   App/Form1.cs e então remover este operador.
--
-- Como aplicar: Supabase CLI (`supabase db push`) ou SQL Editor.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. FUNÇÃO de concatenação com semântica de NULL do SQL Server
-- -----------------------------------------------------------------------------
create or replace function public.sisconf_concat_text(a text, b text)
returns text
language sql
immutable
as $$
    select case when a is null or b is null then null else a || b end;
$$;

comment on function public.sisconf_concat_text(text, text) is
    'Concatenação usada pelo operador + (compatibilidade com SQL Server: NULL propaga).';


-- -----------------------------------------------------------------------------
-- 2. OPERADOR  texto + texto
-- OBS.: CREATE OPERATOR recebe apenas o NOME do operador (schema.op) seguido da
-- lista de parâmetros — não se informa a assinatura "+(text, text)" no CREATE
-- (isso só é válido no DROP). Basta um operador (text, text): o PostgreSQL
-- aplica varchar -> text implicitamente nas colunas do schema legado.
-- -----------------------------------------------------------------------------
drop operator if exists public.+(text, text);

create operator public.+ (
    leftarg  = text,
    rightarg = text,
    function = public.sisconf_concat_text
);


-- -----------------------------------------------------------------------------
-- 3. VERIFICAÇÃO
-- -----------------------------------------------------------------------------
-- select 'OC-9' + ' (' + CAST(2 AS VARCHAR(5)) + ')' as teste;   -- esperado: OC-9 (2)
-- select NULL::text + 'x' as teste_null;                          -- esperado: NULL
-- A consulta completa do Form1.cs:436 (deve retornar 200 via rpc/exec_sql):
--   SELECT ORDCOMPRA + ' (' + CAST(COUNT(ORDCOMPRA) AS VARCHAR(5)) + ')' AS Descricao,
--          ORDCOMPRA AS Valor FROM PEDIDO WHERE Idlayout = 11 GROUP BY ORDCOMPRA ORDER BY ORDCOMPRA


-- -----------------------------------------------------------------------------
-- 4. ROLLBACK
-- -----------------------------------------------------------------------------
-- drop operator if exists public.+(text, text);
-- drop function if exists public.sisconf_concat_text(text, text);
