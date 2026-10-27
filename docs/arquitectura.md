# Arquitectura

NaturaPlát es un **recorrido en diapositivas** de siete capítulos, con un carrito de demostración.
No es una landing con scroll ni una aplicación con rutas: el escenario cambia y la página nunca
desplaza. Esa decisión define la estructura.

## Capas

```text
public/index.html    Marco de tres filas: cabecera, escenario y barra
public/css/          tokens.css (valores) → styles.css (marco y componentes)
public/js/           main.js arranca slides.js, impact.js y cart.js
public/img/          SVG de marca, fotos de evidencia y fotos de producto
server.js            Servidor local de desarrollo (Node nativo, sin dependencias)
```

- **Sin build.** Lo que hay en `public/` es lo que se publica. Vercel sirve la carpeta con el
  preset _Other_.
- **Sin backend.** El carrito vive en `localStorage`; el checkout y el contacto son simulaciones
  declaradas en pantalla.
- **Módulos ES nativos.** `main.js` importa el motor de diapositivas, el simulador y el carrito.
  Cada módulo tiene una responsabilidad y no conoce el DOM de los otros.

## Recorrido

`slides.js` mantiene el índice actual y:

1. Alterna `.is-active` y `.is-before` para la transición.
2. Marca las diapositivas inactivas con `inert` y `aria-hidden="true"`.
3. Actualiza la pestaña del capítulo, «N de M», los puntos y el progreso.
4. Mueve el foco al `h1`/`h2` de la diapositiva y anuncia el cambio en `#live`.
5. Sincroniza el hash con `history.replaceState`.

La navegación funciona con pestañas, anterior/siguiente, puntos, `←`/`→`, `Inicio`/`Fin` y un
gesto de 60 px. Los controles de formulario y los gráficos quedan excluidos del gesto.

## Impacto

`simulator.js` es lógica pura y no toca el DOM. Conserva las fórmulas y los datos de
`prospectivas-de-impacto.html`:

```text
duroport = masa × (FE_fabricación + %quema × FE_combustión)
ahorro   = duroport − escenario de hoja
persona  = platos_semana × 52 × huella
territorio = población × adopción × platos_semana × 52 × ahorro
```

`impact.js` mantiene el estado de los supuestos y vuelve a pintar el duelo, la serie de la persona,
el territorio y la tabla. `charts.js` construye los dos gráficos con SVG y la API del DOM; no hay
Chart.js ni peticiones externas. La tabla anual es la alternativa textual de los gráficos.

## Carrito

```text
localStorage['naturaplat.cart']
  { "1:pack25": { product: 1, variant: "pack25", qty: 2 }, ... }
```

`cart.js` carga, normaliza y guarda. Todo se reconstruye con `createElement` y `textContent`; no se
usa `innerHTML` con datos. El checkout valida con `aria-invalid`, `aria-describedby` y
`role="alert"`, y declara que no procesa pagos.

## Sistema visual

- `public/css/tokens.css` contiene los cinco colores oficiales y sus roles. Es el único archivo
  con hexadecimales; una prueba lo verifica.
- El lienzo es `#317302`; el capítulo Impacto usa `#f2f2f2` para leer datos. `#87d90d` se reserva
  para cifras grandes, barras y foco sobre verde. `#58a60a` y `#6fa660` no llevan texto.
- La tipografía es Bricolage Grotesque (display), Atkinson Hyperlegible (texto) e IBM Plex Mono
  (datos). El tracking negativo y los titulares de dos líneas vienen de la referencia Analogue.
- Las tarjetas usan borde de 1 px y radio de 18 px; no hay sombras en la UI, solo en el arte del
  héroe.

## Fotos

- `assets/evidencia/` y `assets/producto/` guardan los originales; no se publican.
- `scripts/optimize-images.py` genera WebP 1600/800 en `public/img/`.
- El HTML usa `srcset`, `sizes`, `width`, `height`, `loading` (`eager` en la primera foto de la
  galería, `lazy` en el resto) y `decoding="async"`.
- El héroe usa una galería incrustada de cuatro fotos: plato, termoprensado, equipo y sesión.
  La ficha usa una foto de estudio del producto; «El plato, de cerca» reúne el video y tres
  fotos en un solo cuadro; «Lo que aguanta» muestra el plato en uso con cuatro comidas; el
  proceso usa la foto del termoprensado.
- `public/js/product-gallery.js` maneja la galería del producto: un cuadro 3:2, avance cada 5 s
  (8 s cuando muestra el video), flechas, puntos y pausa. El video solo se reproduce cuando su
  diapositiva y su cuadro están activos, se pausa al salir y respeta `prefers-reduced-motion`;
  el archivo no tiene audio. No hay fotos sueltas que desborden la diapositiva.

## Guía

- `public/js/guide.js` maneja la pestaña, el panel, el historial acotado, las sugerencias y
  el banco local de preguntas frecuentes.
- Si el banco no reconoce la pregunta, consulta `POST /api/chat`. El proxy `api/chat.js` es
  una función serverless que añade el `SYSTEM_PROMPT` y llama a DeepSeek con `thinking`
  desactivado.
- La clave `DEEPSEEK_API_KEY` vive solo en el servidor. Los límites de ráfaga, diarios, de
  cuerpo y de tokens están en `api/chat.js`; sin Upstash los contadores son por instancia.
- Si falta la clave, la red falla o se alcanza un tope, la guía muestra un mensaje de
  respaldo y sigue respondiendo el banco local.

## Pruebas

- **Estáticas** (`tests/static/`): contrato del HTML, diapositivas, capítulos, fotos, tokens,
  formularios, simulador y carrito. No necesitan navegador.
- **E2E** (`tests/e2e/`): navegación completa, teclado, foco, `inert`, cinco medidas, simulador,
  tabla, fuentes, carrito/checkout y guía (local, mock de `/api/chat`, 429/503). El `webServer`
  levanta `node server.js` y no reutiliza un servidor existente: el puerto 4173 es compartido
  por todos los proyectos MILAB.

## Límites conocidos

- Las tipografías se cargan desde Google Fonts: sin red, el sitio usa las familias de respaldo.
- El formulario de contacto se retiró; el cierre usa WhatsApp y correo de demostración.
- No hay pasarela de pago ni persistencia del pedido fuera del navegador.
- Las cifras de impacto son estimaciones declaradas; los supuestos se editan en el paso 2.
