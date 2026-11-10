# Titular · Esqueleto do site

> Estado do tema depois da montagem do esqueleto (2026-11-10). Liga cada item de
> `docs/arquitetura-informacao.md` ao arquivo que o implementa. A estrutura está
> pronta; o design ainda vai ser refinado.
> `shopify theme check`: 0 erros.

## 1. Como a base visual está montada

| Camada | Arquivo | Regra |
| --- | --- | --- |
| Tokens da marca | `assets/tokens.css` | Cópia de `brand/tokens.css`. Não editar à mão: `node scripts/sync-tokens.mjs` (e `--check` para conferir). |
| Reset + layout + componentes | `assets/base.css` | Só tokens. Container, `.section`, `.button`, `.field__input`, `.tag` (versão), `.badge` (pílula), `.notice`, `.media`, `.product-grid`, `.drawer`/`.modal` (`<dialog>`), `.accordion`, `.chip`, `.placeholder-note`. |
| CSS de cada section | `{% stylesheet %}` dentro da section | Layout específico daquela section. |
| Aliases legados | `snippets/css-variables.liquid` | `--color-*`, `--f0..f8` etc. apontando para tokens, só para seções antigas (blog, artigo, 404, senha, gift card, contato, `main-cart`). Apagar quando forem reescritas. |
| Tipografia | classes `.text-*` no HTML | Nunca `font-size` no CSS. |

Breakpoints (mobile first): base 390px · `750px` · `990px` (desktop).

Valores de layout que **não** são tokens e estão no topo de `base.css` (`--page-max`, `--drawer-max`, `--tap`) são candidatos a entrar em `brand/tokens.json`.

Configurações do tema (editor): cor, fonte e logo saíram do editor porque vêm da marca. No lugar entraram **Comercial** (desconto Pix, parcelas, parcela mínima, frete grátis, coleção "Mais vendidos") e **Páginas de ajuda** (guia de tamanhos, Torcedor x Jogador, frete, trocas, WhatsApp).

## 2. Mapa do site → arquivos

| Página (§2) | Template | Sections |
| --- | --- | --- |
| Home | `templates/index.json` | `image-banner` (hero 100svh) · `club-list` (círculos com brasão) · `collection-list` (cards por modelo) · `featured-collection` (mais vendidos 3x3 + catálogo) · `version-explainer` · `reviews` · `guarantees` |
| Cabeçalho (todas) | `sections/header-group.json` | `announcement-bar` · `nav` (menu em gaveta + busca em tela cheia; transparente sobre o hero na home) |
| Rodapé (todas) | `sections/footer-group.json` | `footer` |
| Coleções | `templates/collection.json` | `collection-banner` · `main-collection` · `collection-text` |
| Produto | `templates/product.json` | `main-product` (blocks 2–10) · `reviews` · `related-products` |
| Carrinho (gaveta) | `layout/theme.liquid` | `cart-drawer` + `assets/carrinho.js` |
| Carrinho (sem JS) | `templates/cart.json` | `main-cart` (antiga, ainda não reescrita) |
| Busca | overlay em `nav` + `templates/search.json` | `predictive-search` · `main-search` |
| Guia de tamanhos | `page.guia-tamanhos.json` | `help-nav` · `main-page` |
| Torcedor x Jogador | `page.torcedor-x-jogador.json` | `help-nav` · `main-page` · `version-comparison` |
| Frete e prazos | `page.frete-prazos.json` | `help-nav` · `main-page` · `shipping-table` |
| Trocas e devoluções | `page.trocas.json` | `help-nav` · `main-page` · `steps` · `help-form` (troca) |
| Rastrear pedido | `page.rastrear-pedido.json` | `help-nav` · `main-page` · `help-form` (rastreio) |
| FAQ e contato | `page.contact.json` | `help-nav` · `main-page` · `faq` · `contact-form` |
| Sobre / genéricas | `page.json` | `main-page` |
| Conta | `templates/customers/*.json` | `main-login` · `main-register` · `main-account` · `main-order` · `main-addresses` · `main-reset-password` |
| Checkout / pedido confirmado | Shopify | Só marca, configurada no admin (Checkout > Personalizar). |
| Políticas | Shopify | Nativas. |

