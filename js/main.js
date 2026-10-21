(function () {
  'use strict';

  var PRODUCTS = {
    1: {
      id: 1,
      name: 'NaturaPlát 22',
      img: 'img/eco-plato-22.svg',
      variants: {
        pack25: { label: 'Pack × 25', price: 119 },
        pack100: { label: 'Pack × 100', price: 390 }
      }
    },
    2: {
      id: 2,
      name: 'NaturaPlát Bandeja 25',
      img: 'img/bandeja-25.svg',
      variants: {
        pack25: { label: 'Pack × 25', price: 149 },
        pack100: { label: 'Pack × 100', price: 480 }
      }
    }
  };

  var STORAGE_KEY = 'ecoplatos_cart';
  var cart = load();
  var lastFocus = null;

  // ---------- Selección de variante por tarjeta ----------
  document.querySelectorAll('.producto').forEach(function (card) {
    var buttons = card.querySelectorAll('.variante');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  });

  // ---------- Añadir al carrito ----------
  document.querySelectorAll('.add').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.producto');
      var product = PRODUCTS[card.dataset.product];
      var variant = card.querySelector('.variante[aria-pressed="true"]').dataset.variant;
      var key = product.id + ':' + variant;
      cart[key] = cart[key] || { product: product.id, variant: variant, qty: 0 };
      cart[key].qty += 1;
      save();
      render();
      toast(product.name + ' · ' + product.variants[variant].label + ' agregado al carrito');
      openDrawer();
    });
  });

  // ---------- Persistencia ----------
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* sin almacenamiento disponible */ }
  }

  function normalize() {
    var next = {};
    Object.keys(cart).forEach(function (key) {
      var item = cart[key];
      var p = PRODUCTS[item.product];
      if (!p) return;
      if (!p.variants[item.variant]) return;
      if (!item.qty || item.qty < 1) return;
      next[key] = { product: item.product, variant: item.variant, qty: Math.min(item.qty, 99) };
    });
    cart = next;
  }

  var money = function (n) { return 'Q' + n.toLocaleString('es-GT'); };

  // ---------- Render general ----------
  var countEl = document.getElementById('cartCount');
  var itemsEl = document.getElementById('cartItems');
  var footEl = document.getElementById('cartFoot');
  var emptyEl = document.getElementById('cartEmpty');
  var subtotalEl = document.getElementById('cartSubtotal');

  function total() {
    return Object.keys(cart).reduce(function (sum, k) {
      var it = cart[k];
      return sum + PRODUCTS[it.product].variants[it.variant].price * it.qty;
    }, 0);
  }

  function render() {
    normalize();
    var keys = Object.keys(cart);
    var count = keys.reduce(function (n, k) { return n + cart[k].qty; }, 0);

    countEl.textContent = String(count);
    countEl.hidden = count === 0;

    emptyEl.hidden = keys.length > 0;
    footEl.hidden = keys.length === 0;

    itemsEl.innerHTML = '';
    keys.forEach(function (key) {
      var it = cart[key];
      var p = PRODUCTS[it.product];
      var v = p.variants[it.variant];
      var li = document.createElement('li');
      li.className = 'cart-item';

      var img = document.createElement('img');
      img.src = p.img;
      img.alt = '';
      img.width = 56;
      img.height = 56;

      var info = document.createElement('div');
      var h = document.createElement('h3');
      h.textContent = p.name;
      var meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = v.label + ' · ' + money(v.price) + ' c/u';
      info.appendChild(h);
      info.appendChild(meta);

      var precio = document.createElement('span');
      precio.className = 'precio';
      precio.textContent = money(v.price * it.qty);

      var x = document.createElement('div');
      x.className = 'x';
      x.textContent = '×' + it.qty;
      x.setAttribute('aria-hidden', 'true');

      var remove = document.createElement('button');
      remove.className = 'remove';
      remove.type = 'button';
      remove.textContent = 'Quitar';
      remove.addEventListener('click', function () {
        delete cart[key];
        save();
        render();
      });

      var qty = document.createElement('div');
      qty.className = 'qty';
      var minus = document.createElement('button');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Reducir cantidad');
      minus.textContent = '−';
      minus.addEventListener('click', function () {
        cart[key].qty -= 1;
        save();
        render();
      });
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = String(it.qty);
      var plus = document.createElement('button');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Aumentar cantidad');
      plus.textContent = '+';
      plus.addEventListener('click', function () {
        cart[key].qty += 1;
        save();
        render();
      });
      qty.appendChild(minus);
      qty.appendChild(n);
      qty.appendChild(plus);
      info.appendChild(qty);

      li.appendChild(img);
      li.appendChild(info);
      li.appendChild(precio);
      li.appendChild(x);
      li.appendChild(remove);

      itemsEl.appendChild(li);
    });

    subtotalEl.textContent = money(total());
  }

  // ---------- Drawer ----------
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('overlay');

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    overlay.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    document.getElementById('cartClose').focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.hidden = true;
    document.body.style.overflow = '';
    setTimeout(function () {
      drawer.hidden = true;
      if (lastFocus) lastFocus.focus();
    }, 280);
  }

  document.getElementById('cartOpen').addEventListener('click', openDrawer);
  document.getElementById('cartClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // ---------- Checkout ----------
  var modal = document.getElementById('checkoutModal');
  var panelForm = document.getElementById('checkoutPanel');
  var panelOk = document.getElementById('confirmationPanel');
  var checkoutItems = document.getElementById('checkoutItems');
  var checkoutTotal = document.getElementById('checkoutTotal');
  var confirmMessage = document.getElementById('confirmMessage');
  var form = document.getElementById('checkoutForm');

  function abrirCheckout() {
    closeDrawer();
    checkoutItems.innerHTML = '';
    Object.keys(cart).forEach(function (key) {
      var it = cart[key];
      var p = PRODUCTS[it.product];
      var v = p.variants[it.variant];
      var li = document.createElement('li');
      var l = document.createElement('span');
      l.textContent = p.name + ' · ' + v.label + ' × ' + it.qty;
      var r = document.createElement('strong');
      r.textContent = money(v.price * it.qty);
      li.appendChild(l);
      li.appendChild(r);
      checkoutItems.appendChild(li);
    });
    checkoutTotal.textContent = money(total());

    panelOk.hidden = true;
    panelForm.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('checkoutClose').focus();
  }

  function cerrarCheckout() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.getElementById('cartCheckout').addEventListener('click', abrirCheckout);
  document.getElementById('checkoutClose').addEventListener('click', cerrarCheckout);

  function validar() {
    var ok = true;
    var inputs = form.querySelectorAll('[required]');
    inputs.forEach(function (input) {
      var val = input.value.trim();
      var bad = !val;
      if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) bad = true;
      input.classList.toggle('error', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validar()) {
      toast('Revisa los campos marcados');
      return;
    }

    var metodo = form.querySelector('input[name="metodo"]:checked').value;
    var numero = 'EP-' + String(Date.now()).slice(-6);
    var items = Object.keys(cart).map(function (k) {
      var it = cart[k];
      return it.qty + ' × ' + PRODUCTS[it.product].name;
    }).join(', ');

    confirmMessage.textContent =
      'Gracias, ' + form.nombre.value.trim() + '. Tu pedido (' + items + ') quedó registrado ' +
      'con el número ' + numero + '. El envío se coordina con ' + metodo + '. ' +
      'Espera nuestro correo con los detalles.';

    panelForm.hidden = true;
    panelOk.hidden = false;
    document.getElementById('confirmDone').focus();
  });

  document.getElementById('confirmDone').addEventListener('click', function () {
    cart = {};
    save();
    render();
    cerrarCheckout();
    toast('Pedido confirmado. Vuelve pronto a NaturaPlát');
  });

  // ---------- Toast ----------
  var toastEl = document.getElementById('toast');
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 2400);
  }

  // ---------- FAQ acordeón ----------
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  // ---------- Menú móvil ----------
  var menuToggle = document.getElementById('menuToggle');
  var siteNav = document.getElementById('siteNav');

  menuToggle.addEventListener('click', function () {
    var open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  siteNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && siteNav.classList.contains('open')) {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------- Formulario de contacto ----------
  var contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    contactForm.querySelectorAll('[required]').forEach(function (input) {
      if (!input.value.trim()) { input.classList.add('error'); bad = true; }
      else { input.classList.remove('error'); }
    });
    if (bad) { toast('Completa todos los campos del mensaje'); return; }
    contactForm.reset();
    toast('Mensaje enviado. Te respondemos en el mismo día');
  });

  // ---------- Cierre por teclado ----------
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal && !modal.hidden) { cerrarCheckout(); return; }
    if (drawer && !drawer.hidden && drawer.classList.contains('open')) closeDrawer();
  });

  // ---------- Header con sombra al hacer scroll ----------
  var header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  });

  // Primer render
  render();
})();