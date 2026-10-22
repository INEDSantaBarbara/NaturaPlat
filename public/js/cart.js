/**
 * Carrito y checkout de demostración.
 *
 * Persiste en localStorage bajo `naturaplat.cart`. No hay backend: el pedido
 * queda en el navegador y la interfaz lo declara en todo momento.
 */

const PRODUCTS = {
  2: {
    id: 2,
    name: 'NaturaPlát 14 × 20',
    img: 'img/producto/plato-14x20-3-800.webp',
    variants: {
      pack25: { label: 'Pack × 25', price: 149 },
      pack100: { label: 'Pack × 100', price: 480 },
    },
  },
};

const STORAGE_KEY = 'naturaplat.cart';
const $ = (id) => document.getElementById(id);
const money = (value) => `Q${value.toLocaleString('es-GT')}`;

export function initCart() {
  if (!$('cartDrawer')) return;

  let cart = load();
  let lastFocus = null;
  let toastTimer = null;

  const countEl = $('cartCount');
  const itemsEl = $('cartItems');
  const footEl = $('cartFoot');
  const emptyEl = $('cartEmpty');
  const subtotalEl = $('cartSubtotal');
  const drawer = $('cartDrawer');
  const overlay = $('overlay');
  const modal = $('checkoutModal');
  const panelForm = $('checkoutPanel');
  const panelOk = $('confirmationPanel');
  const checkoutItems = $('checkoutItems');
  const checkoutTotal = $('checkoutTotal');
  const confirmMessage = $('confirmMessage');
  const form = $('checkoutForm');
  const checkoutError = $('checkoutError');
  const toastEl = $('toast');

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* almacenamiento no disponible */
    }
  }

  function normalize() {
    const next = {};
    for (const key of Object.keys(cart)) {
      const item = cart[key];
      const product = PRODUCTS[item.product];
      if (!product || !product.variants[item.variant]) continue;
      if (!item.qty || item.qty < 1) continue;
      next[key] = { product: item.product, variant: item.variant, qty: Math.min(item.qty, 99) };
    }
    cart = next;
  }

  function total() {
    return Object.keys(cart).reduce((sum, key) => {
      const item = cart[key];
      return sum + PRODUCTS[item.product].variants[item.variant].price * item.qty;
    }, 0);
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function quantityControl(key, item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'qty';

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Reducir cantidad');
    minus.textContent = '−';
    minus.addEventListener('click', () => {
      cart[key].qty -= 1;
      save();
      render();
    });

    const value = document.createElement('span');
    value.className = 'n';
    value.textContent = String(item.qty);

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Aumentar cantidad');
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      cart[key].qty += 1;
      save();
      render();
    });

    wrapper.append(minus, value, plus);
    return wrapper;
  }

  function render() {
    normalize();
    const keys = Object.keys(cart);
    const count = keys.reduce((sum, key) => sum + cart[key].qty, 0);

    countEl.textContent = String(count);
    countEl.hidden = count === 0;
    emptyEl.hidden = keys.length > 0;
    footEl.hidden = keys.length === 0;

    itemsEl.replaceChildren();
    for (const key of keys) {
      const item = cart[key];
      const product = PRODUCTS[item.product];
      const variant = product.variants[item.variant];

      const row = document.createElement('li');
      row.className = 'cart-item';

      const image = document.createElement('img');
      image.src = product.img;
      image.alt = '';
      image.width = 56;
      image.height = 56;

      const info = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = product.name;
      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = `${variant.label} · ${money(variant.price)} c/u`;
      info.append(title, meta, quantityControl(key, item));

      const price = document.createElement('span');
      price.className = 'precio';
      price.textContent = money(variant.price * item.qty);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove';
      remove.textContent = 'Quitar';
      remove.addEventListener('click', () => {
        delete cart[key];
        save();
        render();
      });

      row.append(image, info, price, remove);
      itemsEl.appendChild(row);
    }

    subtotalEl.textContent = money(total());
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('open'));
    $('cartClose').focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.hidden = true;
    window.setTimeout(() => {
      drawer.hidden = true;
      if (!document.getElementById('checkoutModal').hidden) return;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }, 280);
  }

  function openCheckout() {
    closeDrawer();
    checkoutItems.replaceChildren();
    for (const key of Object.keys(cart)) {
      const item = cart[key];
      const product = PRODUCTS[item.product];
      const variant = product.variants[item.variant];
      const line = document.createElement('li');
      const description = document.createElement('span');
      description.textContent = `${product.name} · ${variant.label} × ${item.qty}`;
      const amount = document.createElement('strong');
      amount.textContent = money(variant.price * item.qty);
      line.append(description, amount);
      checkoutItems.appendChild(line);
    }
    checkoutTotal.textContent = money(total());
    panelOk.hidden = true;
    panelForm.hidden = false;
    checkoutError.hidden = true;
    modal.hidden = false;
    $('checkoutClose').focus();
  }

  function closeCheckout() {
    modal.hidden = true;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function validate() {
    let valid = true;
    const fields = form.querySelectorAll('[required]');
    for (const input of fields) {
      const value = input.value.trim();
      let invalid = !value;
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        invalid = true;
      input.classList.toggle('error', invalid);
      input.setAttribute('aria-invalid', String(invalid));
      if (invalid) {
        input.setAttribute('aria-describedby', 'checkoutError');
        valid = false;
      } else {
        input.removeAttribute('aria-describedby');
      }
    }
    checkoutError.hidden = valid;
    checkoutError.textContent = valid ? '' : 'Revisa los campos marcados.';
    return valid;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) {
      toast('Revisa los campos marcados');
      return;
    }

    const method = form.querySelector('input[name="metodo"]:checked').value;
    const number = `EP-${String(Date.now()).slice(-6)}`;
    const items = Object.keys(cart)
      .map((key) => {
        const item = cart[key];
        return `${item.qty} × ${PRODUCTS[item.product].name}`;
      })
      .join(', ');

    confirmMessage.textContent =
      `Gracias, ${form.nombre.value.trim()}. Tu pedido (${items}) quedó registrado con el número ` +
      `${number}. El envío se coordina con ${method}. Esta es una demostración: no se procesa ` +
      'ningún pago ni se envía correo real.';

    panelForm.hidden = true;
    panelOk.hidden = false;
    $('confirmDone').focus();
  });

  $('confirmDone').addEventListener('click', () => {
    cart = {};
    save();
    render();
    closeCheckout();
    toast('Pedido de demostración confirmado. Vuelve pronto a NaturaPlát');
  });

  for (const card of document.querySelectorAll('.product-card')) {
    const variants = card.querySelectorAll('.variant');
    for (const button of variants) {
      button.addEventListener('click', () => {
        variants.forEach((item) =>
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false')
        );
      });
    }

    const add = card.querySelector('.add');
    add?.addEventListener('click', () => {
      const product = PRODUCTS[card.dataset.product];
      const variant = card.querySelector('.variant[aria-pressed="true"]').dataset.variant;
      const key = `${product.id}:${variant}`;
      cart[key] = cart[key] || { product: product.id, variant, qty: 0 };
      cart[key].qty += 1;
      save();
      render();
      toast(`${product.name} · ${product.variants[variant].label} agregado al carrito`);
      openDrawer();
    });
  }

  $('cartOpen').addEventListener('click', openDrawer);
  $('cartClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  $('cartCheckout').addEventListener('click', openCheckout);
  $('checkoutClose').addEventListener('click', closeCheckout);
  $('openCartFromSlide')?.addEventListener('click', openDrawer);

  function trapFocus(container, event) {
    const items = Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!modal.hidden) {
        closeCheckout();
        return;
      }
      if (!drawer.hidden && drawer.classList.contains('open')) closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    if (!modal.hidden) trapFocus(modal, event);
    else if (!drawer.hidden && drawer.classList.contains('open')) trapFocus(drawer, event);
  });

  for (const image of document.querySelectorAll('img[data-fallback]')) {
    image.addEventListener('error', function onError() {
      image.removeEventListener('error', onError);
      image.src = image.getAttribute('data-fallback');
    });
  }

  render();
}
