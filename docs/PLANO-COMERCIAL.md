# SysConf — plano comercial e de crescimento orgânico

Documento vivo. Escrito a partir do estado real do produto em 15/09/2026
(web em `sysconf-web.web.app`, 2 empresas, 30 dias de teste, sem cobrança).

## 1. Posicionamento

**Não vender "WMS" nem "sistema de gestão".** O diferencial que ninguém copia é o
catálogo de **30 fábricas com o arquivo já mapeado** (vem do legado, `boPedido.cs`).

> Frase de posicionamento: **"O sistema que já lê o arquivo da sua fábrica."**

Consequências: falar de fábricas pelo nome, e vender pela dor concreta
(etiqueta lida duas vezes, peça no box errado, carga liberada errada).

## 2. Bloqueios comerciais (ordem de prioridade)

| # | Bloqueio | Por que dói | Custo/Esforço |
|---|---|---|---|
| B1 | Site em `sysconf-web.web.app` (sem domínio) | mata credibilidade B2B, trava e-mail profissional e anúncios | R$ 40/ano + 30 min |
| B2 | Sem cobrança (plano/limite/boleto/NF) | não existe SaaS sem isso: receita zero e cliente sem compromisso | 1-2 semanas |
| B3 | Trial sem "primeiro valor" garantido | o cliente cria conta e não sabe o próximo passo; trial morre no dia 1 | 2-3 dias |
| B4 | Sem termos/privacidade/LGPD e sem DPA | objeção em cliente médio; auditoria de segurança encontra senha em texto plano (fechada pela migração 00103) | 2 dias (+ revisão jurídica) |
| B5 | Sem medição (GA4/Search Console) nem prova social | impossível saber o que funciona ou onde o funil vaza | 1 dia |

## 3. Modelo de negócio sugerido

- **Faixa por volume + usuários** (não por usuário isolado: operador é rotativo).
  Ex.: até 5.000 linhas/mês e 2 usuários · até 20.000 e 5 usuários · acima sob consulta.
- **Setup de implantação** cobrado uma vez (configurar o layout da fábrica do cliente
  + treinar operador). É o que faz o cliente ficar.
- **30 dias grátis sem cartão** (menos atrito) **com contato humano no dia 1-3** do trial.
- **Boleto, PIX e cartão** + emissão de nota fiscal — exigência real do B2B brasileiro.
- **Plano anual com desconto** (caixa na frente, churn menor).

## 4. Canais, em ordem de retorno

1. **Canal das fábricas (B2B2B)** — cada fábrica já envia o arquivo para dezenas de
   distribuidoras e lojas. Indicação da fábrica vale mais que qualquer anúncio, e o
   argumento dela é: menos erro na conferência = menos devolução e menos reclamação.
2. **Vídeo curto (YouTube/LinkedIn)** — 60-90s com o bipe e a voz anunciando o box.
   Gestor de logística consome isso no LinkedIn.
3. **SEO de intenção baixa mas qualificada** — o volume é pequeno no Brasil, então SEO
   é complemento, não motor. O que funciona:
   - 5-8 páginas por **dor** (não por palavra-chave): conferência cega, conferir pedido
     de fábrica com leitor, planilha x sistema, reduzir erro de separação.
   - **Comparativos** (SysConf x planilha, SysConf x WMS) — as que mais convertem.
   - 30 páginas **"/integracao/<fabrica>"** — busca de pouquíssimo volume e
     altíssima intenção (quem busca já recebe o arquivo daquela fábrica).
4. **Diretórios B2B** (B2B Stack, Capterra/SoftwareAdvice BR) + **Google Business
   Profile** — lead qualificado e backlink.
5. **Backlink de associação setorial** (moveleiro/atacado) vale mais que 100 diretórios.

## 5. Produto que sustenta preço

Quem usa é o operador; **quem paga é o gestor**. Priorizar o que o gestor vê:

1. **Relatórios**: conferência por operador, por dia, tempo de conferência, erros,
   produtividade. (Os dados já existem: usuário + sessão + status + datainc.)
2. **Histórico/auditoria por etiqueta**: quem bipou, quando, em que box. Só é possível
   agora, porque o acesso passou a ter usuário identificado (migração 00101).
3. **Aviso de carga liberada** (e-mail/WhatsApp) para expedição/comercial.
4. **Integração com o ERP do cliente** (pedido conferido volta) — o que amarra o cliente.
5. **Resistência a queda de internet** (chão de fábrica tem Wi-Fi ruim): hoje, se a
   conexão cai, a conferência para — risco real de churn.
