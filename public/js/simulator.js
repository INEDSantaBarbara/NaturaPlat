/**
 * Simulador de prospectivas de impacto de NaturaPlát.
 *
 * Lógica pura, sin DOM: la usan la interfaz y las pruebas. Todas las cifras
 * conservan las fuentes y los supuestos de `prospectivas-de-impacto.html`.
 */

export const YEARS = [2027, 2028, 2029, 2030, 2031, 2032];

export const FE_PROD = 4.78; // kg CO₂e por kg de poliestireno expandido (ICM)
export const FE_BURN = 3.385; // kg CO₂ por kg de poliestireno quemado

export const LEAF_SCENARIOS = Object.freeze({
  conservador: {
    g: 5,
    name: 'Conservador (producción a escala)',
    hint: 'Valor de un estudio de platos de hoja producidos a escala.',
  },
  artesanal: {
    g: 1,
    name: 'Artesanal local',
    hint: 'Secado al sol y prensa manual, vendido en el mismo municipio. Estimación.',
  },
  inicial: {
    g: 18,
    name: 'Pequeña escala, prensa eléctrica',
    hint: 'Peor caso: empresa pequeña, prensa eléctrica y parte del envío por avión.',
  },
});

// Población al 30 de junio. Guatemala: INE 2026–2030; 2031–2032 interpolado
// hacia INE 2034 (20,025,745).
const GT = {
  2023: 17602431,
  2026: 18312373,
  2027: 18540770,
  2028: 18764984,
  2029: 18985066,
  2030: 19201062,
};
GT[2031] = Math.round(GT[2030] * 1.011);
GT[2032] = Math.round(GT[2031] * 1.0107);

// Suchitepéquez: participación en la población nacional con tendencia lineal
// 2023→2026.
const SU = { 2023: 626419, 2026: 646587 };
const share2023 = SU[2023] / GT[2023];
const share2026 = SU[2026] / GT[2026];
const shareDelta = (share2026 - share2023) / 3;
for (const year of YEARS)
  SU[year] = Math.round(GT[year] * (share2026 + shareDelta * (year - 2026)));

// Santa Bárbara: crecimiento anual 2018→2023.
const SB = {};
const growth = Math.pow(27978 / 27215, 1 / 5);
for (const year of YEARS) SB[year] = Math.round(27978 * Math.pow(growth, year - 2023));

export const POPULATION = Object.freeze({ gt: GT, su: SU, sb: SB });

export const TERRITORIES = Object.freeze({
  sb: {
    name: 'Santa Bárbara',
    note: 'Santa Bárbara: estimación a partir de las cifras municipales del INE de 2018 y 2023, extendidas con su crecimiento anual de 0.55 %.',
  },
  su: {
    name: 'Suchitepéquez',
    note: 'Suchitepéquez: proyección INE 2026 (646,587) extendida con la tendencia de su participación en la población nacional.',
  },
  gt: {
    name: 'Guatemala',
    note: 'Guatemala: proyecciones INE 2027–2030; 2031 y 2032 interpolados entre los valores INE de 2030 y 2034.',
  },
});

export const DEFAULTS = Object.freeze({
  plates: 3,
  burn: 0.428,
  leaf: 'conservador',
  mass: 6,
  territory: 'su',
  adopt: 0.15,
});

function normalize(input = {}) {
  const state = { ...DEFAULTS, ...input };
  if (!LEAF_SCENARIOS[state.leaf]) state.leaf = DEFAULTS.leaf;
  if (!TERRITORIES[state.territory]) state.territory = DEFAULTS.territory;
  return state;
}

/** Huella del plato de duroport: fabricación y quema en el hogar. */
export function epsilonParts(input) {
  const state = normalize(input);
  return {
    prod: state.mass * FE_PROD,
    burn: state.mass * state.burn * FE_BURN,
  };
}

/** Huella total del plato de duroport, en gramos de CO₂e. */
export function epsilonTotal(input) {
  const parts = epsilonParts(input);
  return parts.prod + parts.burn;
}

/** Huella del plato NaturaPlát según el escenario elegido. */
export function leafGrams(input) {
  const state = normalize(input);
  return LEAF_SCENARIOS[state.leaf].g;
}

/** Ahorro por plato al reemplazar duroport por NaturaPlát. */
export function savingPerPlate(input) {
  return epsilonTotal(input) - leafGrams(input);
}

/** Serie mensual de 72 meses para una persona (2027–2032). */
export function personSeries(input) {
  const state = normalize(input);
  const perMonth = (state.plates * 52) / 12;
  const eps = epsilonTotal(state);
  const leaf = leafGrams(state);
  const epsilon = [];
  const leafSeries = [];
  const labels = [];

  for (let month = 1; month <= 72; month += 1) {
    epsilon.push((perMonth * month * eps) / 1000);
    leafSeries.push((perMonth * month * leaf) / 1000);
    labels.push(month % 12 === 0 ? String(2026 + month / 12) : '');
  }

  return { epsilon, leaf: leafSeries, labels };
}

/** Proyección anual por territorio, con adopción lineal de 2027 a 2032. */
export function territoryRows(input) {
  const state = normalize(input);
  const population = POPULATION[state.territory];
  const perPlate = savingPerPlate(state);
  const platesPerYear = state.plates * 52;

  return YEARS.map((year) => {
    const pop = population[year];
    const adoption = (state.adopt * (year - 2026)) / 6;
    const users = pop * adoption;
    const plates = users * platesPerYear;
    const baseline = (pop * platesPerYear * epsilonTotal(state)) / 1e6;
    const co2 = (plates * perPlate) / 1e6;
    return {
      year,
      population: pop,
      adoption,
      users,
      plates,
      baseline,
      co2,
      withNaturaplat: baseline - co2,
      waste: (plates * state.mass) / 1e6,
    };
  });
}

export function territoryNote(input) {
  const state = normalize(input);
  return TERRITORIES[state.territory].note;
}
