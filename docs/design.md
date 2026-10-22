# Design spec — NaturaPlát

> **Estado:** propuesta base. Reemplaza o ajusta este archivo con tu `design.md`; a partir de
> ese momento es la fuente de verdad visual del proyecto.
>
> **Precedencia:** `docs/design.md` (intención) → `public/css/tokens.css` (implementación) →
> pruebas. Si una decisión de este archivo choca con el estándar MILAB, se avisa antes de
> implementar; no se resuelve en silencio.

## 1. Contexto

- **Qué es:** recorrido en diapositivas del proyecto NaturaPlát, vajilla biodegradable de hoja
  de plátano.
- **Dónde:** INED Santa Bárbara, Suchitepéquez, Guatemala. Feria MILAB y presentación ante
  jurado.
- **Audiencia:** jurado, docentes, estudiantes y visitantes de la feria; también se abre en
  teléfono después de la presentación.
- **Objetivo:** que en menos de tres minutos se entienda el problema, la propuesta, el proceso,
  el impacto proyectado y quién lo hace.
- **Artefacto:** un solo recorrido de pantalla completa, sin scroll de página.

## 2. Decisiones ya fijadas

1. **Patrón:** «Recorrido en diapositivas» (MILAB). `html` y `body` con `overflow: hidden`; solo
   cambia el escenario.
2. **Capítulos (7):** Inicio · Problema · Producto · Proceso · Impacto · Equipo · Cierre.
3. **Una idea por diapositiva.** Si una frase necesita «y además», son dos diapositivas.
4. **Ubicación siempre visible:** capítulo activo, «N de M», puntos y progreso global.
5. **El usuario controla:** nada avanza solo; pestañas, anterior/siguiente, puntos, teclado y
   gesto de 60 px.
6. **Datos verificables:** el capítulo Impacto conserva supuestos editables, fórmulas y las 10
   fuentes numeradas.
7. **Cero dependencias en runtime:** sin Chart.js por CDN, sin fuentes que bloqueen el dibujo.
8. **Fotos de evidencia:** las 4 de `Evidencia/`, sin nombres ni pies que identifiquen a
   menores.
9. **Accesibilidad:** WCAG 2.2 AA y `prefers-reduced-motion`.

## 3. Mapa de contenido

| #   | Capítulo | Diapositivas | Idea que responde                                             |
| --- | -------- | ------------ | ------------------------------------------------------------- |
| 1   | Inicio   | 1            | ¿Qué es NaturaPlát y por qué importa?                         |
| 2   | Problema | 2            | ¿Cuánto contamina el duroport y qué se intentó en Guatemala?  |
| 3   | Producto | 2            | ¿Qué platos existen y cómo se piden?                          |
| 4   | Proceso  | 2            | ¿Cómo se hace y qué evidencia hay del trabajo?                |
| 5   | Impacto  | 7            | ¿Cuánto ahorra un plato, una persona y el territorio al 2032? |
| 6   | Equipo   | 2            | ¿Quiénes lo hacen y cómo trabajan?                            |
| 7   | Cierre   | 1            | ¿Cómo contactar y qué sigue?                                  |

Total: 17 diapositivas. El capítulo Impacto desarrolla: un plato, supuestos, una persona,
territorio, año por año, método/valores y fuentes.

## 4. Dirección visual propuesta

Dos sistemas conviven hoy en el material:

