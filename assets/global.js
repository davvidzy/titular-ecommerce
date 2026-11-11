/*
  ============================================================
  global.js — comportamentos comuns a todas as páginas
  ============================================================

  1. Diálogos (gavetas e modais) com o elemento nativo <dialog>:
     - [data-dialog-open="ID"] abre o <dialog id="ID"> (showModal).
       Em links, impede a navegação só quando o JS está ativo; sem JS
       o link leva para a página equivalente (/cart, /search...).
     - [data-dialog-close] fecha o diálogo mais próximo.
     - Clique no fundo (backdrop) fecha. Esc fecha (nativo).
     - O foco volta para o elemento que abriu.
     - Evento 'titular:dialog-open' (detail.id) para outros scripts.
     window.titular.openDialog(id) / closeDialog(id) ficam públicos.

  2. Busca preditiva (§4.2 da arquitetura): a partir de 2 letras
     busca /search/suggest com section_id=predictive-search e injeta
     o HTML em [data-predictive-search-results].
*/
(function () {
  'use strict';

  var titular = (window.titular = window.titular || {});
  var lastTrigger = null;

  function openDialog(id, trigger) {
    var dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    lastTrigger = trigger || document.activeElement;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('has-dialog');
    dialog.dispatchEvent(new CustomEvent('titular:dialog-open', { bubbles: true, detail: { id: id } }));
    return true;
  }

  function closeDialog(target) {
    var dialog = typeof target === 'string' ? document.getElementById(target) : target;
    if (dialog && dialog.open) dialog.close();
  }

  titular.openDialog = openDialog;
  titular.closeDialog = closeDialog;

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-dialog-open]');
    if (opener) {
      if (openDialog(opener.getAttribute('data-dialog-open'), opener)) event.preventDefault();
      return;
    }

    var closer = event.target.closest('[data-dialog-close]');
    if (closer) {
      closeDialog(closer.closest('dialog'));
      return;
    }

    // Clique no backdrop: o alvo é o próprio <dialog>.
    if (event.target.tagName === 'DIALOG') closeDialog(event.target);
  });

  document.addEventListener(
    'close',
    function (event) {
      if (event.target.tagName !== 'DIALOG') return;
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('has-dialog');
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      lastTrigger = null;
    },
    true
  );

  /* ---------- Cabeçalho fixo ---------- */

  // --header-height: usado por barras que grudam abaixo do cabeçalho
  // (ex.: Filtrar/Ordenar da coleção). .is-scrolled deixa o cabeçalho
  // transparente da home sólido depois que a página rola.
  var header = document.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  function measureHeader() {
    if (header) document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }
  measureHeader();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measureHeader);

  /* ---------- Hero: altura e vídeo ---------- */

  // --hero-offset = altura do que está acima do hero no fluxo (faixa de
  // aviso). O cabeçalho sobreposto (.header--overlay) não conta.
  function measureHeroOffset() {
    var offset = 0;
    document.querySelectorAll('.shopify-section-group-header-group').forEach(function (el) {
      if (!el.querySelector('.header--overlay')) offset += el.offsetHeight;
    });
    document.documentElement.style.setProperty('--hero-offset', offset + 'px');
  }
  if (document.querySelector('[data-hero]')) {
    measureHeroOffset();
    window.addEventListener('resize', measureHeroOffset);
  }

  // Vídeo do hero: com "reduzir movimento", economia de dados ou conexão
  // 2G, não toca e fica só a capa (poster). Se o autoplay for bloqueado,
  // a capa também fica. Não há botão de pausar (pedido do dono).
  document.querySelectorAll('[data-hero] video').forEach(function (video) {
    var conn = navigator.connection || {};
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || conn.saveData || /2g/.test(conn.effectiveType || '')) {
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.pause();
      return;
    }
    var attempt = video.play && video.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  });

  /* ---------- Aparecer ao rolar ---------- */

  // Cabeçalhos de seção e itens de grade sobem e aparecem quando entram
  // na tela (CSS em base.css, "Movimento"). Só marca o que está ABAIXO
  // da dobra no carregamento, para nada que já está visível piscar.
  // Itens que entram juntos ganham um atraso escalonado (--reveal-i).
  // Listas que rolam na lateral ([data-scroll-dots-target]) aparecem
  // inteiras: deslocar os itens lá dentro criaria rolagem vertical.
  var REVEAL = '.section__header, .product-grid > li, [data-scroll-dots-target], .models__grid > li, .guarantees__item';
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--reveal-i', Math.min(i++, 5));
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    var fold = window.innerHeight;
    document.querySelectorAll(REVEAL).forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) return;
      el.setAttribute('data-reveal', '');
      revealObserver.observe(el);
    });
    document.documentElement.classList.add('has-reveal');
  }

  /* ---------- Pontos de listas horizontais ---------- */

  // [data-scroll-dots] logo depois de uma lista [data-scroll-dots-target]
  // que rola na horizontal: um ponto por tela de conteúdo (o atual em
  // destaque, dentro de [data-scroll-dots-track]) e setas
  // [data-scroll-prev]/[data-scroll-next] (visíveis só no desktop, onde
  // não dá para arrastar com o dedo). Sem rolagem, tudo fica escondido.
  document.querySelectorAll('[data-scroll-dots]').forEach(function (nav) {
    var list = nav.previousElementSibling;
    if (!list || !list.hasAttribute('data-scroll-dots-target')) return;
    var dots = nav.querySelector('[data-scroll-dots-track]') || nav;
    var prev = nav.querySelector('[data-scroll-prev]');
    var next = nav.querySelector('[data-scroll-next]');
    var count = 0;

    function step(direction) {
      list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    function build() {
      var pages = list.scrollWidth > list.clientWidth + 1 ? Math.ceil(list.scrollWidth / list.clientWidth) : 0;
      nav.hidden = pages < 2;
      if (pages === count) return update();
      count = pages;
      dots.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('span');
        dot.className = 'scroll-dots__dot';
        dots.appendChild(dot);
      }
      update();
    }

    function update() {
      if (count < 2) return;
      var max = list.scrollWidth - list.clientWidth;
      var active = max > 0 ? Math.round((list.scrollLeft / max) * (count - 1)) : 0;
      if (prev) prev.disabled = list.scrollLeft <= 1;
      if (next) next.disabled = list.scrollLeft >= max - 1;
      Array.prototype.forEach.call(dots.children, function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    var frame = null;
    list.addEventListener('scroll', function () {
      if (frame) return;
      frame = requestAnimationFrame(function () { frame = null; update(); });
    }, { passive: true });
    window.addEventListener('resize', build);
    build();
  });

  /* ---------- Diálogo que abre sozinho ---------- */

  // [data-open-on-load]: formulário enviado (sucesso ou erro) volta com o
  // diálogo aberto para mostrar o resultado.
  document.querySelectorAll('dialog[data-open-on-load]').forEach(function (dialog) {
    openDialog(dialog.id);
  });

  /* ---------- Clubes: busca na gaveta "Ver todos" ---------- */

  function normalize(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }
  document.querySelectorAll('[data-club-filter]').forEach(function (input) {
    var body = input.closest('.drawer__body');
    var items = body.querySelectorAll('[data-club-filter-list] > li');
    var empty = body.querySelector('[data-club-filter-empty]');
    input.addEventListener('input', function () {
      var term = normalize(input.value);
      var shown = 0;
      items.forEach(function (item) {
        var match = !term || normalize(item.textContent).indexOf(term) > -1;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });

  /* ---------- Pop-up de oferta (sections/newsletter-popup.liquid) ---------- */

  (function () {
    var popup = document.querySelector('[data-offer-popup]');
    if (!popup) return;
    var KEY = 'titular-offer';
    var WEEK = 7 * 24 * 60 * 60 * 1000;

    function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

    if (popup.hasAttribute('data-offer-subscribed')) save({ subscribed: true });

    // Fechar sem se inscrever: some por 7 dias.
    popup.addEventListener('close', function () {
      var state = read();
      if (!state.subscribed) save({ dismissedAt: Date.now() });
    });

    // Copiar o cupom.
    var copy = popup.querySelector('[data-offer-copy]');
    if (copy) {
      copy.addEventListener('click', function () {
        var code = popup.querySelector('[data-offer-code]').textContent.trim();
        var done = function () { copy.textContent = copy.getAttribute('data-label-copied'); };
        if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, function () {});
        else done();
      });
    }

    if (popup.hasAttribute('data-open-on-load')) return; // já aberto acima
    var state = read();
    if (state.subscribed || (state.dismissedAt && Date.now() - state.dismissedAt < WEEK)) return;
    if (window.Shopify && window.Shopify.designMode) return;

    var shown = false;
    function show() {
      if (shown) return;
      if (document.querySelector('dialog[open]')) { setTimeout(show, 4000); return; }
      shown = true;
      openDialog(popup.id);
    }
    var delay = (parseInt(popup.getAttribute('data-delay'), 10) || 6) * 1000;
    setTimeout(show, delay);
    // Desktop: mouse saindo pelo topo da janela (intenção de sair).
    document.addEventListener('mouseout', function (event) {
      if (!event.relatedTarget && event.clientY <= 0 && Date.now() > startedAt + 3000) show();
    });
    var startedAt = Date.now();
  })();

  /* ---------- Busca preditiva ---------- */

  var searchInput = document.querySelector('[data-predictive-search-input]');
  var searchResults = document.querySelector('[data-predictive-search-results]');
  var searchTimer = null;
  var searchController = null;

  document.addEventListener('titular:dialog-open', function (event) {
    if (event.detail.id === 'SearchOverlay' && searchInput) searchInput.focus();
  });

  function runSearch(term) {
    if (!searchResults) return;
    if (term.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    if (searchController) searchController.abort();
    searchController = new AbortController();

    var url =
      titular.routes.predictiveSearch +
      '?q=' + encodeURIComponent(term) +
      '&section_id=predictive-search' +
      '&resources[type]=collection,product' +
      '&resources[limit]=6' +
      '&resources[options][fields]=title,product_type,variants.title,vendor';

    fetch(url, { signal: searchController.signal })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var payload = doc.querySelector('[data-predictive-search-payload]');
        searchResults.innerHTML = payload ? payload.outerHTML : '';
      })
      .catch(function () {});
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var term = searchInput.value.trim();
      searchTimer = setTimeout(function () { runSearch(term); }, 250);
    });
  }
})();
