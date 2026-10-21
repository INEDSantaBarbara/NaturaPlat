# Arquitectura

NaturaPlát es una **página informativa estática** con un carrito de demostración. No es una
aplicación con rutas ni un recorrido en diapositivas: el contenido se lee con scroll normal y el
carrito es un extra. Esa decisión define toda la arquitectura.

## Capas

```text
public/index.html   Estructura y contenido (una sola página)
public/css/         tokens.css (valores) → styles.css (componentes y layout)
public/js/main.js   Comportamiento: carrito, checkout, FAQ, menú y validación
server.js           Servidor local de desarrollo (Node nativo, sin dependencias)
```

- **Sin build.** Lo que hay en `public/` es lo que se publica. Vercel sirve la carpeta tal cual con
  el preset _Other_.
- **Sin backend.** El carrito vive en `localStorage`; el checkout y el contacto son simulaciones
  declaradas en pantalla.
- **Sin framework.** `main.js` es un IIFE con secciones separadas por comentarios (`Persistencia`,
  `Render`, `Drawer`, `Checkout`, `FAQ`, `Contacto`). Cada bloque inicializa una sola cosa.

## Estado del carrito

```text
localStorage['naturaplat.cart']
  { "1:pack25": { product: 1, variant: "pack25", qty: 2 }, ... }
```

1. `load()` lee y tolera JSON corrupto o almacenamiento bloqueado.
2. `normalize()` descarta productos o variantes inexistentes, cantidades menores a 1 y topa en 99.
3. Toda mutación pasa por `save()` y `render()`.
4. `render()` reconstruye la lista con `createElement` y `textContent`; nunca usa `innerHTML` con
   datos.
5. `total()` es estado derivado: se calcula al renderizar, no se guarda.

Los precios y variantes tienen un único origen: el objeto `PRODUCTS` de `main.js`. El HTML repite
los precios visibles de las tarjetas; si cambia un precio, hay que actualizar ambos y las pruebas.

## Interfaz y tokens

- `public/css/tokens.css` contiene **todos** los valores de color, tipografía, radios y medidas.
  Es el único archivo con hexadecimales; una prueba estática lo verifica.
- `styles.css` importa esos valores con `var(--token)`. Los estados de error usan
  `--peligro` y `--peligro-suave`.
- El layout es _mobile first_ con puntos de quiebre en 720 px, 900 px y 1000 px. El ancho máximo
  del contenedor es 1120 px.
- `[hidden] { display: none !important; }` garantiza que los paneles ocultos (carrito vacío,
  modales, FAQ) no sean visibles cuando un componente define `display`.

## Accesibilidad

- Un solo `h1`; cada sección tiene `h2`; el acordeón usa `button` con `aria-expanded` y
  `aria-controls`, y paneles `role="region"` con `aria-labelledby`.
- El carrito y el checkout son diálogos `aria-modal="true"`; al abrirlos el foco va al botón de
  cierre y al cerrarlos vuelve al control que los abrió. `Escape` cierra el diálogo activo.
- Los errores de formulario se anuncian con `role="alert"`, se marcan con `aria-invalid` y se
  vinculan con `aria-describedby`.
- `prefers-reduced-motion` desactiva animaciones y scroll suave.
- Foco visible de 3 px con `:focus-visible`.

## Pruebas

- **Estáticas** (`tests/static/`): contrato del HTML, referencias locales, tokens, formularios y
  avisos. No necesitan navegador.
- **E2E** (`tests/e2e/`): flujos reales en Chromium con Playwright. El `webServer` levanta
  `node server.js` y **no reutiliza** un servidor existente: el puerto 4173 es compartido por todos
  los proyectos MILAB y reutilizarlo probaría otro sitio.

## Límites conocidos

- Las tipografías se cargan desde Google Fonts: sin red, el sitio usa las familias de respaldo.
- El formulario de contacto no envía nada; el aviso está en la pantalla y en el README.
- No hay pasarela de pago ni persistencia del pedido: al confirmar y cerrar, el carrito se vacía.
- Las cifras de impacto son declaradas por el proyecto; falta su validación técnica.
