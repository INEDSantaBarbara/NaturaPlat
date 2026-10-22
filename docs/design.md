# Design spec — NaturaPlát

> **Estado (2026-10-21):** paleta oficial del equipo líder integrada; se conserva la disposición
> de capítulos, componentes y movimiento. La tipografía sigue como propuesta hasta que llegue tu
> `design.md`.
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

## 4. Sistema visual oficial

La paleta la fijó el equipo líder del proyecto (2026-10-21). Se conserva la **disposición** de
este documento; el color se implementa solo con estos cinco valores. No se introducen tonos de
otra familia salvo el rojo funcional de error.

### 4.1 Tokens

| Rol              | Token              | Valor                    | Uso                                              |
| ---------------- | ------------------ | ------------------------ | ------------------------------------------------ |
| Fondo            | `--np-bg`          | `#f2f2f2`                | escenario claro, fondo de página                 |
| Superficie       | `--np-surface`     | `#ffffff`                | tarjetas, paneles, tablas                        |
| Texto            | `--np-ink`         | `#317302`                | texto principal, enlaces, botones                |
| Texto secundario | `--np-ink-soft`    | `#407d15`                | jerarquía secundaria (92 % de la marca)          |
| Marca profunda   | `--np-leaf-deep`   | `#317302`                | portada, cierre, cabecera                        |
| Sobre oscuro     | `--np-on-dark`     | `#f2f2f2`                | texto sobre `--np-leaf-deep`                     |
| Verde hoja       | `--np-leaf`        | `#58a60a`                | series de gráficos, rellenos, ilustración        |
| Verde suave      | `--np-leaf-soft`   | `#6fa660`                | superficies decorativas, fondos de tarjetas      |
| Acento           | `--np-lime`        | `#87d90d`                | cifras grandes, barras, foco sobre oscuro        |
| Línea            | `--np-line`        | `rgba(49, 115, 2, 0.18)` | bordes y separadores                             |
| Error            | `--np-danger`      | `#a63a2b`                | errores y campos inválidos (funcional, no marca) |
| Fondo de error   | `--np-danger-soft` | `#f6e9e7`                | fondo de campo con error                         |
| Foco claro       | `--np-focus`       | `#317302`                | anillo de foco sobre fondo claro                 |
| Foco oscuro      | `--np-focus-dark`  | `#87d90d`                | anillo de foco sobre `--np-leaf-deep`            |

**Ningún hexadecimal fuera de `public/css/tokens.css`.** `--np-ink-soft` es una mezcla al 92 %
de `#317302` sobre `#f2f2f2` para alcanzar 4.5:1; no es un color nuevo de la marca.

### 4.2 Contraste y uso permitido

| Combinación           | Ratio  | Uso permitido                                                        |
| --------------------- | ------ | -------------------------------------------------------------------- |
| `#317302` / `#f2f2f2` | 5.23:1 | texto normal, enlaces, botones                                       |
| `#f2f2f2` / `#317302` | 5.23:1 | texto normal sobre portada, cierre y cabecera                        |
| `#ffffff` / `#317302` | 5.86:1 | texto sobre superficie blanca o marca                                |
| `#317302` / `#87d90d` | 3.34:1 | solo texto grande (≥24 px o ≥18.66 px bold) y elementos no textuales |
| `#87d90d` / `#317302` | 3.34:1 | acentos, barras y foco sobre fondo oscuro                            |
| `#a63a2b` / `#f2f2f2` | 5.75:1 | errores                                                              |
| `#f2f2f2` / `#58a60a` | 2.73:1 | **prohibido como texto**; solo relleno, gráfico o icono decorativo   |
| `#f2f2f2` / `#6fa660` | 2.57:1 | **prohibido como texto**; solo superficie o ilustración              |
| `#317302` / `#58a60a` | 1.92:1 | **prohibido como texto**                                             |
| `#317302` / `#6fa660` | 2.04:1 | **prohibido como texto**                                             |

Reglas:

- El texto normal vive únicamente en `--np-ink` o `--np-ink-soft` sobre `--np-bg`/`#fff`, o en
  `--np-on-dark` sobre `--np-leaf-deep`.
- `#6fa660`, `#58a60a` y `#87d90d` son colores de **superficie, dato y acento**, no de párrafo.
- El botón primario usa `#317302` con texto `#f2f2f2`; el hover se resuelve con borde, elevación
  o subrayado, nunca bajando el contraste del texto.
- El foco es `#317302` sobre claro y `#87d90d` sobre oscuro; no se elimina nunca.
- El rojo `#a63a2b` es exclusivamente funcional para errores.

### 4.3 Tipografía

| Rol     | Familia               | Por qué                                           |
| ------- | --------------------- | ------------------------------------------------- |
| Display | Bricolage Grotesque   | titulares grandes, personalidad, buen rendimiento |
| Texto   | Atkinson Hyperlegible | legibilidad alta, diseñada para accesibilidad     |
| Datos   | IBM Plex Mono         | cifras tabulares, fórmulas y fuentes              |

Escala con `clamp()`; texto base nunca por debajo de 16 px en móvil. Longitud de línea 60–75
caracteres. Si tu `design.md` fija otras familias, se reemplazan estas tres.

### 4.4 Tratamiento fotográfico

- Fotos a sangre en el capítulo Equipo y en Proceso/Evidencia; nunca detrás de texto pequeño.
- Encuadre 4:3 y 16:9 con `object-fit: cover`; punto de interés con `object-position`.
- Sin duotono. Si el texto va encima, velo `#317302` al 65–75 % con texto `#f2f2f2` (5.23:1).
- `loading="lazy"`, `decoding="async"`, `width`/`height` y `srcset` 1600/800.
- Sin nombres, cargos ni pies que identifiquen a estudiantes.

### 4.5 Movimiento

- Transición de diapositiva 380 ms; `prefers-reduced-motion` la anula.
- Contadores y gráficos solo cuando el usuario pulsa «Simular»; nunca en bucle.
- Sin parallax ni autoplay. El foco se mueve al `h1`/`h2` de la diapositiva activa.

### 4.6 Retirado

- La paleta candidata anterior (bosque `#1c3b2c`, beige `#e6d9b8`, sol `#e3b21c`) **no se usa**
  en el rediseño. Queda solo como referencia histórica de la landing.

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

- [x] Paleta final: fijada por el equipo líder (sección 4.1). No hay modo oscuro.
- [ ] Tipografías definitivas y licencias.
- [ ] Logotipo e isotipo: ¿se conserva `img/logo/logo.png`?
- [ ] Tratamiento de las fotos: color, marcos o máscaras.
- [ ] ¿El carrito demo se queda en Producto o se retira?
- [ ] Tono de voz y ejemplos de titulares.
- [ ] Referencias visuales que te gusten (enlaces o capturas).