## 3. Página de produto (§3.1)

| # | Section | Onde | Estado |
| --- | --- | --- | --- |
| 1 | Galeria | `main-product` (fixa) | Carrossel com scroll-snap e contador no mobile, grade 2×N no desktop. |
| 2 | Nome, clube, temporada, versão | block `title` | Lê `titular.clube/temporada/modelagem/versao`. |
| 3 | Preço, Pix, parcelas | block `price` + `snippets/price-extras` | Cálculo de vitrine com as settings da seção Comercial. |
| 4 | Tamanho + guia | block `size` | Botões de 44px+, esgotado com rótulo, guia em `<dialog>` com o conteúdo da página escolhida em "Páginas de ajuda". |
| 5 | Caimento | block `fit` | 1 frase escolhida pela versão. |
| 6 | Personalização | block `personalization` | Propriedades `Nome`, `Número`, `_personalizada`. **Fase 4: a cobrança do valor extra não está ligada.** |
| 7 | Adicionar ao carrinho | block `buy_buttons` | Fixo no rodapé no mobile (sticky). Abre a gaveta. |
| 8 | Prazo por CEP | block `shipping` | Tabela por região (JSON no block) + `titular.prazo_dias` + dias da personalização. |
| 9 | Garantias | block `guarantees` | Ícone + texto. |
| 10 | Detalhes em acordeão | blocks `accordion` | Descrição / página / texto. Fechados por padrão. |
| 11 | Avaliações | section `reviews` | **Placeholders marcados como EXEMPLO.** Trocar por app (`@app`). |
| 12 | Mesmo clube | section `related-products` | Coleção com o handle do clube; sem ela, recomendações do Shopify. |

JS: `assets/produto.js` (variante, preço, galeria, personalização, CEP).

## 4. Comportamentos (JS)

| Arquivo | Faz |
| --- | --- |
| `assets/global.js` | Abre e fecha `<dialog>` (`data-dialog-open` / `data-dialog-close`), devolve o foco, fecha no backdrop; busca preditiva a partir de 2 letras. |
| `assets/carrinho.js` | Add-to-cart AJAX → abre a gaveta; quantidade, remover, trocar tamanho (mantém propriedades), cupom. Re-renderiza a gaveta pela Section Rendering API. |
| `assets/produto.js` | Ver §3. |
| `assets/colecao.js` | Ordenar ao trocar o select; "Carregar mais" acrescenta cards sem recarregar. |

Tudo funciona sem JS com fallback: form → `/cart/add`, ícone → `/cart`, lupa → `/search`, "Carregar mais" → `?page=N`.

## 5. Configurar no admin (a loja não fica completa sem isso)

1. **Metafields de produto** (Configurações > Dados personalizados > Produtos), namespace `titular`: `clube` (texto), `liga` (lista), `temporada` (texto), `uniforme` (lista), `versao` (lista: Torcedor, Jogador, Retrô), `modelagem` (lista), `manga` (lista), `personalizavel` (booleano), `prazo_dias` (inteiro). Os nomes têm que bater: o tema lê `product.metafields.titular.<key>`.
2. **Opção de variante** "Tamanho" (P, M, G, GG, 2GG, 3GG).
3. **Coleções automáticas** (§5.2): Lançamentos, Brasileirão, Internacionais, Seleções, Retrô, Mais vendidos e uma por clube, com handle = nome do clube (ex.: `santos`), para o "Mesmo clube" e o "Escolha seu clube".
4. **Filtros** (app Search & Discovery): clube, liga, versão, uniforme, modelagem, tamanho, preço.
5. **Menus**: `main-menu` (5 coleções, 1 nível), `ajuda` (6 páginas de ajuda), `footer` (Sobre, Políticas).
6. **Páginas** com o template certo: Guia de tamanhos → `page.guia-tamanhos`, Torcedor x Jogador → `page.torcedor-x-jogador`, Frete e prazos → `page.frete-prazos`, Trocas e devoluções → `page.trocas`, Rastrear pedido → `page.rastrear-pedido`, FAQ e contato → `page.contact`. Depois, apontar as 4 primeiras em Configurações do tema > Páginas de ajuda.
7. **Configurações do tema > Comercial**: Pix, parcelas, frete grátis, coleção "Mais vendidos".
8. **Desconto do Pix** existir de verdade no checkout (o tema só exibe o valor).
9. **Dados de exemplo** (§7): pelo menos 3 ligas, as 3 versões, as 3 modelagens, 1 personalizável e 1 com tamanho esgotado.

