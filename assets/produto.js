/*
  ============================================================
  produto.js — interatividade da página de produto
  ============================================================

  Usa as marcações de sections/main-product.liquid:
  - [data-variant-json]       variantes (id, options, available, price_html)
  - .product__option          fieldsets com radios de cada opção (tamanho)
  - .product-variant-id       input hidden com a variante do form
  - .product__add-to-cart     botão comprar
  - [data-product-price]      bloco de preço + Pix + parcelas
  - [data-gallery]            lista de mídias (carrossel no mobile)
  - [data-personalization]    personalização (nome e número)
  - [data-shipping-estimate]  prazo por CEP

  Cada parte é independente: se o block não estiver na página, o
  trecho correspondente não faz nada.
*/
(function () {
  'use strict';

  var strings = (window.titular && window.titular.strings) || {};

  document.querySelectorAll('[data-product-section]').forEach(function (section) {
    initVariants(section);
    initGallery(section);
    initPersonalization(section);
    initShipping(section);
  });

  /* ---------- Variantes ---------- */

  function initVariants(section) {
    var jsonEl = section.querySelector('[data-variant-json]');
    var form = section.querySelector('form[data-type="add-to-cart-form"]');
    if (!jsonEl || !form) return;

    var variants;
    try { variants = JSON.parse(jsonEl.textContent); } catch (e) { return; }

    var idInput = form.querySelector('.product-variant-id');
    var button = form.querySelector('.product__add-to-cart');
    var label = button ? button.querySelector('span') : null;
    var price = section.querySelector('[data-product-price]');
    var gallery = section.querySelector('[data-gallery]');

    function selected() {
      return Array.prototype.map.call(section.querySelectorAll('.product__option'), function (fieldset) {
        var checked = fieldset.querySelector('input[type="radio"]:checked');
        return checked ? checked.value : null;
      });
    }

    function update() {
      var options = selected();
      var variant = variants.find(function (v) {
        return v.options.every(function (o, i) { return o === options[i]; });
      });

      if (!variant) {
        setButton(true, strings.unavailable);
        return;
      }

      idInput.value = variant.id;
      setButton(!variant.available, variant.available ? strings.addToCart : strings.soldOut);

      if (price && variant.price_html) price.innerHTML = variant.price_html;

      if (gallery && variant.featured_media_id) {
        var media = gallery.querySelector('[data-media-id="' + variant.featured_media_id + '"]');
        if (media) gallery.scrollTo({ left: media.offsetLeft, behavior: 'smooth' });
      }

      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState({}, '', url.toString());
    }

    function setButton(disabled, text) {
      if (!button) return;
      button.disabled = disabled;
      if (label && text) label.textContent = text;
    }

    section.addEventListener('change', function (event) {
      if (event.target.closest('.product__option')) update();
    });
  }

  /* ---------- Galeria: contador "1 / N" no carrossel mobile ---------- */

  function initGallery(section) {
    var gallery = section.querySelector('[data-gallery]');
    var counter = section.querySelector('[data-gallery-counter]');
    if (!gallery || !counter) return;
    var total = gallery.children.length;
    var ticking = false;
    gallery.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var index = Math.round(gallery.scrollLeft / gallery.clientWidth) + 1;
        counter.textContent = Math.min(index, total) + ' / ' + total;
        ticking = false;
      });
    });
  }

  /* ---------- Personalização ---------- */

  function initPersonalization(section) {
    var wrapper = section.querySelector('[data-personalization]');
    if (!wrapper) return;
    var toggle = wrapper.querySelector('[data-personalization-toggle]');
    var fields = wrapper.querySelector('[data-personalization-fields]');
    toggle.addEventListener('change', function () {
      // fieldset desabilitado = propriedades não vão para o carrinho.
      fields.disabled = !toggle.checked;
      fields.hidden = !toggle.checked;
      section.dispatchEvent(new CustomEvent('titular:personalization', { detail: { on: toggle.checked } }));
    });
  }

  /* ---------- Prazo por CEP ---------- */

  // Região pelo primeiro dígito do CEP (faixas dos Correios).
  var REGION_BY_DIGIT = {
    0: 'sudeste', 1: 'sudeste', 2: 'sudeste', 3: 'sudeste',
    4: 'nordeste', 5: 'nordeste', 6: 'norte',
    7: 'centro-oeste', 8: 'sul', 9: 'sul'
  };

  function initShipping(section) {
    var box = section.querySelector('[data-shipping-estimate]');
    if (!box) return;
    var input = box.querySelector('[data-cep-input]');
    var submit = box.querySelector('[data-cep-submit]');
    var result = box.querySelector('[data-cep-result]');
    var handling = parseInt(box.getAttribute('data-handling-days'), 10) || 0;
    var regions = {};
    try { regions = JSON.parse(box.getAttribute('data-regions')); } catch (e) {}

    var personalization = section.querySelector('[data-personalization]');
    var extraDays = 0;
    section.addEventListener('titular:personalization', function (event) {
      extraDays = event.detail.on ? parseInt(personalization.getAttribute('data-extra-days'), 10) || 0 : 0;
      if (result.textContent) estimate();
    });

    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '').slice(0, 8);
      input.value = digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); estimate(); }
    });
    submit.addEventListener('click', estimate);

    function estimate() {
      var digits = input.value.replace(/\D/g, '');
      var range = digits.length === 8 ? regions[REGION_BY_DIGIT[digits.charAt(0)]] : null;
      if (!range) {
        input.setAttribute('aria-invalid', 'true');
        result.textContent = box.getAttribute('data-text-invalid');
        return;
      }
      input.removeAttribute('aria-invalid');
      var add = handling + extraDays;
      result.textContent = box.getAttribute('data-text-result')
        .replace('__MIN__', range[0] + add)
        .replace('__MAX__', range[1] + add);
    }
  }
})();
