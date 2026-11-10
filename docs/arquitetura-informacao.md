# Titular · Arquitetura da informação

> Especificação para implementação. Loja fictícia, sem venda real: fornecedor, licenciamento e operação ficam fora do escopo. Nomes de clube são conteúdo de exemplo.
> Design: siga `CLAUDE.md` e `brand/`. Este arquivo define **o que** existe e **em que ordem**; os tokens definem **como** fica.

## 1. Premissas

- **A página de produto é a página mais importante.** Quem chega por anúncio cai direto nela, no celular. A home é secundária.
- **Mobile first.** Desenhe e teste em 390px primeiro. Desktop é adaptação.
- **O produto responde sozinho** às dúvidas de compra (versão, tamanho, prazo, troca), sem obrigar a pessoa a navegar.
- **Navegação rasa.** No máximo 2 níveis: coleção, depois filtro. Sem terceiro nível de menu.
- **Shopify nativo onde der.** Coleção, produto, carrinho, conta e checkout usam as estruturas do Shopify. O checkout só recebe marca (logo, cores) e campos.
- **Personalização tem fluxo próprio.** Nome e número aumentam o prazo e não têm troca; o aviso aparece no produto e no carrinho.

## 2. Mapa do site

```
Home
├── Catálogo
│   ├── Lançamentos
│   ├── Brasileirão        (filtro por clube)
│   ├── Internacionais     (filtro por liga e clube)
│   ├── Seleções
│   ├── Retrô
│   ├── Coleção por clube  (destino do "Escolha seu clube")
│   └── Busca
├── Produto e compra
│   ├── Página de produto  ← PRIORIDADE MÁXIMA
│   ├── Carrinho (gaveta lateral, não é página)
│   ├── Checkout Shopify
│   └── Pedido confirmado
├── Ajuda
│   ├── Guia de tamanhos
│   ├── Torcedor x Jogador
│   ├── Frete e prazos
│   ├── Trocas e devoluções
│   ├── Rastrear pedido
│   └── FAQ e contato
└── Conta e institucional
    ├── Login e cadastro
    ├── Meus pedidos
    ├── Sobre a Titular
    └── Políticas e termos

Rodapé em todas as páginas: ajuda, contato, pagamentos, redes.
```

**Menu principal (cabeçalho):** Lançamentos · Brasileirão · Internacionais · Seleções · Retrô, mais ícones de busca, conta e carrinho. No mobile, os links de coleção vão para um menu em gaveta.

### Mapeamento para templates Shopify

| Página | Template / arquivo |
| --- | --- |
| Home | `templates/index.json` |
| Coleções (todas) | `templates/collection.json` |
| Página de produto | `templates/product.json` |
| Carrinho em gaveta | `sections/cart-drawer.liquid` (abre por evento, sem trocar de página) |
| Busca | `templates/search.json` |
| Páginas de ajuda e institucionais | `templates/page.json` + `page.<nome>.json` quando a página tiver layout próprio (ex.: `page.guia-tamanhos.json`) |
| Conta | `templates/customers/*` |
| Pedido confirmado | Página de status do pedido do Shopify (só marca) |

## 3. Sections por página

Cada section tem um único trabalho. Implemente na ordem listada (de cima para baixo na página).

### 3.1 Página de produto

| # | Section | Trabalho | Regras |
| --- | --- | --- | --- |
| 1 | Galeria (frente, costas, detalhe do tecido, etiqueta) | Mostrar a peça real | Carrossel deslizável no mobile; fundo `--surface-alt`; sem zoom escondido |
| 2 | Nome, clube, temporada e versão | Confirmar que é a camisa certa | Nome em `.text-h2`; versão como selo em `.text-label` |
| 3 | Preço, desconto no Pix e parcelas | Responder "quanto custa" | Preço em `.text-price` (tabular-nums) |
| 4 | Seletor de tamanho + link "Guia de tamanhos" | Escolher tamanho | Botões quadrados de 44px mín.; esgotado com rótulo, não só cinza; guia abre em **modal** |
| 5 | Recomendação de caimento | Evitar troca | 1 frase, ex.: "Corte justo: se está entre dois tamanhos, leve o maior" |
| 6 | Personalização (opcional) | Nome e número | Só aparece se o produto for personalizável; mostra preço, prazo extra e "sem troca" |
| 7 | Botão "Adicionar ao carrinho" | Ação principal | Fixo no rodapé da tela no mobile; ao clicar, abre a gaveta do carrinho |
| 8 | Prazo por CEP | Tirar a dúvida de entrega | Campo de CEP + resultado na mesma section |
| 9 | Garantias | Reduzir risco percebido | Troca, devolução em 7 dias, pagamento seguro; ícone + texto |
| 10 | Detalhes em acordeão | Informação completa | Tecido, caimento, Torcedor x Jogador; fechados por padrão |
| 11 | Avaliações com foto | Prova social | Só avaliações reais; no projeto fictício, use placeholder marcado como exemplo |
| 12 | Mesmo clube / outras versões | Segunda chance | Grade de 4 produtos |

