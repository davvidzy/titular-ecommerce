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

  document.querySelectorAll('[data-video-toggle]').forEach(function (button) {
    var video = button.closest('[data-hero]').querySelector('video');
    if (!video) return;

    function setState(paused) {
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', button.getAttribute(paused ? 'data-label-play' : 'data-label-pause'));
      button.querySelector('[data-icon-pause]').hidden = paused;
      button.querySelector('[data-icon-play]').hidden = !paused;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      video.pause();
      setState(true);
    }

    button.addEventListener('click', function () {
      if (video.paused) { video.play(); setState(false); }
      else { video.pause(); setState(true); }
    });
  });

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
