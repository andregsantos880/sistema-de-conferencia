-- =============================================================================
-- SysConf - Revoga os RPCs de SQL arbitrario (parte 1 do fechamento)
-- Arquivo : supabase/migrations/20260914000102_revogar_rpcs_de_sql_arbitrario.sql
--
-- POR QUE URGENTE: com a chave publishable (que vai no bundle do navegador)
-- qualquer pessoa podia chamar
--     POST /rest/v1/rpc/exec_dml  {"sql_query":"drop table public.pedido"}
-- porque exec_sql/exec_dml/exec_scalar sao SECURITY DEFINER e estavam liberados
-- para `public` (toda funcao nasce executavel por PUBLIC no Postgres).
--
-- POR QUE E SEGURO APLICAR AGORA: nem o app web (migracao 00101) nem o WinForms
-- usam estes RPCs — o WinForms vai direto nas tabelas pelo PostgREST. Esta
-- migracao NAO afeta o legado.
--
-- CONSEQUENCIA: eu perco o caminho de aplicar SQL por REST. Daqui para frente as
-- migracoes devem ser rodadas no SQL Editor do Supabase (ou com uma chave
-- service_role definida apenas em variavel de ambiente local, porque o GRANT
-- abaixo mantem esses RPCs para service_role).
-- =============================================================================

revoke all on function public.exec_sql(text)    from public, anon, authenticated;
revoke all on function public.exec_dml(text)    from public, anon, authenticated;
revoke all on function public.exec_scalar(text) from public, anon, authenticated;

grant execute on function public.exec_sql(text)    to service_role;
grant execute on function public.exec_dml(text)    to service_role;
grant execute on function public.exec_scalar(text) to service_role;

/* os helpers internos tambem nao podem ficar executaveis por PUBLIC */
revoke all on function public.sessao_aberta(text)          from public, anon, authenticated;
revoke all on function public.exigir_admin(public.sessao)  from public, anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- POST /rest/v1/rpc/exec_scalar  {"sql_query":"select 1"}   -> deve dar 401/403
-- POST /rest/v1/rpc/login_usuario {...}                     -> deve continuar OK
-- o app web (login, grid, bipe, importacao, usuarios)       -> deve continuar OK


-- -----------------------------------------------------------------------------
-- ROLLBACK (reabre o SQL arbitrario — so em emergencia)
-- -----------------------------------------------------------------------------
-- grant execute on function public.exec_sql(text)    to anon, authenticated, public;
-- grant execute on function public.exec_dml(text)    to anon, authenticated, public;
-- grant execute on function public.exec_scalar(text) to anon, authenticated, public;
