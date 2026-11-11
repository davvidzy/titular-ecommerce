# Titular

**Camisas de futebol. Vista como titular.**

Titular é uma loja on-line de camisas de futebol: clubes nacionais, internacionais, seleções e retrô. A marca é preto e branco de propósito: a loja é a moldura neutra, e a única cor da página vem das próprias camisas.

## Por que esse nome

"Titular" tem três leituras, e todas trabalham a favor da venda:

1. **A camisa titular** é o primeiro uniforme do clube, a peça mais vendida de qualquer temporada.
2. **Ser titular** é estar entre os onze que começam o jogo. O torcedor que veste a camisa entra em campo junto.
3. **O titular** é o dono de algo (titular da conta, do cartão). A camisa é sua, com seu nome e seu número.

Slogan: **Vista como titular.**

## Objetivo da marca

Ser a loja onde o torcedor compra camisa de time sem medo de errar: modelo certo, tamanho certo, entrega no prazo.

O mercado de camisas fala alto e explica pouco. Quase toda descrição repete "manto sagrado" e "garanta já", e quase nenhuma responde as dúvidas que travam a compra: qual a diferença entre versão torcedor e versão jogador, se a forma é justa ou larga, quanto tempo leva para chegar, como funciona a troca. A Titular ganha espaço respondendo isso antes de o cliente perguntar.

## Contexto

| | |
| --- | --- |
| **Produto** | Camisas de futebol: clubes brasileiros, clubes internacionais, seleções e linha retrô. Personalização de nome e número como serviço adicional. |
| **Público** | Torcedores de 18 a 40 anos que compram pelo celular, chegam por anúncio ou Instagram e usam a camisa no estádio e no dia a dia (o estilo blokecore). |
| **Canal** | Loja própria (Shopify), tráfego pago na Meta e Instagram como vitrine. |
| **Concorrência** | Grandes varejistas esportivos (catálogo enorme, experiência genérica) e lojas pequenas de Instagram (preço baixo, pouca confiança). |
| **Diferença** | Curadoria enxuta, informação de produto clara e uma experiência visual limpa que deixa a camisa ser a protagonista. |

## Pilares

1. **Clareza.** Toda página de produto diz versão, tecido, caimento, medidas reais em centímetros e prazo de entrega. Nenhuma dúvida fica para o WhatsApp.
2. **Curadoria.** Menos itens, melhor escolhidos. Coleções por história (temporada atual, clássicos, seleções), não por pilha de estoque.
3. **Confiança.** Troca simples, rastreio em todo pedido, política escrita em linguagem humana e visível antes da compra.

## Voz

A Titular fala como o amigo da arquibancada que entende de camisa: direto, seguro, com bom humor de futebol, sem gritaria.

| Faça | Evite |
| --- | --- |
| "Versão torcedor: tecido mais grosso, corte reto. Se você usa M no dia a dia, leve M." | "VISTA O MANTO SAGRADO!!! GARANTA JÁ O SEU!!!" |
| "Chega em 5 a 8 dias úteis. Você recebe o rastreio por e-mail." | "Envio rápido para todo o Brasil!" sem prazo |
| "Escalação da semana" para lançamentos | Caixa alta em parágrafos inteiros |
| Vocabulário de futebol com moderação: escalação, titular, reserva, vestiário | Gírias de torcida específica (a marca é de todos os times) |

Regras de escrita: frases curtas, números concretos, verbo no imperativo só em botões. Caixa alta apenas em rótulos curtos e no logotipo.

## Fundamentos visuais

**Cor.** Sistema monocromático. `ink` (#0A0A0A) para texto e ação primária; `surface` (#FFFFFF) como fundo de todas as páginas; `surface-alt` (#F5F5F5) atrás das fotos de produto, para a camisa destacar sem borda. Texto secundário em `ink-muted` (#525252, contraste 7,8:1 no branco e 7,2:1 no cinza). Todas as combinações de texto atendem WCAG AAA (7:1). As únicas cores com matiz são de estado (`danger`, `success`) e sempre aparecem com ícone ou texto, nunca sozinhas. Exceção: `rating` (#D4A12A), dourado fechado usado só no preenchimento das estrelas de avaliação, sempre com o número ao lado.

**Tipografia.** Uma família só: Archivo (Google Fonts). Variação por peso e caixa, não por família. Títulos em 800, maiúsculas, espaçamento negativo leve; corpo em 400 com entrelinha 1,6 e linha de no máximo 70 caracteres; preços em 700 com algarismos tabulares (`font-variant-numeric: tabular-nums`) para alinhar em listas.

**Layout.** Grade de 12 colunas, margem de 24px no mobile e 48px no desktop, espaçamento em múltiplos de 4. Cantos retos em fotos e cards (`radius-none`); 4px apenas em botões e campos (`radius-sm`). Nada de sombra: separação por espaço e por `line`.

**Foco e acessibilidade.** Todo elemento interativo mostra anel de foco de 2px em `focus` com 2px de afastamento. Bordas de campos em `line-strong` (4,5:1, acima do mínimo de 3:1 para componentes). Área de toque mínima de 44px.

## Logo

O símbolo é a letra **T** desenhada como uma camisa: a barra do T vira os ombros, o recorte em V vira a gola, a haste vira o corpo. Funciona sozinho em avatar, favicon e etiqueta. A palavra TITULAR é Archivo ExtraBold convertida em contorno, com espaçamento de +0,04em.

Versões: horizontal (padrão no cabeçalho), símbolo (avatar, favicon, embalagem), palavra (rodapé, documentos), cada uma em preto sobre branco e branco sobre preto.

Regras:
- Área de respiro em volta do logo igual à largura da haste do T.
- Tamanho mínimo: 96px de largura na versão horizontal, 24px no símbolo.
- Só preto (#0A0A0A) ou branco. Nunca nas cores de um clube.
- Nunca colocar o logo dentro de um escudo, nem ao lado de escudo de clube de forma que sugira parceria oficial.

## Fotografia de produto

Camisa sozinha, de frente e de costas, em fundo `surface-alt`, luz uniforme, mesmo enquadramento em todo o catálogo. É a foto que carrega a cor da marca. Fotos de uso (pessoas na rua, no estádio) entram só em banners e redes, nunca na grade de produtos.
