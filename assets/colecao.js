/*
  ============================================================
  colecao.js — coleção: ordenar e "Carregar mais"
  ============================================================

  - Ordenar: trocar o <select data-sort-select> envia o form na hora.
  - Carregar mais (§3.3 #5): busca a próxima página, acrescenta os
    cards em [data-product-grid] e atualiza o link/contador, sem
    perder a posição da rolagem. O foco vai para o primeiro card novo.
    Sem JS, [data-load-more] é um link comum para ?page=N.
*/
(function () {
  'use strict';

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-sort-select]')) event.target.form.submit();
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-load-more]');
    if (!link) return;
    event.preventDefault();

    var grid = document.querySelector('[data-product-grid]');
    var wrapper = link.closest('[data-load-more-wrapper]');
    if (!grid || !wrapper) return;

    link.setAttribute('aria-busy', 'true');
    fetch(link.href)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var nextItems = doc.querySelectorAll('[data-product-grid] > li');
        var firstNew = null;
        nextItems.forEach(function (item) {
          var node = document.importNode(item, true);
          if (!firstNew) firstNew = node;
          grid.appendChild(node);
        });

        var nextWrapper = doc.querySelector('[data-load-more-wrapper]');
        if (nextWrapper) wrapper.replaceWith(nextWrapper);
        else wrapper.remove();

        var focusable = firstNew && firstNew.querySelector('a');
        if (focusable) focusable.focus({ preventScroll: true });
      })
      .catch(function () { window.location.href = link.href; });
  });
})();
