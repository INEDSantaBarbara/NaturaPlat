# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado
[SemVer](https://semver.org/lang/es/).

## [2.0.0] — 2026-10-21

### Añadido

- Recorrido en diapositivas de 7 capítulos y 17 diapositivas, sin scroll de página, con pestañas,
  anterior/siguiente, puntos, teclado, gesto y hash.
- Capítulo Impacto con simulador de prospectivas: duelo duroport/NaturaPlát, supuestos editables,
  persona, territorio, tabla, método, valores y diez fuentes.
- `public/js/simulator.js`: lógica pura del simulador, con 9 pruebas unitarias.
- `public/js/charts.js`: gráficos SVG propios, sin Chart.js ni CDN.
- `public/js/slides.js`: foco gestionado, `inert`, `aria-hidden` y anuncio acotado.
- Fotos del producto terminado y del proceso (`assets/producto/`, `public/img/producto/`).
- Fotos de equipo y registro audiovisual (`assets/evidencia/`, `public/img/evidencia/`).
- `make images`: optimización reproducible a WebP 1600/800 con Pillow.
- `docs/design.md`: fuente de verdad visual, referencia Analogue y paleta oficial.
- Pruebas: 32 estáticas con `node:test` y 18 end-to-end con Playwright.

### Cambiado

- La landing con scroll se reemplazó por el recorrido en diapositivas.
- La paleta oficial del equipo líder sustituyó la paleta anterior: `#317302`, `#f2f2f2`,
  `#58a60a`, `#6fa660` y `#87d90d`.
- La tipografía pasó a Bricolage Grotesque, Atkinson Hyperlegible e IBM Plex Mono.
- El catálogo muestra un solo plato terminado de 14 cm de ancho por 20 cm de largo, con foto de
  estudio y ficha de medidas.
- El carrito y el checkout se conservan como demostración accesible.
- README, arquitectura, despliegue, CHANGELOG y CONTRIBUTING se actualizaron.

### Eliminado

- La dependencia de Chart.js por CDN.
- El formulario de contacto simulado; el cierre usa WhatsApp y correo de demostración.

### Corregido

- Contraste de la paleta: `#58a60a` y `#6fa660` ya no llevan texto; `#87d90d` se limita a cifras
  grandes, barras y foco.
- El pie del carrito y los paneles ocultos respetan `[hidden]`.
- El foco del carrito y del checkout queda atrapado en el diálogo y vuelve al control de origen.

## [1.0.1] — 2026-10-21

### Añadido

- `make free-port` y `npm run port:free`: detectan el proceso que ocupa el puerto 4173 y lo
  cierran (SIGTERM y, si no responde, SIGKILL).
- `make serve` y `make test-e2e` comprueban el puerto antes de arrancar y señalan cómo liberarlo.

## [1.0.0] — 2026-10-21

### Añadido

- Makefile autodocumentado con `help` por defecto, identidad git y compuerta `ci`.
- Servidor local `server.js` sin dependencias, en el puerto compartido 4173 y sin caché.
- `package.json` con lockfile, ESLint, Stylelint, html-validate, Prettier y Playwright.
- Pruebas estáticas (`node:test`) y end-to-end (Playwright) para navegación y carrito.
- CI de GitHub Actions con jobs `quality` y `e2e`.
- `vercel.json` para despliegue estático con cabeceras de seguridad y caché.
- README, LICENSE MIT, CHANGELOG, CONTRIBUTING y documentación de arquitectura y despliegue.

### Cambiado

- El sitio se movió de la raíz a `public/` (`index.html`, `css/`, `js/`, `img/`).
- La paleta se extrajo a `public/css/tokens.css`; los hexadecimales sueltos pasaron a tokens.
- La clave de carrito cambió a `naturaplat.cart` (antes `ecoplatos_cart`).
- El checkout y el formulario de contacto ahora declaran explícitamente que son una demostración.

### Corregido

- El pie del carrito (subtotal y botón de compra) se mostraba con el carrito vacío porque
  `display: grid` anulaba el atributo `hidden`.
- Los errores de formulario exponen `role="alert"`, `aria-invalid` y `aria-describedby`.
- Se eliminaron los manejadores inline `onerror` de los logotipos.
