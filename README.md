# NaturaPlát · Platos biodegradables de hoja de plátano

**Vajilla desechable hecha a mano con fibra de hoja de plátano: resistente en la mesa y
compostable en semanas.**

Proyecto del laboratorio **MILAB** del _INED Santa Bárbara_, Suchitepéquez, Guatemala · 2026.

[![CI](https://github.com/INEDSantaBarbara/NaturaPlat/actions/workflows/ci.yml/badge.svg)](https://github.com/INEDSantaBarbara/NaturaPlat/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-2EAD33?logo=playwright&logoColor=white)](tests/e2e)
[![Runtime dependencies](https://img.shields.io/badge/runtime-0%20dependencias-success)](#-tecnologías)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#-tecnologías)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#-tecnologías)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#-tecnologías)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)

---

## 📖 Descripción

**NaturaPlát** presenta una línea de platos y bandejas biodegradables prensados con hoja de
plátano recolectada después de la cosecha, sin plásticos, ceras ni aditivos. El sitio es un
**recorrido en diapositivas** de siete capítulos —Inicio, Problema, Producto, Proceso, Impacto,
Equipo y Cierre— sin scroll de página: se avanza con las pestañas, los botones, el teclado o un
gesto.

El capítulo **Impacto** integra el simulador de prospectivas: compara el duroport con NaturaPlát,
permite ajustar los supuestos, proyecta una persona y el territorio hasta 2032 y cierra con la
tabla anual, la fórmula, los valores y diez fuentes numeradas. Incluye un **carrito de
demostración** con un solo plato, dos presentaciones, persistencia en `localStorage` y un
checkout simulado.

> **Aviso de demostración.** Este sitio es un prototipo escolar. Los pedidos y los mensajes de
> contacto **no se procesan**: no hay pasarela de pago, ni backend, ni envío de correos. Los datos
> que escribes se quedan en tu navegador. Las cifras de impacto (45 días de compostaje, 100 %
> fibra natural) son las declaradas por el proyecto y están sujetas a validación técnica.

## ✨ Características

- 🎞️ **Recorrido MILAB** — siete capítulos y 17 diapositivas, una idea por diapositiva, sin
  scroll de página; pestañas, anterior/siguiente, puntos, teclado y gesto.
- 📊 **Simulador de impacto** — duroport (fabricación + quema), tres escenarios de hoja, serie de
  72 meses, población INE de Guatemala/Suchitepéquez/Santa Bárbara y adopción 2027–2032.
- 🧮 **Datos con fuente** — tabla anual, fórmula, valores usados y 10 fuentes enlazadas; los
  supuestos se editan y se separan de los datos oficiales.
- 🛒 **Catálogo y carrito** — un solo plato terminado de 14 cm de ancho por 20 cm de largo,
  variantes, subtotal en quetzales y checkout de demostración.
- 📷 **Producto y evidencia** — fotos de estudio del producto terminado, del termoprensado y del
  equipo, optimizadas en WebP con `srcset` 1600/800.
- 📱 **Responsive sin scroll de página** — verificado en 390×844, 768×1024, 1280×720, 1366×768 y
  1920×1080; en móvil se desplaza la diapositiva densa, no la página.
- ♿ **Accesibilidad** — foco gestionado al cambiar de diapositiva, `inert` y `aria-hidden` en las
  inactivas, cierre con `Escape`, trampa de foco en carrito/checkout, errores con `role="alert"`
  y `aria-invalid`, y `prefers-reduced-motion`.
- 🎨 **Paleta oficial** — los cinco colores del equipo líder viven en `public/css/tokens.css`;
  ningún hexadecimal fuera de ese archivo.
- 🧪 **Pruebas en dos niveles** — 32 estáticas con `node:test` y 18 end-to-end con Playwright.
- ⚡ **Cero dependencias en runtime** — HTML, CSS y módulos ES sin build; gráficos SVG propios,
  sin Chart.js. Las tipografías Bricolage Grotesque, Atkinson Hyperlegible e IBM Plex Mono se
  cargan desde Google Fonts.

## 🗂️ Estructura del proyecto

```text
.
├── public/                    # Raíz web servible (lo que se despliega)
│   ├── index.html             # Recorrido: 7 capítulos y 17 diapositivas
│   ├── css/
│   │   ├── tokens.css         # Paleta oficial, tipografía y medidas (único con hex)
│   │   └── styles.css         # Marco de tres filas, diapositivas y componentes
│   ├── js/
│   │   ├── main.js            # Arranque: diapositivas, impacto y carrito
│   │   ├── slides.js          # Capítulos, navegación, foco, teclado y gesto
│   │   ├── simulator.js       # Lógica pura del simulador (probada en node:test)
│   │   ├── charts.js          # Gráficos SVG sin dependencias
│   │   ├── impact.js          # Enlace de supuestos, gráficos y tabla
│   │   └── cart.js            # Carrito, checkout y validación
│   ├── img/
│   │   ├── evidencia/         # Equipo y registro audiovisual (WebP)
│   │   ├── producto/          # Producto terminado y termoprensado (WebP)
│   │   └── …                  # Ilustraciones SVG y logotipos
├── assets/
│   ├── evidencia/             # Originales de equipo (no se sirven)
│   └── producto/              # Originales de producto y proceso (no se sirven)
├── tests/
│   ├── static/                # node:test, sin navegador
│   └── e2e/                   # Playwright: recorrido, impacto y carrito
├── docs/
│   ├── arquitectura.md        # Cómo está construido y por qué
│   ├── design.md              # Fuente de verdad visual
│   └── despliegue.md          # Vercel Hobby e identidad git
├── server.js                  # Servidor local sin dependencias (puerto 4173, sin caché)
├── scripts/
│   ├── free-port.mjs          # Libera el puerto 4173 de servidores colgados
│   └── optimize-images.py     # Genera los WebP de assets/evidencia y producto
├── Makefile                   # Atajos autodocumentados
├── package.json               # Scripts y dependencias de desarrollo
├── vercel.json                # Configuración de despliegue estático
└── .github/workflows/ci.yml   # Compuertas de calidad
```

Nada fuera de `public/` se publica. La carpeta `odd/` es la libreta de trabajo interna y no se
versiona.

## ✅ Requisitos

- **Node.js 22 o superior** (`.nvmrc` fija la versión de CI).
- **npm** con lockfile (`package-lock.json`).
- **make** (opcional: los scripts de npm son la vía oficial).
- **Pillow** (solo para `make images`, que regenera las fotos WebP).
- Para las pruebas e2e, Chromium de Playwright (`npx playwright install chromium`).

## 🚀 Inicio rápido

```bash
make install          # npm ci
make serve            # http://127.0.0.1:4173
```

Sin `make`:

```bash
npm ci
npm run serve
```

El puerto **4173 es compartido por todos los proyectos MILAB**. `server.js` responde
`Cache-Control: no-cache, must-revalidate` para que el navegador no muestre la página cacheada de
otro proyecto; aun así, si abres varios proyectos a la vez, cierra el servidor anterior antes de
levantar el siguiente. Si quedó un servidor colgado, ejecuta:

```bash
make free-port
```

## 🛠️ Comandos

| Comando               | Qué hace                                                         |
| --------------------- | ---------------------------------------------------------------- |
| `make`                | Muestra la ayuda (target por defecto).                           |
| `make install`        | Instala dependencias con el lockfile (`npm ci`).                 |
| `make serve`          | Sirve el sitio en `http://127.0.0.1:4173` sin caché.             |
| `make dev` / `run`    | Alias de `serve`.                                                |
| `make free-port`      | Cierra el proceso que ocupa el puerto 4173.                      |
| `make images`         | Genera los WebP de `assets/evidencia` (requiere Pillow).         |
| `make lint`           | html-validate + Stylelint + ESLint.                              |
| `make format`         | Formatea con Prettier.                                           |
| `make format-check`   | Verifica el formato sin escribir.                                |
| `make test`           | Tests estáticos + end-to-end.                                    |
| `make test-static`    | Solo `node:test` (sin navegador).                                |
| `make test-e2e`       | Solo Playwright (levanta `server.js`).                           |
| `make test-e2e-ui`    | Playwright en modo UI.                                           |
| `make ci`             | `install` + `format-check` + `lint` + `test`.                    |
| `make git-config`     | Aplica la identidad git requerida por Vercel Hobby.              |
| `make check-identity` | Falla si el email del repo no es el de la cuenta de Vercel.      |
| `make deploy`         | Publicación manual con Vercel CLI (no sustituye el auto-deploy). |
| `make clean`          | Borra `node_modules` y artefactos de test.                       |

Overrides útiles: `make serve PORT=8080 HOST=0.0.0.0`.

## 🧪 Testing

```bash
make test-static   # recorrido, impacto, tokens, fotos y carrito
make test-e2e      # navegación, simulador, carrito y responsive
make test          # todo
```

- **Estáticos** (`tests/static/`): idioma y metadatos, 17 diapositivas con título, siete
  capítulos, ids únicos, referencias locales, `alt` y `srcset` de fotos, formularios accesibles,
  tokens definidos, hexadecimales solo en `tokens.css`, simulador (9 casos), fuentes y avisos.
- **E2E** (`tests/e2e/`): carga sin errores, pestañas y capítulos, siguiente/anterior, teclado,
  puntos, enlaces directos, `inert`, foco, cinco medidas sin scroll; simulador (supuestos,
  persona, territorio, tabla y fuentes); carrito (alta, variantes, cantidades, persistencia) y
  checkout inválido/válido.

Las pruebas que mutan estado usan el contexto aislado de Playwright: no escriben en tu
`localStorage` real ni dejan archivos versionados.

## 🚢 Despliegue

El proyecto se despliega en **Vercel Hobby enlazado al repositorio de GitHub**: cada push a la
rama por defecto redespliega y no existe un workflow de despliegue. `vercel.json` fija
`installCommand` sin devDependencies, `outputDirectory: public` y cabeceras de seguridad y caché.

Antes del primer commit, ejecuta `make git-config` y verifica con `make check-identity`: en el plan
Hobby con repositorio privado, Vercel solo despliega commits cuyo **email** coincida con el dueño
de la cuenta. Los detalles están en [`docs/despliegue.md`](docs/despliegue.md).

## 🧰 Tecnologías

HTML5 semántico · CSS3 con custom properties · módulos ES nativos (sin framework) ·
SVG generado con la API del DOM · Node.js para el servidor local · Playwright para e2e · ESLint,
Stylelint, html-validate y Prettier para calidad. **Sin dependencias en runtime, sin Chart.js y
sin paso de compilación.** La especificación visual vive en [`docs/design.md`](docs/design.md).

## 📄 Licencia y créditos

Distribuido bajo licencia **MIT** (ver [`LICENSE`](LICENSE)).

- **Proyecto:** NaturaPlát · MILAB, INED Santa Bárbara, Suchitepéquez, Guatemala.
- **Contenido:** equipo NaturaPlát; misión, visión y cifras de impacto provistas por el proyecto.
- **Ilustraciones:** SVG originales del proyecto (`public/img/`).
- **Tipografías:** Fraunces y Karla, SIL Open Font License, servidas por Google Fonts.
- **Estándar:** MILAB v2 (estructura, Makefile, calidad y despliegue) y patrón UX «Recorrido en
  diapositivas» para la jerarquía de contenido.
