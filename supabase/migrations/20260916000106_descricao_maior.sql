-- =============================================================================
-- SysConf - Ampliar PEDIDO.DESCRICAO1 (80 -> 200)
-- Arquivo : supabase/migrations/20260916000106_descricao_maior.sql
--
-- PROBLEMA: a tabela veio do legado com DESCRICAO1 varchar(80), e os arquivos
-- reais de pelo menos duas fabricas passam disso:
--   ROMANZZA          -> 86 caracteres ("PORTA ALUMINIO DESLIZANTE PERFIL PAINEL..." )
--   CRIARE_TRANSPAESE -> 81 caracteres ("TRAVESSAS CTO 90G H2332 L141 P140 ...")
-- O INSERT falha com "value too long for type character varying(80)" e a
-- importacao inteira e abortada (o operador ve esse erro tecnico na tela).
--
-- SOLUCAO: ampliar a coluna para varchar(200), que cobre os arquivos conhecidos
-- com folga (o posicional da CRIARE_TRANSPAESE pode chegar a ~120 caracteres,
-- porque a descricao vai da coluna 70 ate o fim da linha de 190).
--
-- COMPATIBILIDADE: ampliar varchar nao quebra o WinForms nem o que ja esta
-- gravado - nenhum dado e alterado. Tambem conferi os outros campos de texto
-- contra os arquivos reais e todos cabem nos limites atuais:
--   arquivo 255 (nome do arquivo) | ordcompra 30 (max 15) | cliente 70
--   produto 70 (max 11) | etiqueta 50 (max 26) | pecliente 30 (max 7)
--
-- COMO APLICAR: Supabase Dashboard -> SQL Editor -> colar TODO este arquivo -> Run.
-- =============================================================================

alter table public.pedido
    alter column descricao1 type varchar(200);

comment on column public.pedido.descricao1 is
    'Descricao da peca como vem no arquivo da fabrica (ate 200 caracteres desde a migracao 00106).';

notify pgrst, 'reload schema';


-- -----------------------------------------------------------------------------
-- VERIFICACAO (depois de aplicar)
-- -----------------------------------------------------------------------------
-- select character_maximum_length
--   from information_schema.columns
--  where table_schema = 'public' and table_name = 'pedido' and column_name = 'descricao1';
-- esperado: 200


-- -----------------------------------------------------------------------------
-- ROLLBACK (so se algum valor gravado passar de 80)
-- -----------------------------------------------------------------------------
-- select max(length(descricao1)) from public.pedido;
-- alter table public.pedido alter column descricao1 type varchar(80);
