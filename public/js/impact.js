/**
 * Capítulo Impacto: enlaza los supuestos con el simulador y los gráficos.
 */

import {
  DEFAULTS,
  LEAF_SCENARIOS,
  epsilonParts,
  epsilonTotal,
  leafGrams,
  personSeries,
  territoryNote,
  territoryRows,
} from './simulator.js';
import { formatCompact, formatNumber, renderPersonChart, renderTerritoryChart } from './charts.js';

const state = { ...DEFAULTS };
const $ = (id) => document.getElementById(id);
const fmt = (value, digits = 1) => formatNumber(value, digits);

let timer = null;
const reduceMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function set(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function syncOutputs() {
  set('imp-o-plates', String(state.plates));
  set('imp-o-burn', `${fmt(state.burn * 100, 1)} %`);
  set('imp-o-mass', `${Number.isInteger(state.mass) ? fmt(state.mass, 0) : fmt(state.mass, 1)} g`);
  set('imp-o-adopt', `${fmt(state.adopt * 100, 0)} %`);
  set('imp-leaf-hint', LEAF_SCENARIOS[state.leaf].hint);
}

function renderPlate() {
  const parts = epsilonParts(state);
  const total = parts.prod + parts.burn;
  const leaf = leafGrams(state);
  const saving = total - leaf;
  const max = Math.max(total, leaf, 1);

  set('imp-eps-total', fmt(total, 1));
  set('imp-eps-prod', `${fmt(parts.prod, 1)} g`);
  set('imp-eps-burn', `${fmt(parts.burn, 1)} g`);
  set('imp-leaf-total', fmt(leaf, 1));
  set('imp-leaf-name', LEAF_SCENARIOS[state.leaf].name);
  set('imp-leaf-detail', `${fmt(leaf, 1)} g`);
  set('imp-save', `${fmt(saving, 1)} g CO₂e`);
  set(
    'imp-save-pct',
    saving >= 0 ? `(${fmt((saving / total) * 100, 0)} % menos)` : '(sin ahorro en este escenario)'
  );

  $('imp-bar-eps-prod').style.width = `${(parts.prod / max) * 100}%`;
  $('imp-bar-eps-burn').style.width = `${(parts.burn / max) * 100}%`;
  $('imp-bar-leaf').style.width = `${(leaf / max) * 100}%`;

  set('imp-mini-eps', `${fmt(total, 1)} g`);
  set('imp-mini-leaf', `${fmt(leaf, 1)} g`);
  set('imp-mini-save', `${fmt(saving, 1)} g`);
}

function renderPerson() {
  const series = personSeries(state);
  const chart = $('imp-person-chart');
  renderPersonChart(chart, series);

  const last = series.epsilon.length - 1;
  const eps = series.epsilon[last];
  const leaf = series.leaf[last];
  const perYear = state.plates * 52;
  const savingYear = (perYear * (epsilonTotal(state) - leafGrams(state))) / 1000;
  const savingSix = eps - leaf;
  const wasteYear = (perYear * state.mass) / 1000;
  const share = (savingYear / 1060) * 100;

  set('imp-person-eps', `${fmt(eps, 1)} kg`);
  set('imp-person-leaf', `${fmt(leaf, 1)} kg`);
  set('imp-person-waste', fmt((perYear * 6 * state.mass) / 1000, 1));
  set('imp-person-flag', 'Resultado a diciembre de 2032.');
  $('imp-person-callout').textContent =
    `Con ${state.plates} platos por semana (${fmt(perYear, 0)} al año), quien usa NaturaPlát evita ` +
    `${fmt(savingYear, 1)} kg de CO₂e cada año y ${fmt(savingSix, 1)} kg entre 2027 y 2032. ` +
    `Además deja de desechar ${fmt(wasteYear, 2)} kg de duroport al año. Ese ahorro anual equivale ` +
    `al ${fmt(share, 1)} % de las emisiones fósiles promedio de una persona en Guatemala.`;
  chart.setAttribute(
    'aria-label',
    `CO₂e acumulado por persona entre 2027 y 2032: ${fmt(eps, 1)} kg con duroport y ${fmt(leaf, 1)} kg con NaturaPlát.`
  );
}

function cell(text, className) {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderTerritory() {
  const rows = territoryRows(state);
  const last = rows[rows.length - 1];
  const totalCo2 = rows.reduce((sum, row) => sum + row.co2, 0);
  const totalWaste = rows.reduce((sum, row) => sum + row.waste, 0);

  set('imp-k-pop', formatCompact(last.population));
  set('imp-k-users', formatCompact(last.users));
  set('imp-k-co2', fmt(totalCo2, totalCo2 < 10 ? 1 : 0));
  set('imp-k-waste', fmt(totalWaste, totalWaste < 10 ? 2 : 1));

  const chart = $('imp-terr-chart');
  renderTerritoryChart(chart, rows);
  chart.setAttribute(
    'aria-label',
    `Proyección del territorio entre 2027 y 2032: ${fmt(totalCo2, 1)} toneladas de CO₂e evitadas y ${fmt(totalWaste, 1)} toneladas de duroport evitadas.`
  );

  set(
    'imp-pop-note',
    `${territoryNote(state)} Los platos por semana, el peso del plato y el escenario NaturaPlát vienen del paso 2.`
  );
  set('imp-table-note', territoryNote(state));

  const body = $('imp-table-body');
  body.replaceChildren();
  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.append(
      cell(String(row.year)),
      cell(fmt(row.population, 0)),
      cell(`${fmt(row.adoption * 100, 1)} %`),
      cell(fmt(Math.round(row.users), 0)),
      cell(formatCompact(row.plates)),
      cell(fmt(row.co2, row.co2 < 10 ? 2 : 1), 'hl'),
      cell(fmt(row.waste, row.waste < 10 ? 2 : 1))
    );
    body.appendChild(tr);
  }
}

function renderAll() {
  syncOutputs();
  renderPlate();
  renderPerson();
  renderTerritory();
}

function bindRange(id, apply, outputId, format) {
  const input = $(id);
  if (!input) return;
  input.addEventListener('input', () => {
    apply(Number(input.value));
    if (outputId) set(outputId, format(Number(input.value)));
    renderAll();
  });
}

function stopAnimation() {
  clearTimeout(timer);
  const chart = $('imp-person-chart');
  chart.querySelectorAll('.chart-line').forEach((line) => line.classList.remove('is-animating'));
  set('imp-person-flag', 'Resultado a diciembre de 2032.');
}

function play() {
  const chart = $('imp-person-chart');
  if (reduceMotion) {
    set('imp-person-flag', 'Resultado a diciembre de 2032.');
    return;
  }
  clearTimeout(timer);
  chart.querySelectorAll('.chart-line').forEach((line) => {
    line.classList.remove('is-animating');
    void line.getBoundingClientRect();
    line.classList.add('is-animating');
  });
  set('imp-person-flag', 'Simulando 2027–2032…');
  timer = window.setTimeout(stopAnimation, 1400);
}

export function initImpact() {
  if (!$('imp-person-chart')) return;

  bindRange(
    'imp-plates',
    (value) => {
      state.plates = value;
    },
    'imp-o-plates',
    (value) => String(value)
  );

  bindRange(
    'imp-burn',
    (value) => {
      state.burn = value / 100;
    },
    'imp-o-burn',
    (value) => `${fmt(value, 1)} %`
  );

  bindRange(
    'imp-mass',
    (value) => {
      state.mass = value;
    },
    'imp-o-mass',
    (value) => `${Number.isInteger(value) ? fmt(value, 0) : fmt(value, 1)} g`
  );

  bindRange(
    'imp-adopt',
    (value) => {
      state.adopt = value / 100;
    },
    'imp-o-adopt',
    (value) => `${fmt(value, 0)} %`
  );

  $('imp-leaf').addEventListener('change', (event) => {
    state.leaf = event.target.value;
    renderAll();
  });

  $('imp-play').addEventListener('click', play);
  $('imp-end').addEventListener('click', stopAnimation);

  const segment = document.querySelector('.segment');
  if (segment) {
    for (const button of segment.querySelectorAll('button')) {
      button.addEventListener('click', () => {
        state.territory = button.dataset.terr;
        segment.querySelectorAll('button').forEach((item) => {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        renderTerritory();
      });
    }
  }

  renderAll();
}