6. **Conferência pelo celular** (câmera como leitor) — abre o mercado de loja pequena.

## 6. Roadmap de 90 dias

**Fase 1 (semanas 1-2) — credibilidade e medição**
- [ ] comprar domínio e apontar no Firebase Hosting
- [ ] Search Console + GA4 (ou Plausible) + eventos de funil
- [ ] Google Business Profile
- [ ] e-mail profissional no domínio (contato@…)
- [ ] termos de uso e política de privacidade (rascunho + revisão jurídica)
- [ ] aplicar `00103` (fechar leitura direta: senha e pedidos)

**Fase 2 (semanas 3-6) — conversão**
- [ ] onboarding guiado na 1ª sessão (importar arquivo de exemplo → bipar → conferir)
- [ ] e-mail de boas-vindas + lembrete no dia 2 do trial
- [ ] planos + cobrança (boleto/PIX/cartão) + medição de uso por empresa
- [ ] página de preços
- [ ] relatório do gestor (v1)

**Fase 3 (semanas 7-12) — distribuição**
- [ ] 8 páginas de intenção + comparativos
- [ ] 30 páginas `/integracao/<fabrica>`
- [ ] 6 vídeos curtos
- [ ] 2 diretórios B2B
- [ ] abordagem das 5 maiores fábricas para indicação mútua

## 7. Métricas que importam

visitas → cadastros iniciados → cadastros concluídos → **1ª importação** →
**1º bipe** → uso no 5º dia → cliente pagante. E, depois: receita por cliente, churn
mensal e tempo até o primeiro valor (dias entre cadastro e primeira conferência).

## 8. SEO técnico — já feito (15/09)

- [x] HTML estático com o conteúdo da landing (era 1 KB invisível para robô; agora
      ~21 KB com H1, seções, FAQ, imagens com alt e links) — `npm run seo` (prerender)
      entrou no deploy
- [x] `robots.txt` e `sitemap.xml`
- [x] dados estruturados `SoftwareApplication` (com teste grátis) e `canonical`
- [x] `noindex` nas telas de empresa (não indexar login de cliente)
- [x] `og:image` (prévia de compartilhamento), manifest e ícones próprios
- [ ] trocar domínio em `robots.txt`, `sitemap.xml` e `canonical` quando o domínio existir

### Falta o passo que eu NÃO consigo fazer: registrar no Google

O site está **hospedado** no Google (Firebase Hosting), mas isso não é o mesmo que
estar no **índice de busca**. Ninguém avisou o Google que o site existe, e não há
nenhum link externo apontando para ele — ou seja, não há caminho de descoberta.

Ação do dono da conta (`del.gsantos75@gmail.com`), 2 minutos:

1. Abrir <https://search.google.com/search-console> e clicar em **Adicionar propriedade**.
2. Escolher **Prefixo do URL** e informar `https://sysconf-web.web.app/`.
3. Na verificação, escolher a opção **Tag HTML**. O Google mostra algo como
   `<meta name="google-site-verification" content="ABC123...">` — copie o valor de
   `content` e me envie: eu publico a tag e o deploy leva menos de um minuto.
   (Alternativa sem depender de mim: baixar o arquivo `googleXXXX.html` que o Google
   oferece e colocá-lo em `web/public/` — o `npm run deploy` publica.)
4. Clicar em **Verificar**.
5. Depois de verificado: **Sitemaps** → adicionar `sitemap.xml`, e em
   **Inspeção de URL** → `https://sysconf-web.web.app/` → **Solicitar indexação**.

Com a propriedade verificada eu também consigo enviar o sitemap por API, usando as
credenciais `gcloud` da sua máquina (exige autorizar o escopo do Search Console uma vez).

Expectativa honesta: página nova, sem backlink e sem conteúdo além de uma página,
costuma ser indexada em dias — mas **indexar não é ranquear**. Tráfego orgânico
relevante vem das páginas da fase 3 (dores, comparativos e as 30 fábricas).

## 9. Extras que ajudam (e dependem do dono da conta)

- **Google Business Profile** (perfil da empresa): aparece em buscas locais e dá
  credibilidade. Precisa do CNPJ/endereço e da conta Google.
- **Domínio próprio**: indexável hoje é, mas `sysconf-web.web.app` é subdomínio da
  Google (não é sua marca) e limita e-mail profissional e anúncios.
- **Imagem de Open Graph** já publicada — mas a prévia no WhatsApp/LinkedIn só
  renova quando o link é compartilhado com URL nova (cache do próprio app).
