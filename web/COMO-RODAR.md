# SysConf Web

Recriação web das telas do SysConf WinForms, usando o template Vite + React + TypeScript
com Tailwind CSS v4, consumindo o Supabase (PostgREST) no schema legado.

## Como rodar

```bash
cd web
npm install          # só na primeira vez
npm run dev          # http://localhost:5173
npm run build        # gera dist/ (tsc -b && vite build)
npm run preview      # serve o build de produção
```

## Configuração (.env)

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co/rest/v1/
VITE_SUPABASE_KEY=<chave publishable/anon>
```

Use `.env.example` como modelo. **A chave vai para o navegador** — ver "Segurança".

## Telas (equivalência com o WinForms)

| Tela web | WinForms | O que faz |
|---|---|---|
| `telas/Login.tsx` | `FormLogin` | usuário em MAIÚSCULAS (max 30), senha (max 15), "Memorizar senha", Confirmar/Cancelar, rodapé softwerd |
| `telas/Conferencia.tsx` | `Form1` | barra de ações (Importar/Conferência/Saída/Exportar), combo de fábrica, busca por ORD.COMPRA/PEDIDO/ARQUIVO, contadores por status, grid colorido por status, menu de contexto (Alterar para Normal/Conferência/Saída), painel de conferência com BOX gigante + leitura de etiqueta |
| `telas/Importacao.tsx` | `TabeLayo` | combo de fábrica, botão "Arquivo...", barra de progresso, lista de lojas com checkbox e "Incluir lojas selecionadas." |

Regras preservadas do legado: status `0=Normal 1=Conferido 2=Saída 3=Entrega`, cores por status
(branco / LightGreen / LightCoral / azul), `STATUS=0` e `IDBOX=1` na importação, `CLIENTE` vazio →
`NÃO INFORMADO`, sons de acerto/erro (sintetizados na Web Audio API no lugar dos `.wav`).

## Estrutura

```
src/
  Sysconf.tsx          raiz: sessão, navegação e fábrica ativa (compartilhada entre as telas)
  estilos.css          Tailwind + cores/classes do legado
  lib/config.ts        env + rótulos/cores/colunas
  lib/api.ts           acesso ao Supabase (equivalente ao ApiExtensions.cs)
  lib/parsers.ts       leitura dos arquivos de layout
  lib/audio.ts         sons
  telas/*.tsx          Login, Conferencia, Importacao
exemplo/pedidos-teste.csv   arquivo de exemplo (separador `;`, com cabeçalho)
```

## Diferenças de implementação em relação ao WinForms

- **Sem tradução de SQL**: as consultas usam o Data API do PostgREST (`select=`, `col=eq.valor`).
  As agregações com `+`, `CAST` e `GROUP BY` do `Form1.cs` vão pelo RPC `exec_sql`.
- **Login por RPC**: `POST /rest/v1/rpc/login_usuario` (migration `20260914000005`), então a senha
  não aparece na URL e a coluna `usuario.senha` não é enviada ao navegador.
- **Paginação**: o PostgREST devolve no máximo 1000 linhas por requisição; `listarPedidos` pagina
  com o header `Range` até acabar.

## Pendências conhecidas

1. **Parsers de layout**: só o `CSV Padrão` tem mapeamento em `lib/parsers.ts`. Os outros arquivos
   usam detecção automática de separador/cabeçalho e exibem um aviso na tela. Portar os 30 parsers
   de `Negocio/boPedido.cs` é o próximo passo.
2. **Segurança**: o RLS está desabilitado e `usuario.senha` é texto plano (exigência do login legado).
   Qualquer pessoa com a chave publishable consegue ler as senhas. Antes de publicar:
   habilitar RLS, revogar leitura de `usuario` para o role `anon` e manter apenas as funções RPC.
3. A tabela `BOX` é lida em `lib/api.ts` (`listarBoxes`) mas ainda não é usada no grid — o legado
   também não a consultava.
4. `src/App.tsx`, `src/App.css`, `src/index.css` e `src/assets/` são sobras do template e podem ser
   removidos.

## Credenciais de teste

`ADMIN` / `trocar@123` (criado pela migration `20260914000002`) — **troque a senha** e cadastre os
usuários reais antes de usar em produção.
