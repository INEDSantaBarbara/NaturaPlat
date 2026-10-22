/**
 * Guía NaturaPlát: panel lateral con banco local primero y DeepSeek como
 * respaldo. La clave vive en el servidor; acá solo se llama a /api/chat.
 */

const GREETING =
  'Hola. Soy la guía de NaturaPlát. Respondo por el plato, el proceso, el impacto y el equipo. ¿Qué querés saber?';

const CHIPS = [
  '¿De qué está hecho?',
  '¿Cuánto mide?',
  '¿Cuánto tarda en compostarse?',
  '¿Cómo se calcula el impacto?',
];

const KB = [
  {
    test: /(cuanto (cuesta|vale|sale)|precio|pack|q149|q480)/,
    answer:
      'El plato viene en Pack × 25 por Q149 y Pack × 100 por Q480. Son precios de lanzamiento y el carrito es una demostración: no se procesa ningún pago.',
  },
  {
    test: /(cuanto mide|medidas|tamano|dimensiones|ancho|largo)/,
    answer:
      'Mide 14 cm de ancho por 20 cm de largo. Es un plato rectangular de hoja de plátano, prensado a mano.',
  },
  {
    test: /(compost|biodegrad|45|desintegra)/,
    answer:
      'En condiciones de compostaje se desintegra en aproximadamente 45 días. No es basura común: vuelve a la tierra.',
  },
  {
    test: /(seguro|alimento|microondas|caliente|grasa|toxico)/,
    answer:
      'El sitio declara hoja lavada y prensada, sin aditivos; no publica una certificación de contacto con alimentos. Para uso comercial, confirmalo con el equipo.',
  },
  {
    test: /(de que (esta )?hecho|material|hoja de platano|plastico|cera|pegamento)/,
    answer:
      'Está hecho con hoja de plátano lavada y prensada con calor. No lleva plásticos, ceras ni pegamentos.',
  },
  {
    test: /(proceso|como se hace|fabric|prensa|termoprensado|recolec|lavado)/,
    answer:
      'Se recolecta la hoja después de la cosecha, se lava y selecciona, se termoprensa con calor y presión, y se revisa y empaca. Sin pegamentos.',
  },
  {
    test: /(impacto|huella|co2|duroport|simulador|calcula)/,
    answer:
      'El capítulo Impacto compara el duroport (fabricación y quema) con NaturaPlát. Podés ajustar los supuestos en el paso 2; la tabla anual, la fórmula y las diez fuentes están al final. Son estimaciones educativas.',
  },
  {
    test: /(que es naturaplat|de que se trata|proyecto)/,
    answer:
      'NaturaPlát es un proyecto escolar del INED Santa Bárbara: un plato rectangular de hoja de plátano, de 14 por 20 cm, pensado para volver a la tierra en semanas.',
  },
  {
    test: /(equipo|quienes|quien lo hace|ined|santa barbara|suchitepequez|feria)/,
    answer:
      'Es el equipo de NaturaPlát del INED Santa Bárbara, Suchitepéquez, en la feria MILAB 2026. La misión y la visión están en el capítulo Equipo.',
  },
  {
    test: /(envio|enviar|distribu|mayor|pedido|comprar|donde compro|contacto|whatsapp|correo)/,
    answer:
      'El sitio es una demostración: el carrito no procesa pagos ni envíos. Para coordinar una muestra, escribí por WhatsApp al +502 7820 0000 o a hola@ecoplatos.com (datos de demostración).',
  },
  {
    test: /(quien eres|que eres|guia|ayuda|hola|buenas)/,
    answer:
      'Soy la guía de NaturaPlát. Respondo por el plato, el proceso, el impacto y el equipo. ¿Qué querés saber?',
  },
  {
    test: /(gracias|genial|perfecto)/,
    answer:
      'Con gusto. Si te queda otra duda, preguntá por las medidas, el material, el compostaje o el impacto.',
  },
];

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function initGuide() {
  const tab = document.getElementById('guideTab');
  if (!tab) return;

  const nudge = document.getElementById('guideNudge');
  const overlay = document.getElementById('guideOverlay');
  const drawer = document.getElementById('guideDrawer');
  const close = document.getElementById('guideClose');
  const messages = document.getElementById('guideMessages');
  const chips = document.getElementById('guideChips');
  const form = document.getElementById('guideForm');
  const input = document.getElementById('guideInput');
  const send = document.getElementById('guideSend');

  let opened = false;
  let loading = false;
  let typing = null;
  let nudgeTimer = null;
  const history = [];

  function addMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `guide-msg guide-msg--${role}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.appendChild(paragraph);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    history.push({ role: role === 'user' ? 'user' : 'assistant', content: text });
    while (history.length > 6) history.shift();
  }

  function addTyping() {
    const bubble = document.createElement('div');
    bubble.className = 'guide-msg guide-msg--bot guide-typing';
    bubble.setAttribute('aria-label', 'Escribiendo');
    for (let index = 0; index < 3; index += 1) bubble.appendChild(document.createElement('span'));
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function setLoading(value) {
    loading = value;
    send.disabled = value;
    messages.setAttribute('aria-busy', String(value));
  }

  function localAnswer(question) {
    const text = normalize(question);
    for (const item of KB) {
      if (item.test.test(text)) return item.answer;
    }
    return null;
  }

  function hideNudge() {
    if (nudgeTimer) {
      clearTimeout(nudgeTimer);
      nudgeTimer = null;
    }
    nudge.hidden = true;
  }

  function failureMessage(status) {
    if (status === 429) {
      return 'La guía está recibiendo muchas preguntas en este momento. Probá de nuevo en un minuto o preguntá por el plato, el proceso o el impacto.';
    }
    if (status === 503) {
      return 'La guía en línea todavía no está configurada. Mientras tanto, puedo responder por el plato, el proceso o el impacto.';
    }
    return 'No pude consultar la guía en línea. Revisá la conexión o preguntá por el plato, el proceso o el impacto.';
  }

  function finishTyping() {
    typing?.remove();
    typing = null;
    setLoading(false);
  }

  function ask(text) {
    const question = text.trim().slice(0, 400);
    if (!question || loading) return;

    input.value = '';
    hideNudge();
    addMessage('user', question);
    setLoading(true);
    typing = addTyping();

    const answer = localAnswer(question);
    if (answer) {
      window.setTimeout(() => {
        if (!typing) return;
        finishTyping();
        addMessage('bot', answer);
      }, 320);
      return;
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-6) }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          finishTyping();
          addMessage('bot', failureMessage(response.status));
          return;
        }
        const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
        if (!reply) throw new Error('empty_reply');
        finishTyping();
        addMessage('bot', reply);
      })
      .catch(() => {
        finishTyping();
        addMessage('bot', failureMessage(0));
      });
  }

  function renderChips() {
    for (const label of CHIPS) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = label;
      chip.addEventListener('click', () => ask(label));
      chips.appendChild(chip);
    }
  }

  function open() {
    if (opened) return;
    opened = true;
    hideNudge();
    drawer.hidden = false;
    overlay.hidden = false;
    tab.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => drawer.classList.add('open'));
    if (!messages.children.length) {
      addMessage('bot', GREETING);
      renderChips();
    }
    input.focus();
  }

  function closeDrawer() {
    if (!opened) return;
    opened = false;
    drawer.classList.remove('open');
    overlay.hidden = true;
    tab.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!opened) drawer.hidden = true;
      tab.focus();
    }, 300);
  }

  function trapFocus(event) {
    const items = Array.from(
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  tab.addEventListener('click', () => {
    if (opened) closeDrawer();
    else open();
  });
  close.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });

  document.addEventListener('keydown', (event) => {
    if (!opened) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key === 'Tab') trapFocus(event);
  });

  document.addEventListener('slidechange', (event) => {
    if (event.detail?.chapter !== 'inicio') hideNudge();
  });

  window.setTimeout(() => {
    if (opened) return;
    try {
      if (sessionStorage.getItem('naturaplat.guide.nudge')) return;
      sessionStorage.setItem('naturaplat.guide.nudge', '1');
    } catch {
      /* almacenamiento no disponible */
    }
    nudge.hidden = false;
    nudgeTimer = window.setTimeout(() => {
      nudge.hidden = true;
    }, 7000);
  }, 6000);
}