### 3.2 Home

| # | Section | Trabalho |
| --- | --- | --- |
| 1 | Faixa de aviso | Uma frase com a principal objeção resolvida (prazo, frete ou troca); fundo `--ink`, texto `--ink-inverse` |
| 2 | Cabeçalho | Logo, menu, busca, conta, carrinho |
| 3 | Destaque da temporada | Uma coleção, uma imagem, um botão |
| 4 | Atalhos de coleção | Brasileirão, Internacionais, Seleções, Retrô em 1 toque |
| 5 | Escolha seu clube | Lista de clubes **em texto** (sem escudos), cada um leva à coleção do clube |
| 6 | Mais vendidos | Grade de 4 a 8 produtos |
| 7 | Torcedor x Jogador | A diferença em 3 linhas + link para a página de ajuda |
| 8 | Avaliações | Confiança para quem não conhece a marca |
| 9 | Garantias e pagamento | Pix, cartão parcelado, troca e prazo |
| 10 | Rodapé | Navegação, ajuda, contato, pagamentos, redes |

### 3.3 Coleção

| # | Section | Trabalho |
| --- | --- | --- |
| 1 | Título, quantidade de itens, 1 linha de descrição | Confirmar onde a pessoa está |
| 2 | Barra "Filtrar" + "Ordenar" | Fixa ao rolar no mobile; filtros abrem em gaveta |
| 3 | Filtros ativos em chips removíveis | Desfazer filtro em 1 toque |
| 4 | Grade de produtos | 2 colunas no mobile, 4 no desktop |
| 5 | Carregar mais | Paginação sem perder a posição |
| 6 | Texto da coleção | No fim da página (SEO) |

**Card de produto:** foto da frente (costas no hover, só desktop), nome, selo da versão, preço, parcela, selo opcional (Novo, -20%) em `--radius-pill`. Cantos retos (`--radius-none`).

### 3.4 Carrinho (gaveta lateral)

| # | Section | Trabalho |
| --- | --- | --- |
| 1 | Itens | Tamanho e personalização editáveis na gaveta |
| 2 | Barra de frete grátis | Só se houver política de frete grátis |
| 3 | Cupom | Aplicar sem sair da gaveta |
| 4 | Subtotal + "Finalizar compra" | Ação única |

Itens personalizados mostram o aviso "sem troca" também aqui.

### 3.5 Checkout e pedido confirmado

Checkout nativo do Shopify: apenas logo, cores da marca, Pix e cartão. A página de pedido confirmado mostra resumo, prazo estimado, como acompanhar o rastreio e convite para criar conta.

### 3.6 Ajuda

| Página | Conteúdo |
| --- | --- |
| Guia de tamanhos | Tabela em cm por modelagem (masculina, feminina, infantil) e como medir. O mesmo conteúdo alimenta o modal da página de produto. |
| Torcedor x Jogador | Diferença de tecido, corte e preço, com foto lado a lado |
| Frete e prazos | Prazo por região e quando o rastreio chega |
| Trocas e devoluções | Passo a passo, prazos e o que não tem troca (personalizadas) |
| Rastrear pedido | Campo de número do pedido + e-mail |
| FAQ e contato | Perguntas restantes e WhatsApp |

## 4. Fluxos

### 4.1 Compra (fluxo principal)

```
Anúncio no Instagram
  → Página de produto
      ↳ dúvida de tamanho → Guia de tamanhos (modal) → volta ao produto
  → Tamanho e versão
      ↳ opcional → Nome e número (+ prazo, sem troca) → volta ao produto
  → Adicionar ao carrinho → Carrinho (gaveta abre)
  → Checkout Shopify
      ↳ abandona → Recuperação por e-mail e WhatsApp → retoma no checkout preenchido
  → Pedido confirmado
  → Entrega e avaliação
```

Regra: os desvios (guia, personalização, recuperação) sempre devolvem a pessoa ao ponto onde estava. Guia e personalização **nunca** abrem em outra página.

