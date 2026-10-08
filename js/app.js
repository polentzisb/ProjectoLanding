'use strict';

(() => {
  const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  // HTML is the single source of product data and remains usable without JS.
  const catalog = Object.create(null);
  document.querySelectorAll('.product-card').forEach(card => {
    catalog[card.dataset.product] = {
      name: card.querySelector('h3').textContent,
      price: Number(card.dataset.price),
      image: card.dataset.image,
    };
    card.querySelector('.price').textContent = money.format(catalog[card.dataset.product].price);
  });
  const storageKey = 'cofferoast-selection-v1';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const dialog = document.querySelector('#cart-dialog');
  const cartOpen = document.querySelector('#cart-open');
  const cartItems = document.querySelector('#cart-items');
  const storageNote = document.querySelector('#storage-note');
  const toast = document.querySelector('#toast');
  let toastTimer;
  let cart = Object.create(null);
  let lastFocus;

  function readCart(raw) {
    const clean = Object.create(null);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
    for (const id of Object.keys(catalog)) {
      if (Object.hasOwn(raw, id) && Number.isInteger(raw[id]) && raw[id] > 0) {
        clean[id] = Math.min(raw[id], 99);
      }
    }
    return clean;
  }

  try {
    cart = readCart(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    storageNote.textContent = 'Tu selección está disponible durante esta visita.';
  }

  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
      storageNote.textContent = 'Tu selección se guarda en este navegador.';
    } catch {
      storageNote.textContent = 'Tu selección está disponible durante esta visita.';
    }
  }

  function makeButton(text, label, id, action, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.dataset.id = id;
    button.dataset.action = action;
    button.className = className;
    return button;
  }

  function renderCart() {
    const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelector('#cart-count').textContent = count;
    cartOpen.setAttribute('aria-label', `Abrir lista de compra, ${count} ${count === 1 ? 'producto' : 'productos'}`);
    const rows = [];
    let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
      const product = catalog[id];
      total += product.price * quantity;
      const row = document.createElement('article');
      row.className = 'cart-row';
      const image = document.createElement('img');
      image.src = `assets/images/${product.image}-400.webp`;
      image.alt = '';
      image.width = 58;
      image.height = 72;
      const content = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = product.name;
      const price = document.createElement('p');
      price.className = 'cart-row-price';
      price.textContent = `${money.format(product.price)} por unidad`;
      const controls = document.createElement('div');
      controls.className = 'quantity-controls';
      const amount = document.createElement('span');
      amount.textContent = quantity;
      amount.setAttribute('aria-label', `Cantidad: ${quantity}`);
      const increase = makeButton('+', `Añadir una unidad de ${product.name}`, id, 'increase');
      increase.disabled = quantity >= 99;
      controls.append(makeButton('−', `Quitar una unidad de ${product.name}`, id, 'decrease'), amount, increase, makeButton('Eliminar', `Eliminar ${product.name} de la lista`, id, 'remove', 'remove-item'));
      content.append(heading, price, controls);
      row.append(image, content);
      rows.push(row);
    }
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'Tu próxima taza te está esperando.';
      rows.push(empty);
    }
    cartItems.replaceChildren(...rows);
    document.querySelector('#cart-total').textContent = money.format(total);
  }

  function closeMenu(returnFocus = false) {
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú');
    if (returnFocus) menu.focus();
  }

  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && menu.getAttribute('aria-expanded') === 'true') closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  // A closed mobile menu must not remain expanded when returning from desktop.
  matchMedia('(max-width: 720px)').addEventListener('change', () => closeMenu());

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let count = 0;
      document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll('.product-card').forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
        if (!card.hidden) count++;
      });
      document.querySelector('#filter-status').textContent = `${count} productos en ${button.textContent.trim()}.`;
    });
  });

  document.querySelectorAll('[data-add]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.add;
      if ((cart[id] || 0) >= 99) {
        notify('Puedes añadir hasta 99 unidades por producto.');
        return;
      }
      cart[id] = (cart[id] || 0) + 1;
      persist();
      renderCart();
      notify(`${catalog[id].name} añadido a tu lista.`);
    });
  });

  cartItems.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { id, action } = button.dataset;
    if (!Object.hasOwn(cart, id)) return;
    const previousIds = Object.keys(cart);
    const position = previousIds.indexOf(id);
    if (action === 'remove' || (action === 'decrease' && cart[id] === 1)) delete cart[id];
    else if (action === 'increase') cart[id] = Math.min(cart[id] + 1, 99);
    else if (action === 'decrease') cart[id]--;
    persist();
    renderCart();
    // Replacing rows should not lose keyboard focus inside the modal.
    const nextId = Object.hasOwn(cart, id) ? id : Object.keys(cart)[Math.min(position, Object.keys(cart).length - 1)];
    const next = [...cartItems.querySelectorAll('button')].find(item => item.dataset.id === nextId && item.dataset.action === action && !item.disabled)
      || [...cartItems.querySelectorAll('button')].find(item => item.dataset.id === nextId && !item.disabled)
      || document.querySelector('#cart-continue');
    next.focus();
    document.querySelector('#cart-status').textContent = `Lista actualizada. ${document.querySelector('#cart-total').textContent} en total.`;
    notify('Lista actualizada.');
  });

  cartOpen.addEventListener('click', () => {
    lastFocus = document.activeElement;
    closeMenu();
    renderCart();
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
  document.querySelector('#cart-close').addEventListener('click', () => dialog.close());
  document.querySelector('#cart-continue').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    try { cart = readCart(JSON.parse(event.newValue)); } catch { cart = Object.create(null); }
    renderCart();
  });

  const form = document.querySelector('#newsletter-form');
  const email = document.querySelector('#email');
  email.disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    email.value = email.value.trim();
    if (!form.reportValidity()) return;
    document.querySelector('#newsletter-status').textContent = 'El formato de tu correo es válido. Esta demo todavía no registra suscripciones.';
  });
  email.addEventListener('input', () => { document.querySelector('#newsletter-status').textContent = ''; });
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderCart();
  document.body.classList.add('js-ready');
  document.querySelectorAll('[data-add], .filters, .menu-toggle, #newsletter-form button').forEach(item => { item.hidden = false; });
  if (typeof dialog.showModal === 'function') cartOpen.hidden = false;
})();
