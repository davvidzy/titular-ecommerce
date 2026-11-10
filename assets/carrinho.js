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
    return refreshCount();
  }

  function refreshCount() {
    return fetch((routes.cart || '/cart') + '.js', { headers: { Accept: 'application/json' } })
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

  /* ---------- Animação do adicionar rápido ---------- */

  // Um "+" sai do botão do card e voa até o ícone do carrinho no cabeçalho.
  // Com "reduzir movimento" ligado no sistema, pula a animação.
  function flyToCart(button) {
    var target = document.querySelector('[data-cart-link]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!button || !target || reduce || typeof document.body.animate !== 'function') return Promise.resolve();

    var from = button.getBoundingClientRect();
    var to = target.getBoundingClientRect();
    var size = from.height;
    var fly = document.createElement('span');
    fly.className = 'fly-plus';
    fly.setAttribute('aria-hidden', 'true');
    var icon = button.querySelector('.card-product__add-icon');
    fly.innerHTML = icon ? icon.innerHTML : '+';
    fly.style.left = (from.left + from.width / 2 - size / 2) + 'px';
    fly.style.top = (from.top + from.height / 2 - size / 2) + 'px';
    document.body.appendChild(fly);

    var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    var animation = fly.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx * 0.4 + 'px, ' + (dy * 0.4 - 60) + 'px) scale(0.9)', opacity: 1, offset: 0.4 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.3)', opacity: 0.2 }
      ],
      { duration: 650, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' }
    );
    return animation.finished.catch(function () {}).then(function () { fly.remove(); });
  }

  function bumpCount() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.classList.remove('is-bumping');
      void el.offsetWidth;
      el.classList.add('is-bumping');
    });
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
    var button = event.submitter || form.querySelector('[type="submit"]');
    // "Comprar agora": adiciona e vai direto para o checkout.
    var buyNow = button && button.hasAttribute('data-buy-now');
    if (button) button.setAttribute('aria-busy', 'true');

    // Adicionar rápido do card: não abre a gaveta; anima e avisa.
    var quickAdd = form.hasAttribute('data-quick-add');

    post(routes.cartAdd || '/cart/add', new FormData(form))
      .then(function (data) {
        if (buyNow) {
          window.location.href = (routes.root || '/') + 'checkout';
          return;
        }
        if (quickAdd) {
          return flyToCart(button).then(function () {
            return Promise.resolve(render(data)).then(bumpCount).then(function () {
            if (typeof window.mostrarAlerta === 'function') {
              window.mostrarAlerta(titular.strings.addedToCart, 'positivo', 5000, {
                label: titular.strings.viewCart,
                onClick: function () { if (titular.openDialog) titular.openDialog('CartDrawer'); }
              });
            }
            });
          });
        }
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

  /* ---------- Personalização na gaveta ----------
     Caixa marcada abre Número e Nome; ao sair de um campo, salva as
     propriedades do item (/cart/change com properties). Desmarcar limpa. */

  function saveCustom(line, properties) {
    busy(true);
    post(routes.cartChange || '/cart/change', {
      id: line.getAttribute('data-line-key'),
      quantity: parseInt(line.getAttribute('data-quantity'), 10) || 1,
      properties: properties
    })
      .then(render)
      .catch(fail)
      .finally(function () { busy(false); });
  }

  document.addEventListener('change', function (event) {
    var toggle = event.target.closest('[data-cart-custom-toggle]');
    var field = event.target.closest('[data-cart-prop]');
    if (!toggle && !field) return;
    var wrapper = event.target.closest('[data-cart-custom]');
    var line = event.target.closest('[data-line-key]');
    var fields = wrapper.querySelector('.drawer-item__custom-fields');

    if (toggle) {
      var customId = wrapper.getAttribute('data-variant-custom');
      var noneId = wrapper.getAttribute('data-variant-none');
      if (customId && noneId) {
        // Variante com e sem personalização: o preço do item muda.
        if (toggle.checked) swapVariant(line, customId);
        else swapVariant(line, noneId, {});
        return;
      }
      // Sem variante de personalização: só abre os campos / limpa as propriedades.
      if (toggle.checked) {
        fields.hidden = false;
        var first = fields.querySelector('input');
        if (first) first.focus();
      } else {
        fields.hidden = true;
        saveCustom(line, {});
      }
      return;
    }

    var properties = {};
    var filled = false;
    wrapper.querySelectorAll('[data-cart-prop]').forEach(function (input) {
      var value = input.value.trim();
      if (input.inputMode === 'numeric') value = value.replace(/\D/g, '').slice(0, 2);
      if (value) { properties[input.getAttribute('data-cart-prop')] = value; filled = true; }
    });
    if (filled) properties._personalizada = 'sim';
    saveCustom(line, filled ? properties : {});
  });

  /* ---------- Troca de variante (tamanho ou personalização) ----------
     O Shopify não troca a variante de uma linha: remove a linha e adiciona
     a nova variante com a mesma quantidade. properties: undefined mantém as
     propriedades atuais; {} limpa. */

  function swapVariant(line, variantId, properties) {
    var key = line.getAttribute('data-line-key');
    var quantity = parseInt(line.getAttribute('data-quantity'), 10) || 1;
    busy(true);
    return fetch((routes.cart || '/cart') + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var item = cart.items.find(function (i) { return i.key === key; });
        var props = properties !== undefined ? properties : (item && item.properties) || {};
        return post(routes.cartChange || '/cart/change', { id: key, quantity: 0 }).then(function () {
          return post(routes.cartAdd || '/cart/add', {
            items: [{ id: parseInt(variantId, 10), quantity: quantity, properties: props }]
          });
        });
      })
      .then(function () {
        // /cart/add com items não devolve a gaveta: pede o HTML de novo.
        return post(routes.cartUpdate || '/cart/update', {});
      })
      .then(render)
      .catch(fail)
      .finally(function () { busy(false); });
  }

  document.addEventListener('change', function (event) {
    var select = event.target.closest('[data-cart-variant]');
    if (!select) return;
    swapVariant(select.closest('[data-line-key]'), select.value);
  });

  document.addEventListener('DOMContentLoaded', refreshCount);
})();
