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
plátano recolectada después de la cosecha, sin plásticos, ceras ni aditivos. El sitio cuenta la
historia del producto —problema, misión, proceso, catálogo, impacto y preguntas frecuentes— en
una sola página informativa.

Incluye un **carrito de demostración** con dos productos, dos presentaciones por producto,
persistencia en `localStorage` y un checkout simulado. El carrito existe para mostrar la
experiencia de compra, no para vender.

> **Aviso de demostración.** Este sitio es un prototipo escolar. Los pedidos y los mensajes de
> contacto **no se procesan**: no hay pasarela de pago, ni backend, ni envío de correos. Los datos
> que escribes se quedan en tu navegador. Las cifras de impacto (45 días de compostaje, 100 %
> fibra natural) son las declaradas por el proyecto y están sujetas a validación técnica.

## ✨ Características

- 🌿 **Catálogo con variantes** — NaturaPlát 22 y Bandeja 25, cada uno en pack × 25 y × 100, con
  precios de lanzamiento y selector `aria-pressed`.
- 🛒 **Carrito persistente** — alta, aumento, reducción, eliminación y subtotal en quetzales
  (`Intl` con `es-GT`), guardado en `localStorage` bajo la clave `naturaplat.cart`.
- 🧾 **Checkout de demostración** — resumen del pedido, validación de campos, número de pedido
  simulado y confirmación que declara que no se procesa ningún pago.
- 📱 **Responsive sin scroll horizontal** — verificado en 390×844 y 1366×768; menú móvil con
  `aria-expanded` y cierre por navegación.
- ♿ **Accesibilidad** — un solo `h1`, jerarquía de títulos, `alt` en imágenes, foco visible de
  3 px, foco gestionado al abrir carrito y checkout, cierre con `Escape`, errores con
  `role="alert"` y `aria-invalid`, y `prefers-reduced-motion`.
- 🎨 **Tokens de diseño** — toda la paleta vive en `public/css/tokens.css`; ningún hexadecimal
  fuera de ese archivo.
- 🧪 **Pruebas en dos niveles** — `node:test` para la estructura y Playwright para los flujos.
- ⚡ **Cero dependencias en runtime** — HTML, CSS y JavaScript servidos tal cual, sin build. Las
  tipografías Fraunces y Karla se cargan desde Google Fonts.

## 🗂️ Estructura del proyecto

```text
.
├── public/                    # Raíz web servible (lo que se despliega)
│   ├── index.html             # Página única: hero, catálogo, proceso, FAQ, contacto
│   ├── css/
│   │   ├── tokens.css         # Paleta, tipografía y medidas (único archivo con hex)
│   │   └── styles.css         # Reset, layout y componentes
│   ├── js/main.js             # Carrito, checkout, acordeón, menú y validación
│   └── img/                   # Ilustraciones SVG y logotipos
├── tests/
│   ├── static/                # node:test, sin navegador
│   └── e2e/                   # Playwright: navegación y carrito
├── docs/
│   ├── arquitectura.md        # Cómo está construido y por qué
│   └── despliegue.md          # Vercel Hobby e identidad git
├── server.js                  # Servidor local sin dependencias (puerto 4173, sin caché)
├── scripts/free-port.mjs      # Libera el puerto 4173 de servidores colgados
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
make test-static   # estructura, tokens, formularios y avisos
make test-e2e      # navegación, carrito, checkout, menú móvil y responsive
make test          # todo
```

- **Estáticos** (`tests/static/`): idioma y metadatos, un solo `h1`, ids únicos, referencias
  locales existentes, `alt` en imágenes, ausencia de manejadores inline, tokens definidos,
  hexadecimales solo en `tokens.css` y avisos de demostración.
- **E2E** (`tests/e2e/`): carga sin errores de consola, navegación por secciones, acordeón, menú
  móvil, carrito (alta, cantidad, eliminación, persistencia), checkout inválido y válido, y
  ausencia de scroll horizontal.

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

HTML5 semántico · CSS3 con custom properties · JavaScript clásico (IIFE, sin framework) ·
Node.js para el servidor local · Playwright para e2e · ESLint, Stylelint, html-validate y Prettier
para calidad. **Sin dependencias en runtime y sin paso de compilación.**

## 📄 Licencia y créditos

Distribuido bajo licencia **MIT** (ver [`LICENSE`](LICENSE)).

- **Proyecto:** NaturaPlát · MILAB, INED Santa Bárbara, Suchitepéquez, Guatemala.
- **Contenido:** equipo NaturaPlát; misión, visión y cifras de impacto provistas por el proyecto.
- **Ilustraciones:** SVG originales del proyecto (`public/img/`).
- **Tipografías:** Fraunces y Karla, SIL Open Font License, servidas por Google Fonts.
- **Estándar:** MILAB v2 (estructura, Makefile, calidad y despliegue) y patrón UX «Recorrido en
  diapositivas» para la jerarquía de contenido.
