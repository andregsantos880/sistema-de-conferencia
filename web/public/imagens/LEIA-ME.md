# Imagens de divulgação

Arquivos usados no site e nas redes. Todas as imagens são **geradas aqui** —
telas reais do produto (capturadas do próprio sistema) e composições feitas por
script. Nada de banco de imagens com licença duvidosa.

| Arquivo | Onde é usado |
|---|---|
| `src/imagens/tela-conferencia.png` | Landing (seção "Veja por dentro") |
| `src/imagens/tela-bipagem.png` | Landing (painel de bipagem) e prévia de compartilhamento |
| `src/imagens/tela-importacao.png` | Landing (importação do arquivo da fábrica) |
| `src/imagens/tela-grid.png` | Reserva (não está na landing) |
| `public/imagens/og-v2.png` (1200x630) | `og:image` / `twitter:image` — prévia no WhatsApp, LinkedIn, etc. |
| `public/imagens/post-quadrado-v2.png` (1080x1080) | Instagram / feed do LinkedIn |
| `public/imagens/post-largo-v2.png` (1600x900) | LinkedIn / apresentação |
| `public/imagens/post-retrato-v2.png` (1080x1350) | Stories / Reels / Pinterest |
| `public/imagens/icone-*-v2.png` | `manifest.webmanifest` e `apple-touch-icon` |

**Por que as telas ficam em `src/` e o resto em `public/`:** as telas são
**importadas** pela landing (`import telaBipagem from '../imagens/...'`), então o
Vite publica com hash no nome — trocar a imagem nunca esbarra em cache. Já `og` e
ícones são referenciados por URL fixa no `index.html` e no manifest, então
dependem de versão manual no nome.

## Como regerar

1. As telas saem do próprio app (Playwright, viewport 1440x900).
2. As composições saem de `scripts/gerar-imagens.py` (Pillow).

## Atenção ao cache (leia antes de trocar uma imagem)

`firebase.json` serve arquivo estático com `Cache-Control: max-age=31536000, immutable`.

- **Telas da landing (`src/imagens/`)**: sem problema — o Vite gera nome com hash
  a cada build, então a troca é vista na hora por todo mundo.
- **`og` e ícones (`public/imagens/`)**: o nome é fixo, então **bump manual de versão**
  é obrigatório (`-v2` → `-v3`), atualizando: `index.html` (`og:image`,
  `twitter:image`, `apple-touch-icon`), `public/manifest.webmanifest` e
  `scripts/gerar-imagens.py`.

Esse cuidado não é teórico: numa troca feita sem bump, o navegador continuou
mostrando a imagem antiga por causa do cache imutável.

## Sobre as telas

As capturas usam a empresa **Homologação** (dados de teste criados para
validação), e o rótulo da fábrica é trocado por um nome de demonstração nas
imagens — nenhum dado de cliente real aparece. Se quiser capturar com um cliente
real, faça só com autorização dele por escrito.

Observações de qualidade:

- a tela de bipagem mostra o estado de **sucesso** ("CONFERENCIA registrado");
- `src/imagens/tela-importacao.png` saiu só com o formulário (recorte apertado), sem a
  moldura do app — vale refazer quando houver um cliente de demonstração;
- o `favicon.svg` era o logotipo do template do Vite e foi substituído pela
  marca do produto (quadrado verde com S + barras de código de barras).