## 6. Placeholders e pendências

| Item | Situação | Fase |
| --- | --- | --- |
| Avaliações | Blocks de exemplo com aviso "EXEMPLO" | 3 (app) |
| Personalização: cobrança do extra | Não ligada | 4 |
| Rastrear pedido / pedir troca | Formulário de contato nativo (e-mail para a loja) | 2 / 3 |
| Prazo por CEP | Tabela fixa por região, sem transportadora | — (loja fictícia) |
| Endereços na conta | Lista + adicionar; editar/apagar pendente | 3 |
| Seções antigas não reescritas | `main-cart`, `main-blog`, `main-article`, `main-404`, `main-password`, `contact-form`, `rich-text`, `main-list-collections`: funcionam via aliases, sem refino | refino |
| Snippets sem uso | `localization-form`, `newsletter-form`, `share-button`, `assets/fontes.css` | apagar no refino |
| Avisos do theme check | 3 snippets órfãos + 2 `preconnect` do Google Fonts | — |

## 7. Home: padrão de design (2026-11-10)

- **Hero**: `min-height: 100svh - --hero-offset` (faixa de aviso, medida em `global.js`). Mídia: vídeo > imagem > `--ink`. Camada `--ink` com opacidade ajustável sobre a mídia (contraste, sem gradiente). Vídeo com botão de pausar e pausado com `prefers-reduced-motion`. CTA `.button--inverse`, largura total no celular.
- **Cabeçalho sobreposto** (`.header--overlay`): só na home, configurável em `nav` > "Transparente sobre o hero". Redefine `--focus` para `--ink-inverse` (anel de foco visível no escuro). **Pendente:** `titular-horizontal-reverso.svg` tem fundo `--ink` embutido; sobre foto/vídeo aparece como uma caixa preta. Precisa de uma versão do logo branco com fundo transparente.
- **Cabeçalho de section padrão**: `snippets/section-header.liquid` (rótulo `.text-label` + título `.text-h2` + link opcional). Usar em toda section nova.
- **Clubes**: círculos `--radius-pill`, brasão inteiro (`contain`) sobre `--surface-alt`; 72px no celular (linha rolável), 96px no desktop.
- **Modelos**: card padrão 3:4, cantos retos, nome `.text-h3` + quantidade.
- **Mais vendidos**: 3x3 a partir de 750px; no celular 2x4 (a 9ª some). Botão "Ver catálogo completo" embaixo.

## 8. Para o refinamento de design

- A hierarquia já segue os tokens (`.text-*`, cores, raios). Refinar = ajustar o layout nos `{% stylesheet %}` de cada section e os componentes em `base.css`.
- Verificar cada fase em 390px e 1440px, contraste e foco por teclado (`docs/arquitetura-informacao.md` §6).
- Pontos que pedem decisão visual: altura e proporção do destaque da home, nome do produto em `.text-h3` no card em 2 colunas (nomes longos), selo de esgotado dentro do botão de tamanho, densidade da gaveta do carrinho.