- **A · Landing actual:** Fraunces + Karla, verde bosque profundo (#1c3b2c), beige (#e6d9b8).
  Elegante y editorial, pero más de catálogo que de recorrido.
- **B · Prospectivas:** Bricolage Grotesque + Atkinson Hyperlegible + IBM Plex Mono, fondo
  claro verdoso (#f5f8f1), verde hoja (#2f7a3e), sol (#e3b21c) y gris duroport (#6b7a8c).

**Propuesta:** usar **B** como base del recorrido (ya está pensada para diapositivas y para
datos) y reservar el bosque profundo de **A** para las portadas de Inicio y Cierre, de modo que
el recorrido abra y cierre en la marca, y el centro sea claro y legible. Si tu `design.md` trae
otra dirección, manda la tuya.

### 4.1 Tokens candidatos (a confirmar con tu spec)

| Rol            | Token            | Valor     | Uso                             |
| -------------- | ---------------- | --------- | ------------------------------- |
| Marca profunda | `--np-leaf-deep` | `#1f5a2c` | cabecera, portada, cierre       |
| Marca          | `--np-leaf`      | `#2f7a3e` | acciones, datos positivos, foco |
| Acento         | `--np-sun`       | `#e3b21c` | cifras clave, CTA secundario    |
| Fondo          | `--np-bg`        | `#f5f8f1` | escenario claro                 |
| Texto          | `--np-ink`       | `#16241b` | texto principal                 |
| Duroport       | `--np-eps`       | `#6b7a8c` | línea base negativa             |
| Línea          | `--np-line`      | `#d9e2d4` | bordes y separadores            |
| Sobre oscuro   | `--np-on-dark`   | `#f1f7ee` | texto en portada/cierre         |

Estados: `--np-danger` para errores y `--np-sun-soft` para avisos. **Ningún hexadecimal fuera de
`public/css/tokens.css`.**

### 4.2 Tipografía

| Rol     | Familia               | Por qué                                           |
| ------- | --------------------- | ------------------------------------------------- |
| Display | Bricolage Grotesque   | titulares grandes, personalidad, buen rendimiento |
| Texto   | Atkinson Hyperlegible | legibilidad alta, diseñada para accesibilidad     |
| Datos   | IBM Plex Mono         | cifras tabulares, fórmulas y fuentes              |

Escala con `clamp()`; texto base nunca por debajo de 16 px en móvil. Longitud de línea 60–75
caracteres.

### 4.3 Tratamiento fotográfico

- Fotos a sangre en el capítulo Equipo y en Proceso/Evidencia; nunca detrás de texto pequeño.
- Encuadre 4:3 y 16:9 con `object-fit: cover`; punto de interés con `object-position`.
- Tratamiento sobrio: sin duotono agresivo; un velo verde bosque solo si el texto va encima.
- `loading="lazy"`, `decoding="async"`, `width`/`height` y `srcset` 1600/800.
- Sin nombres, cargos ni pies que identifiquen a estudiantes.

### 4.4 Movimiento

- Transición de diapositiva 380 ms; `prefers-reduced-motion` la anula.
- Contadores y gráficos solo cuando el usuario pulsa «Simular»; nunca en bucle.
- Sin parallax ni autoplay. El foco se mueve al `h1`/`h2` de la diapositiva activa.

## 5. Componentes del catálogo

1. **Portada de capítulo** — titular, subtítulo, dato ancla.
2. **Hechos** — 3 cifras con borde superior.
3. **Duelo A vs B** — duroport vs NaturaPlát con barra y veredicto.
4. **Panel de supuestos** — sliders y selector, con salida `output`.
5. **Gráfico de líneas** — acumulado por persona 2027–2032, con alternativa textual.
6. **Gráfico de territorio** — línea base, con NaturaPlát y barras de ahorro.
7. **Tabla anual** — población, adopción, platos, CO₂e y duroport.
8. **Fórmula y método** — bloque monoespaciado con scroll interno.
9. **Fuentes** — lista numerada en dos columnas.
10. **Ficha de producto** — imagen, variantes, precio, añadir al carrito demo.
11. **Mosaico de evidencia** — 2–4 fotos con pie breve.
12. **Cierre** — contacto, créditos y enlace al repositorio.

## 6. Accesibilidad

- Un `h1` por diapositiva; jerarquía sin saltos.
- Diapositivas inactivas con `inert` y `aria-hidden="true"`; la activa sin `inert`.
- Foco visible de 3 px; objetivos de 44×44 px; nada depende de `hover`.
- Gráficos con `role="img"` y descripción; la tabla y los textos son la alternativa.
- Errores de formulario con `role="alert"`, `aria-invalid` y `aria-describedby`.
- Contraste 4.5:1 en texto normal y 3:1 en texto grande y bordes de control.

## 7. Responsive

- Escritorio: escenario centrado con ancho máximo; la cabecera y la barra no se mueven.
- Móvil: la diapositiva densa desplaza su contenido interno; la página no.
- Medidas de verificación: 390×844, 768×1024, 1280×720, 1366×768 y 1920×1080.
- En móvil, los controles de la barra conservan etiquetas accesibles aunque se oculten textos.

## 8. Pendiente de tu `design.md`

Marca estos puntos o reemplaza la sección 4 completa:

- [ ] Paleta final y modo oscuro (¿hay?).
- [ ] Tipografías definitivas y licencias.
- [ ] Logotipo e isotipo: ¿se conserva `img/logo/logo.png`?
- [ ] Tratamiento de las fotos: color, duotono, marcos o máscaras.
- [ ] ¿El carrito demo se queda en Producto o se retira?
- [ ] Tono de voz y ejemplos de titulares.
- [ ] Referencias visuales que te gusten (enlaces o capturas).
