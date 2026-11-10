# Loja Titular

E-commerce de camisas de futebol. Loja fictícia, sem venda real.

Antes de qualquer tarefa, leia:

1. `docs/arquitetura-informacao.md`: páginas, sections, fluxos, dados e ordem de construção. É o escopo.
2. `brand/README.md`: marca, voz e regras visuais.
3. `brand/tokens.css`: os únicos valores visuais permitidos.
4. `docs/esqueleto.md`: o que já existe no tema, onde fica, o que é placeholder e o que falta configurar no admin.

O tema carrega `assets/tokens.css`, cópia de `brand/tokens.css`. Depois de regenerar os tokens, rode `node scripts/sync-tokens.mjs`.

Siga a ordem de fases da seção 6 da arquitetura. Não construa nada que não esteja no mapa do site sem perguntar.

## Regras de design (obrigatórias)

- Use apenas os tokens de `brand/tokens.css` (variáveis CSS e classes `.text-*`). Nunca escreva cor, tamanho de fonte, espaçamento ou raio em valor solto (hex, px) se existir um token para isso.
- Fonte única: Archivo. Variação por peso e caixa, nunca por outra família.
- Fundo de página sempre `--surface` (branco). Fotos de produto sobre `--surface-alt`.
- Sistema monocromático: nenhuma cor de destaque. As únicas cores com matiz são `--danger` e `--success`, sempre com ícone ou texto.
- Contraste WCAG AAA (7:1) para todo texto. Borda de controle em `--line-strong`; `--line` só para divisórias decorativas.
- Foco visível em todo elemento interativo (já definido em tokens.css; não remover `outline`).
- Área de toque mínima de 44px. Cantos retos (`--radius-none`) em fotos e cards; `--radius-sm` em botões e campos.
- Sem sombras, sem gradientes.

## Logo

Arquivos em `brand/logos/`. Use o SVG como está: não recolorir, não esticar, não recriar em código. Cabeçalho: `titular-horizontal.svg`. Favicon: `titular-simbolo.svg`.

## Texto

Siga a seção "Voz" de `brand/README.md`: direto, com números concretos, sem caixa alta em parágrafos e sem "garanta já" ou "manto sagrado".

## Fonte da verdade

`brand/tokens.json` é a origem. Se um token mudar, atualize o JSON e regenere `brand/tokens.css`; não edite os dois separadamente.
