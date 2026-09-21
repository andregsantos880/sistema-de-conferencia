-- =============================================================================
-- SysConf - Exclusao de estagio: nao travar por peca no estagio ANTERIOR
-- Arquivo : supabase/migrations/20260921000112_estagios_exclusao.sql
--
-- PROBLEMA encontrado em teste (homologacao):
--   Com uma peca parada no PENULTIMO estagio (ex.: ENTREGA, status 3), a
--   exclusao do ultimo estagio (ex.: SEPARACAO, numero 4) era recusada com
--   "Ha 1 peca(s) chegando/passando por este estagio".
--
-- POR QUE ISSO ESTAVA ERRADO:
--   A regra existia para nao deixar peca "na fila" de um estagio que deixa de
--   existir. Mas peca no estagio ANTERIOR nao aponta para nada: se o ultimo
--   estagio e excluido, o fluxo simplesmente passa a terminar no anterior, e
--   as pecas de la continuam concluidas. O efeito pratico era o administrador
--   criar um estagio por engano e NAO conseguir remove-lo enquanto houvesse
--   qualquer peca no estagio de tras (situacao normal em operacao).
--
-- REGRA NOVA (unica mudanca):
--   A exclusao so e recusada quando existe peca PARADA NO PROPRIO estagio
--   (status = numero) -- a mesma regra ja usada para DESATIVAR. Continuam
--   valendo: so o ultimo estagio ativo pode ser excluido e nao pode haver
--   peca com LOCAL DEFINIDO nesse estagio (pedido_local).
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
--               (aplique DEPOIS da 20260921000111_estagios.sql)
-- =============================================================================

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

    /* so o ULTIMO estagio ativo pode sair (a sequencia nao pode ter buraco) */
    select max(e.numero) into v_ultimo
      from public.estagio e
     where e.empresa_id = v_sessao.empresa_id and e.ativo = 1;

    if p_numero <> coalesce(v_ultimo, 0) then
        raise exception 'Para excluir, o estagio precisa ser o ultimo da sequencia (hoje e o %).', coalesce(v_ultimo, 0);
    end if;

    /* peca PARADA neste estagio: o operador ainda precisa bipar aqui */
    select count(*) into v_pecas from public.pedido p
     where p.empresa_id = v_sessao.empresa_id and p.status = p_numero;

    if v_pecas > 0 then
        raise exception 'Ha % peca(s) parada(s) neste estagio -- conclua ou mova as pecas antes de excluir.', v_pecas;
    end if;

    /* local definido para este estagio apontaria para um estagio inexistente */
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

revoke all on function public.estagio_excluir(text, integer) from public;
grant execute on function public.estagio_excluir(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar): com 1 peca em ENTREGA (status 3) e o ultimo
-- estagio numero 4 sem peca e sem local, a exclusao deve FUNCIONAR:
--   select public.estagio_excluir('<token>', 4);
-- -----------------------------------------------------------------------------
