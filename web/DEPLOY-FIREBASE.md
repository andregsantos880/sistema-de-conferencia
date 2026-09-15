# Publicar no Firebase Hosting

O CLI já está instalado e **autenticado**:

```
Logged in as del.gsantos75@gmail.com   (firebase-tools 15.30.1)
```

Projetos disponíveis na conta:

| Nome | Project ID |
|---|---|
| Festejo | `festejo-c9a31` |
| Mercadama | `mercadama-e702e` |
| portifolio | `portifolio-d2963` |

## Como funciona (diferença importante em relação ao Vercel)

O Firebase Hosting **publica a pasta `dist` do seu computador** — o build roda na sua máquina,
não na nuvem. Isso significa que **não há variáveis de ambiente para configurar no servidor**:
o `web/.env` já é embutido no bundle durante o `npm run build`.

## Passo a passo

### 1. Escolher o projeto (uma vez)

**Opção A — projeto novo e dedicado (recomendado):**

```powershell
cd web
npx firebase-tools projects:create sysconf-web --display-name "SysConf"
```

**Opção B — usar um projeto existente** (troque pelo ID escolhido):

```powershell
cd web
npx firebase-tools use festejo-c9a31
```

O comando `use` grava o ID em `web/.firebaserc`.

### 2. Publicar

```powershell
cd web
npm run deploy          # = npm run build && npx firebase-tools deploy --only hosting
```

O `firebase.json` já está configurado: pasta `dist`, rewrite de SPA para `index.html`
e cache longo para os assets versionados.

### 3. Abrir o site

Ao final o CLI imprime as URLs:

```
Hosting URL: https://<project-id>.web.app
             https://<project-id>.firebaseapp.com
```

Para ver depois: `npx firebase-tools hosting:sites:list`

## Publicar mais de um site no mesmo projeto

Se preferir não criar projeto novo, cada projeto Firebase aceita vários sites:

```powershell
npx firebase-tools hosting:sites:create sysconf --project festejo-c9a31
```

Depois adicione um `target` no `firebase.json`/`.firebaserc` e publique com
`npx firebase-tools deploy --only hosting:sysconf`.

## Roteiro de manutenção

| Ação | Comando |
|---|---|
| Publicar de novo | `npm run deploy` |
| Pré-visualizar canal de teste | `npx firebase-tools hosting:channel:deploy teste` |
| Rollback para a versão anterior | `npx firebase-tools hosting:rollback` |
| Ver releases | `npx firebase-tools hosting:releases:list` |

## ⚠️ Antes de divulgar o link (segurança)

A chave publishable fica **embutida no JavaScript** e o RLS do Supabase está desabilitado com
`usuario.senha` em texto plano (exigência do login legado em `App/FormLogin.cs:113`).
Ou seja: **quem abrir o site consegue ler login e senha de todos os usuários**.

Enquanto isso não for resolvido:

- use o site apenas em rede interna / para testes;
- prefira publicar em um canal de preview (`hosting:channel:deploy`) em vez do canal `live`;
- não divulgue a URL.

Correção definitiva (pendente de decisão): habilitar RLS, criar as policies considerando que
**o WinForms também usa a mesma chave publishable**, e trocar o login do WinForms para o RPC
`login_usuario` (que o app web já usa) — só então é possível revogar a leitura da coluna `senha`.

## Também antes de publicar

- Trocar a senha do usuário `ADMIN` (`trocar@123`) e cadastrar os usuários reais.
- Decidir o destino das 924 linhas da fábrica **Criare** (`idlayout = 2`) e das 10 linhas de
  teste do arquivo `pedidos-teste.csv` (`idlayout = 3`).
