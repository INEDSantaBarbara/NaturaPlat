/**
 * Gráficos SVG del capítulo Impacto.
 *
 * Sin dependencias: se construyen con la API del DOM y se escalan con viewBox.
 * La alternativa textual es la tabla anual y el resumen en pantalla.
 */

const NS = 'http://www.w3.org/2000/svg';
const FONT = 'IBM Plex Mono, monospace';

function node(name, attributes) {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function label(parent, x, y, content, attributes = {}) {
  const text = node('text', {
    x,
    y,
    fill: 'currentColor',
    'font-family': FONT,
    'font-size': 11,
    ...attributes,
  });
  text.textContent = content;
  parent.appendChild(text);
  return text;
}

function tokens() {
  const style = getComputedStyle(document.documentElement);
  return {
    ink: style.getPropertyValue('--np-ink').trim(),
    inkSoft: style.getPropertyValue('--np-ink-soft').trim(),
    lime: style.getPropertyValue('--np-lime').trim(),
    line: style.getPropertyValue('--np-line-light').trim(),
  };
}

function niceMax(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const normalized = value / power;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * power;
}

function path(points) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
}

/** Gráfico de líneas del acumulado por persona (72 meses). */
export function renderPersonChart(svg, series) {
  svg.replaceChildren();
  const colors = tokens();
  const width = 720;
  const height = 340;
  const pad = { left: 58, right: 18, top: 18, bottom: 38 };
  const max = niceMax(Math.max(series.epsilon[series.epsilon.length - 1], 1));
  const x = (index) =>
    pad.left + (index / (series.epsilon.length - 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom);

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (max / 4) * tick;
    const position = y(value);
    svg.appendChild(
      node('line', {
        x1: pad.left,
        x2: width - pad.right,
        y1: position,
        y2: position,
        stroke: colors.line,
        'stroke-width': 1,
      })
    );
    label(svg, pad.left - 8, position + 4, value.toFixed(0), {
      'text-anchor': 'end',
      fill: colors.inkSoft,
    });
  }

  for (let year = 2027; year <= 2032; year += 1) {
    const index = (year - 2027) * 12 + 11;
    label(svg, x(index), height - 12, String(year), {
      'text-anchor': 'middle',
      fill: colors.inkSoft,
    });
  }

  const epsilonPoints = series.epsilon.map((value, index) => [x(index), y(value)]);
  const leafPoints = series.leaf.map((value, index) => [x(index), y(value)]);

  svg.appendChild(
    node('path', {
      d: path(epsilonPoints),
      fill: 'none',
      stroke: colors.inkSoft,
      'stroke-width': 2.5,
      'stroke-dasharray': '7 5',
      'stroke-linejoin': 'round',
      class: 'chart-line chart-line--eps',
    })
  );
  svg.appendChild(
    node('path', {
      d: path(leafPoints),
      fill: 'none',
      stroke: colors.ink,
      'stroke-width': 3,
      'stroke-linejoin': 'round',
      class: 'chart-line chart-line--leaf',
    })
  );

  svg.setAttribute('data-max', String(max));
}

/** Gráfico combinado del territorio: línea base, con NaturaPlát y barras de ahorro. */
export function renderTerritoryChart(svg, rows) {
  svg.replaceChildren();
  const colors = tokens();
  const width = 720;
  const height = 300;
  const pad = { left: 58, right: 18, top: 30, bottom: 38 };
  const max = niceMax(Math.max(...rows.map((row) => row.baseline)) * 1.05);
  const step = (width - pad.left - pad.right) / rows.length;
  const x = (index) => pad.left + step * (index + 0.5);
  const y = (value) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom);

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (max / 4) * tick;
    const position = y(value);
    svg.appendChild(
      node('line', {
        x1: pad.left,
        x2: width - pad.right,
        y1: position,
        y2: position,
        stroke: colors.line,
        'stroke-width': 1,
      })
    );
    label(svg, pad.left - 8, position + 4, value.toFixed(0), {
      'text-anchor': 'end',
      fill: colors.inkSoft,
    });
  }

  const barWidth = step * 0.42;
  for (const row of rows) {
    const top = y(row.co2);
    const bottom = y(0);
    svg.appendChild(
      node('rect', {
        x: x(rows.indexOf(row)) - barWidth / 2,
        y: top,
        width: barWidth,
        height: Math.max(bottom - top, 0),
        fill: colors.lime,
        stroke: colors.ink,
        'stroke-width': 1,
        rx: 3,
      })
    );
    label(svg, x(rows.indexOf(row)), height - 12, String(row.year), {
      'text-anchor': 'middle',
      fill: colors.inkSoft,
    });
  }

  svg.appendChild(
    node('path', {
      d: path(rows.map((row, index) => [x(index), y(row.baseline)])),
      fill: 'none',
      stroke: colors.inkSoft,
      'stroke-width': 2,
      'stroke-dasharray': '7 5',
      class: 'chart-line chart-line--eps',
    })
  );
  svg.appendChild(
    node('path', {
      d: path(rows.map((row, index) => [x(index), y(row.withNaturaplat)])),
      fill: 'none',
      stroke: colors.ink,
      'stroke-width': 3,
      class: 'chart-line chart-line--leaf',
    })
  );

  const legend = [
    { text: 'Todos con duroport', color: colors.inkSoft, dash: true },
    { text: 'Con NaturaPlát', color: colors.ink, dash: false },
    { text: 'CO₂e evitado', color: colors.lime, block: true },
  ];
  let legendX = pad.left;
  for (const item of legend) {
    if (item.block) {
      svg.appendChild(
        node('rect', {
          x: legendX,
          y: 8,
          width: 10,
          height: 10,
          rx: 2,
          fill: item.color,
          stroke: colors.ink,
          'stroke-width': 1,
        })
      );
    } else {
      const lineAttributes = {
        x1: legendX,
        x2: legendX + 14,
        y1: 13,
        y2: 13,
        stroke: item.color,
        'stroke-width': 2.5,
      };
      if (item.dash) lineAttributes['stroke-dasharray'] = '5 4';
      svg.appendChild(node('line', lineAttributes));
    }
    label(svg, legendX + 18, 17, item.text, { fill: colors.inkSoft, 'font-size': 11 });
    legendX += 18 + item.text.length * 6.2 + 18;
  }

  svg.setAttribute('data-max', String(max));
}

export function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value) {
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 2)} M`;
  return new Intl.NumberFormat('es-GT', { maximumFractionDigits: 0 }).format(value);
}
