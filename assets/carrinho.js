/*
  ============================================================
  carrinho.js — gaveta do carrinho (sections/cart-drawer.liquid)
  ============================================================

  O QUE FAZ:
  - Intercepta todo form de add-to-cart (action /cart/add ou
    data-type="add-to-cart-form"), envia via AJAX e abre a gaveta.
  - Na gaveta: quantidade (+/−/remover), troca de tamanho (remove a
    linha e adiciona a nova variante com as mesmas propriedades) e
    cupom (/cart/update.js com { discount }).
  - Toda resposta pede sections=cart-drawer e troca o conteúdo da
    gaveta pelo HTML novo (Section Rendering API), então a marcação
    vive só no Liquid.
  - Atualiza [data-cart-count] no cabeçalho.

  SEM JS:
  O form de produto envia para /cart/add e o ícone leva para /cart.
  Se o AJAX falhar no add, o form é enviado do jeito tradicional.
*/
(function () {
  'use strict';

  var SECTION = 'cart-drawer';
  var titular = window.titular || {};
  var routes = titular.routes || {};

  function drawer() { return document.getElementById('CartDrawer'); }

  function post(url, body) {
    var isForm = body instanceof FormData;
    if (isForm) {
      body.append('sections', SECTION);
      body.append('sections_url', window.location.pathname);
    } else {
      body.sections = SECTION;
      body.sections_url = window.location.pathname;
    }
    return fetch(url + '.js', {
      method: 'POST',
      headers: isForm ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: isForm ? body : JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw data;
        return data;
      });
    });
  }

  function render(data) {
    var html = data && data.sections && data.sections[SECTION];
    var el = drawer();
    if (!html || !el) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('[data-cart-drawer-content]');
    var current = el.querySelector('[data-cart-drawer-content]');
    if (fresh && current) current.replaceWith(fresh);
    refreshCount();
  }

  function refreshCount() {
    fetch((routes.cart || '/cart') + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      })
      .catch(function () {});
  }

  function busy(on) {
    var el = drawer();
    if (el) el.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function fail(error) {
    var message = (error && (error.description || error.message)) || titular.strings.cartError;
    if (typeof window.mostrarAlerta === 'function') window.mostrarAlerta(message, 'negativo');
  }

  /* ---------- Adicionar ao carrinho ---------- */

  document.addEventListener('submit', function (event) {
    var form = event.target;

    if (form.matches('[data-cart-discount]')) {
      event.preventDefault();
      var code = (new FormData(form).get('discount') || '').trim();
      if (!code) return;
      busy(true);
      post(routes.cartUpdate || '/cart/update', { discount: code })
        .then(render)
        .catch(fail)
        .finally(function () { busy(false); });
      return;
    }

    if (!form.matches('form[action$="/cart/add"], form[data-type="add-to-cart-form"]')) return;
    if (!drawer()) return;

    event.preventDefault();
    var button = form.querySelector('[type="submit"]');
    if (button) button.setAttribute('aria-busy', 'true');

    post(routes.cartAdd || '/cart/add', new FormData(form))
      .then(function (data) {
        render(data);
        if (titular.openDialog) titular.openDialog('CartDrawer', button);
      })
      .catch(function (error) {
        // Erro de estoque etc.: mostra a mensagem; erro de rede: envio tradicional.
        if (error && error.description) fail(error);
        else form.submit();
      })
      .finally(function () {
        if (button) button.removeAttribute('aria-busy');
      });
  });

  /* ---------- Quantidade e remover ---------- */

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-cart-quantity]');
    if (!button) return;
    var line = button.closest('[data-line-key]');
    if (!line) return;
    busy(true);
    post(routes.cartChange || '/cart/change', {
      id: line.getAttribute('data-line-key'),
      quantity: parseInt(button.getAttribute('data-cart-quantity'), 10)
    })
      .then(render)
      .catch(fail)
      .finally(function () { busy(false); });
  });

  /* ---------- Troca de tamanho ---------- */

  document.addEventListener('change', function (event) {
    var select = event.target.closest('[data-cart-variant]');
    if (!select) return;
    var line = select.closest('[data-line-key]');
    var key = line.getAttribute('data-line-key');
    var quantity = parseInt(line.getAttribute('data-quantity'), 10) || 1;
    busy(true);

    fetch((routes.cart || '/cart') + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var item = cart.items.find(function (i) { return i.key === key; });
        var properties = (item && item.properties) || {};
        return post(routes.cartChange || '/cart/change', { id: key, quantity: 0 }).then(function () {
          return post(routes.cartAdd || '/cart/add', {
            items: [{ id: parseInt(select.value, 10), quantity: quantity, properties: properties }]
          });
        });
      })
      .then(render)
      .catch(fail)
      .finally(function () { busy(false); });
  });

  document.addEventListener('DOMContentLoaded', refreshCount);
})();
