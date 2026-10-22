import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULTS,
  FE_BURN,
  FE_PROD,
  LEAF_SCENARIOS,
  POPULATION,
  TERRITORIES,
  YEARS,
  epsilonParts,
  epsilonTotal,
  leafGrams,
  personSeries,
  savingPerPlate,
  territoryRows,
} from '../../public/js/simulator.js';

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `esperado ${expected}, recibido ${actual}`);
};

test('el duroport por defecto suma fabricación y quema', () => {
  const parts = epsilonParts({});
  close(parts.prod, 6 * FE_PROD);
  close(parts.burn, 6 * DEFAULTS.burn * FE_BURN);
  close(epsilonTotal({}), parts.prod + parts.burn);
});

test('sin quema en el hogar solo queda la fabricación', () => {
  close(epsilonTotal({ burn: 0 }), 6 * FE_PROD);
});

test('los tres escenarios de hoja conservan sus valores', () => {
  assert.equal(leafGrams({ leaf: 'conservador' }), 5);
  assert.equal(leafGrams({ leaf: 'artesanal' }), 1);
  assert.equal(leafGrams({ leaf: 'inicial' }), 18);
  assert.equal(leafGrams({ leaf: 'inexistente' }), LEAF_SCENARIOS.conservador.g);
});

test('el ahorro por plato es duroport menos hoja', () => {
  close(savingPerPlate({}), epsilonTotal({}) - 5);
});

test('la serie de una persona tiene 72 meses y crece', () => {
  const series = personSeries({});
  assert.equal(series.epsilon.length, 72);
  assert.equal(series.leaf.length, 72);
  assert.equal(series.labels[11], '2027');
  assert.equal(series.labels[71], '2032');
  assert.ok(series.epsilon[71] > series.epsilon[0]);
  assert.ok(series.epsilon[71] > series.leaf[71]);

  const perMonth = (DEFAULTS.plates * 52) / 12;
  close(series.epsilon[0], (perMonth * epsilonTotal({})) / 1000);
  close(series.epsilon[71], (perMonth * 72 * epsilonTotal({})) / 1000);
});

test('la adopción llega a la meta en 2032 y crece cada año', () => {
  const rows = territoryRows({ adopt: 0.15 });
  assert.equal(rows.length, 6);
  assert.deepEqual(
    rows.map((row) => row.year),
    YEARS
  );
  close(rows[0].adoption, 0.15 / 6);
  close(rows[5].adoption, 0.15);
  for (let index = 1; index < rows.length; index += 1) {
    assert.ok(rows[index].users > rows[index - 1].users);
    assert.ok(rows[index].co2 > rows[index - 1].co2);
  }
});

test('las poblaciones del territorio son las del INE', () => {
  const guatemala = territoryRows({ territory: 'gt' });
  assert.equal(guatemala[5].population, POPULATION.gt[2032]);
  assert.equal(guatemala[0].population, 18540770);

  const suchi = territoryRows({ territory: 'su' });
  assert.equal(suchi[5].population, POPULATION.su[2032]);

  const santa = territoryRows({ territory: 'sb' });
  assert.equal(santa[5].population, POPULATION.sb[2032]);
  assert.ok(santa[5].population < suchi[5].population);
  assert.ok(suchi[5].population < guatemala[5].population);
});

test('el CO₂ evitado y el duroport evitado usan la misma base de platos', () => {
  const rows = territoryRows({});
  for (const row of rows) {
    close(row.co2, (row.plates * savingPerPlate({})) / 1e6);
    close(row.waste, (row.plates * DEFAULTS.mass) / 1e6);
    close(row.withNaturaplat, row.baseline - row.co2);
  }
});

test('cada territorio tiene nombre y nota de método', () => {
  for (const key of Object.keys(TERRITORIES)) {
    assert.ok(TERRITORIES[key].name.length > 0);
    assert.ok(TERRITORIES[key].note.length > 20);
  }
});