### 4.2 Busca

1. Toque na lupa abre a busca em tela cheia, com o teclado aberto.
2. Sugestões a partir de 2 letras: clubes primeiro, depois produtos com foto.
3. Sem resultado: "Não achamos X" + mais vendidos. Nunca uma página vazia.

### 4.3 Troca de tamanho

1. Cliente entra em Trocas e devoluções pelo rodapé ou pelo e-mail do pedido.
2. Informa número do pedido e e-mail.
3. Escolhe o item e o novo tamanho; personalizadas aparecem bloqueadas, com o motivo.
4. Recebe instruções de envio e acompanha o status na conta.

### 4.4 Pós-compra

1. Pedido confirmado: e-mail com resumo e prazo.
2. Envio: e-mail e WhatsApp com código de rastreio.
3. Entrega: pedido de avaliação com foto 7 dias depois.
4. Lançamento do mesmo clube: aviso para quem comprou aquele clube.

## 5. Taxonomia e dados

**Regra:** só o tamanho vira variante. O resto vira metafield do produto. Personalização (nome e número) é propriedade do item no carrinho (`line item properties`), não variante.

### 5.1 Atributos do produto

| Atributo | Tipo | Namespace.key sugerido | Valores |
| --- | --- | --- | --- |
| Clube ou seleção | metafield (texto) | `titular.clube` | Nome do clube |
| Liga ou país | metafield (lista fixa) | `titular.liga` | Brasileirão, Premier League, La Liga, Serie A, Seleções |
| Temporada | metafield (texto) | `titular.temporada` | 2026/27, 2025/26, ano do retrô |
| Uniforme | metafield (lista fixa) | `titular.uniforme` | I (titular), II, III, Goleiro, Treino |
| Versão | metafield (lista fixa) | `titular.versao` | Torcedor, Jogador, Retrô |
| Modelagem | metafield (lista fixa) | `titular.modelagem` | Masculina, Feminina, Infantil |
| Manga | metafield (lista fixa) | `titular.manga` | Curta, Longa |
| Tamanho | **variante** | `option1` | P, M, G, GG, 2GG, 3GG (infantil por idade) |
| Personalizável | metafield (booleano) | `titular.personalizavel` | true / false |
| Prazo de envio | metafield (inteiro) | `titular.prazo_dias` | Dias úteis |

### 5.2 Coleções

| Coleção | Regra (coleção automática) |
| --- | --- |
| Lançamentos | Temporada atual; ordem por data de criação |
| Brasileirão | `liga = Brasileirão` |
| Internacionais | `liga` em Premier League, La Liga, Serie A |
| Seleções | `liga = Seleções` |
| Retrô | `versao = Retrô` |
| Uma por clube | `clube = X` |

### 5.3 Filtros e ordenação

- **Filtros:** clube, liga, versão, uniforme, modelagem, tamanho disponível, faixa de preço.
- **Ordenar:** mais vendidos (padrão), lançamentos, menor preço, maior preço.

### 5.4 Nome e URL

- Nome: `Camisa {Clube} {Uniforme} {Temporada} {Versão} {Modelagem}`. Ex.: "Camisa Santos II 2026/27 Torcedor Masculina".
- Handle: o mesmo padrão em minúsculas, sem acento, com hífens. Ex.: `camisa-santos-ii-2026-27-torcedor-masculina`.

## 6. Ordem de construção

Construa na ordem em que o dinheiro passa: produto, carrinho, checkout. A home vem depois.

| Fase | O que entra |
| --- | --- |
| 1. Vender | Página de produto completa, carrinho em gaveta, checkout com marca, pedido confirmado, guia de tamanhos, trocas e devoluções, rodapé |
| 2. Navegar | Coleções com filtros, busca, home, Torcedor x Jogador, frete e prazos, rastrear pedido |
| 3. Reter | Avaliações com foto, conta, recuperação de carrinho, "mesmo clube" |
| 4. Ampliar | Personalização, coleções por clube como landing pages, aviso de lançamento |

**Para o Claude Code:** trabalhe uma fase por vez. Ao terminar cada fase, verifique em 390px e 1440px, confira contraste e foco por teclado e só então siga.

## 7. Dados de exemplo

Como a loja é fictícia, crie produtos de exemplo cobrindo todas as combinações que os filtros precisam testar: pelo menos 3 ligas, as 3 versões, as 3 modelagens, 1 produto personalizável e 1 produto com um tamanho esgotado.
