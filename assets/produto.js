/*
  ============================================================
  produto.js — interatividade da página de produto
  ============================================================

  Marcações de sections/main-product.liquid:
  - [data-variant-json]       variantes (id, options, available, price_html)
  - .product__option          fieldsets com os radios de cada opção
  - [data-gallery]            fotos (carrossel no celular; .is-active no desktop)
  - [data-thumb]              miniaturas (desktop)
  - [data-gallery-prev/next]  setas da foto principal
  - [data-lightbox-open="i"]  abre a galeria em tela cheia na foto i
  - [data-lightbox]           <dialog> da galeria em tela cheia
  - [data-personalization]    caixa de seleção + campos Número/Nome
  - [data-shipping-estimate]  prazo por CEP

  Cada parte é independente: sem a marcação, o trecho não faz nada.
*/
(function () {
  'use strict';

  var strings = (window.titular && window.titular.strings) || {};

  document.querySelectorAll('[data-product-section]').forEach(function (section) {
    var gallery = initGallery(section);
    initVariants(section, gallery);
    initLightbox(section);
    initPersonalization(section);
    initShipping(section);
  });

  /* ---------- Galeria ---------- */

  function initGallery(section) {
    var list = section.querySelector('[data-gallery]');
    if (!list) return null;
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-media-id]'));
    var thumbs = section.querySelectorAll('[data-thumb]');
    var counter = section.querySelector('[data-gallery-counter]');
    var current = Math.max(0, items.findIndex(function (el) { return el.classList.contains('is-active'); }));

    function isCarousel() { return list.scrollWidth > list.clientWidth + 1; }

    function show(index, scroll) {
      if (!items.length) return;
      current = (index + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      thumbs.forEach(function (thumb) {
        if (thumb.getAttribute('data-thumb') === items[current].getAttribute('data-media-id')) thumb.setAttribute('aria-current', 'true');
        else thumb.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = (current + 1) + ' / ' + items.length;
      if (scroll !== false && isCarousel()) list.scrollTo({ left: items[current].offsetLeft, behavior: 'smooth' });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var id = thumb.getAttribute('data-thumb');
        show(items.findIndex(function (el) { return el.getAttribute('data-media-id') === id; }));
      });
    });

    var prev = section.querySelector('[data-gallery-prev]');
    var next = section.querySelector('[data-gallery-next]');
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });

    // Celular: o contador acompanha o arrasto do carrossel.
    var ticking = false;
    list.addEventListener('scroll', function () {
      if (ticking || !isCarousel()) return;
      ticking = true;
      requestAnimationFrame(function () {
        show(Math.round(list.scrollLeft / list.clientWidth), false);
        ticking = false;
      });
    });

    return {
      showMedia: function (mediaId) {
        var index = items.findIndex(function (el) { return el.getAttribute('data-media-id') === String(mediaId); });
        if (index > -1) show(index);
      }
    };
  }

  /* ---------- Galeria em tela cheia ---------- */

  function initLightbox(section) {
    var dialog = section.querySelector('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var track = dialog.querySelector('[data-lightbox-track]');
    var slides = dialog.querySelectorAll('[data-lightbox-slide]');
    var counter = dialog.querySelector('[data-lightbox-counter]');
    var opener = null;

    function index() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i, smooth) {
      var target = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: target * track.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
      update(target);
    }
    function update(i) { if (counter) counter.textContent = (i + 1) + ' / ' + slides.length; }

    section.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-lightbox-open]');
      if (!trigger) return;
      opener = trigger;
      dialog.showModal();
      go(parseInt(trigger.getAttribute('data-lightbox-open'), 10) || 0, false);
    });

    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', function () { go(index() - 1, true); });
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', function () { go(index() + 1, true); });
    track.addEventListener('scroll', function () { update(index()); });

    // Clique fora da foto (no fundo do slide) fecha.
    dialog.addEventListener('click', function (event) {
      if (event.target.matches('[data-lightbox-slide], [data-lightbox-track], [data-lightbox]')) dialog.close();
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(index() - 1, true); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index() + 1, true); }
    });

    dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- Variantes ---------- */

  function initVariants(section, gallery) {
    var jsonEl = section.querySelector('[data-variant-json]');
    var form = section.querySelector('form[data-type="add-to-cart-form"]');
    if (!jsonEl || !form) return;

    var variants;
    try { variants = JSON.parse(jsonEl.textContent); } catch (e) { return; }

    var idInput = form.querySelector('.product-variant-id');
    var buttons = form.querySelectorAll('.product__add-to-cart, .product__buy-now');
    var label = form.querySelector('.product__add-to-cart span');
    var price = section.querySelector('[data-product-price]');

    function selected() {
      return Array.prototype.map.call(section.querySelectorAll('.product__option'), function (fieldset) {
        var checked = fieldset.querySelector('input[type="radio"]:checked');
        return checked ? checked.value : null;
      });
    }

    function setButtons(disabled, text) {
      buttons.forEach(function (b) { b.disabled = disabled; });
      if (label && text) label.textContent = text;
    }

    section.addEventListener('change', function (event) {
      if (!event.target.closest('.product__option')) return;
      var options = selected();
      var variant = variants.find(function (v) {
        return v.options.every(function (o, i) { return o === options[i]; });
      });
      if (!variant) { setButtons(true, strings.unavailable); return; }

      idInput.value = variant.id;
      setButtons(!variant.available, variant.available ? strings.addToCart : strings.soldOut);
      if (price && variant.price_html) price.innerHTML = variant.price_html;
      if (gallery && variant.featured_media_id) gallery.showMedia(variant.featured_media_id);

      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState({}, '', url.toString());
    });
  }

  /* ---------- Personalização: campos só com a caixa marcada ---------- */

  function initPersonalization(section) {
    var wrapper = section.querySelector('[data-personalization]');
    if (!wrapper) return;
    var toggle = wrapper.querySelector('[data-personalization-toggle]');
    var fields = wrapper.querySelector('[data-personalization-fields]');
    var number = wrapper.querySelector('[data-personalization-number]');

    toggle.addEventListener('change', function () {
      var on = toggle.checked;
      // fieldset desabilitado = Número, Nome e _personalizada não vão para o carrinho.
      fields.disabled = !on;
      fields.hidden = !on;
      toggle.setAttribute('aria-expanded', String(on));
      if (on && number) number.focus();

      // Opção de personalização com 2 valores: marca o valor certo e dispara
      // a troca de variante (preço, botões e ?variant= se atualizam).
      var option = section.querySelector('[data-custom-option]');
      if (option) {
        var value = option.getAttribute(on ? 'data-custom-value' : 'data-none-value');
        var radio = Array.prototype.find.call(option.querySelectorAll('input[type="radio"]'), function (r) { return r.value === value; });
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      section.dispatchEvent(new CustomEvent('titular:personalization', { detail: { on: on } }));
    });

    if (number) number.addEventListener('input', function () { number.value = number.value.replace(/\D/g, '').slice(0, 2); });
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
