import { GET_ALL_ITEMS, CALCULATE_ITEM, RECALCULATE_ITEM, DELETE_ITEM, CLEAR_TABLE } from './main.actions';
import { Mision } from '../data/mision.entity';
import Charge0 from '../data/Charge0';
import Charge1 from '../data/Charge1';
import Charge2 from '../data/Charge2';

const MILS_TO_RAD = Math.PI / 3200;
const RAD_TO_MILS = 3200 / Math.PI;

export const triangulateObserver = ({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo }) => {
  const rumbo_mo_rad = rumbo_mo * MILS_TO_RAD;
  const ox = d_mo * Math.sin(rumbo_mo_rad);
  const oy = d_mo * Math.cos(rumbo_mo_rad);

  const rumbo_abs = (rumbo_mo + rumbo_relativo_oo) % 6400;
  const rumbo_abs_rad = rumbo_abs * MILS_TO_RAD;

  const tx = ox + d_oo * Math.sin(rumbo_abs_rad);
  const ty = oy + d_oo * Math.cos(rumbo_abs_rad);

  const distancia = Math.round(Math.sqrt(tx * tx + ty * ty));

  let rumbo_rad = Math.atan2(tx, ty);
  if (rumbo_rad < 0) rumbo_rad += 2 * Math.PI;

  const rumbo = Math.round((rumbo_rad * RAD_TO_MILS) % 6400);

  return { distancia, rumbo };
};

const AZIMUTH_MULTIPLIER = 17.777778;

const CHARGE_RANGES = [
    { min: 50,  max: 450  },
    { min: 150, max: 1950 },
    { min: 300, max: 4050 },
];

export const findBaseCharge = (chargeTable, distance) => {
  if (!chargeTable || chargeTable.length === 0) {
    return { range: -Infinity };
  }

  if (!distance) {
    return chargeTable[0];
  }

  if (distance <= chargeTable[0].range) {
    return chargeTable[0];
  }

  if (distance >= chargeTable[chargeTable.length - 1].range) {
    return chargeTable[chargeTable.length - 1];
  }

  const loIndex = chargeTable.reduce((idx, current, i) => {
    return current.range <= distance ? i : idx;
  }, 0);

  const lo = chargeTable[loIndex];
  const hi = chargeTable[loIndex + 1];

  if (lo.range === distance) return lo;

  const t = (distance - lo.range) / (hi.range - lo.range);

  return {
    range:                distance,
    elevation:            lo.elevation            + t * (hi.elevation            - lo.elevation),
    elevPer100m:          lo.elevPer100m          + t * (hi.elevPer100m          - lo.elevPer100m),
    timeOfFlight:         lo.timeOfFlight         + t * (hi.timeOfFlight         - lo.timeOfFlight),
    timeOfFlightPer100m:  lo.timeOfFlightPer100m  + t * (hi.timeOfFlightPer100m  - lo.timeOfFlightPer100m),
  };
};

export const initialState = {
    misiones: [],
    index: 1,
    alturaPropiaActual: 0,
    resultadoActual: 0,
    azimuthActual: 0,
    tiempoActual: 0,
    resultadosActuales: null,
};

export const validateMissionInput = (item) => {
    const errors = [];
    const distancia = parseInt(item.distancia, 10);
    const rumbo = parseInt(item.rumbo, 10);
    if (isNaN(distancia) || distancia < 50 || distancia > 4050) {
        errors.push('Distancia fuera de rango (50–4050m)');
    }
    if (isNaN(rumbo) || rumbo < 0 || rumbo > 360) {
        errors.push('Rumbo fuera de rango (0–360°)');
    }
    return { valid: errors.length === 0, errors };
};

export const calculateMission = (item, municionIndex, chargeTable, municionTypes) => {
    const base = findBaseCharge(chargeTable, item.distancia);
    const diferenciaAltura = Math.abs(item.altura - item.alturaPropia);
    const correccion = (diferenciaAltura / 100) * base.elevPer100m;
    
    return {
        ...item,
        municion: municionTypes[municionIndex],
        tiempo: base.timeOfFlight,
        resultado: item.altura > item.alturaPropia 
            ? base.elevation - correccion 
            : base.elevation + correccion
    };
};

export const getRecommendedCharge = (distance, chargeTables) => {
    const chargeNames = ['ch0', 'ch1', 'ch2'];

    let bestCharge = null;
    let bestTime = Infinity;

    chargeNames.forEach((name, i) => {
        const { min, max } = CHARGE_RANGES[i];
        if (distance < min || distance > max) return;

        const base = findBaseCharge(chargeTables[i], distance);
        if (base.timeOfFlight < bestTime) {
            bestTime = base.timeOfFlight;
            bestCharge = name;
        }
    });

    return bestCharge;
};

const buildChargeResult = (item, chargeIndex, chargeName, recommended) => {
    const chargeNames = ['ch0', 'ch1', 'ch2'];
    const chargeTables = [Charge0, Charge1, Charge2];
    const { min, max } = CHARGE_RANGES[chargeIndex];
    const mission = calculateMission(item, chargeIndex, chargeTables[chargeIndex], chargeNames);
    return {
        elevacion:      mission.resultado,
        azimuth:        mission.azimuth,
        tiempo:         mission.tiempo,
        recomendada:    chargeName === recommended,
        fuera_de_rango: item.distancia < min || item.distancia > max,
    };
};

export const calculateAllCharges = (item) => {
    const chargeNames = ['ch0', 'ch1', 'ch2'];
    const chargeTables = [Charge0, Charge1, Charge2];
    const recommended = getRecommendedCharge(item.distancia, chargeTables);
    const results = {};
    chargeNames.forEach((name, i) => {
        results[name] = buildChargeResult(item, i, name, recommended);
    });
    return results;
};

export const mainReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_ITEMS:
            return { ...state };

        case CALCULATE_ITEM: {
            const validation = validateMissionInput(action.payload);
            if (!validation.valid) return state;

            const municionTypes = ['ch0', 'ch1', 'ch2'];
            const chargeTables  = [Charge0, Charge1, Charge2];

            const item = new Mision(action.payload);
            item.key = state.index;
            item.azimuth = item.rumbo * AZIMUTH_MULTIPLIER;

            const selectedChargeIndex = municionTypes.indexOf(
              getRecommendedCharge(item.distancia, chargeTables)
            );
            if (selectedChargeIndex === -1) return state;

            const result = calculateMission(item, selectedChargeIndex, chargeTables[selectedChargeIndex], municionTypes);
            const resultadosActuales = calculateAllCharges(item);

            return {
                ...state,
                resultadoActual:    result.resultado,
                azimuthActual:      result.azimuth,
                tiempoActual:       result.tiempo,
                resultadosActuales,
                misiones: [...state.misiones, result],
                index: state.index + 1,
            };
        }

        case RECALCULATE_ITEM: {
            const validation = validateMissionInput(action.payload);
            if (!validation.valid) return state;

            const municionTypes = ['ch0', 'ch1', 'ch2'];
            const chargeTables  = [Charge0, Charge1, Charge2];

            const item = new Mision(action.payload);
            item.azimuth = item.rumbo * AZIMUTH_MULTIPLIER;

            const selectedChargeIndex = municionTypes.indexOf(item.municion);
            if (selectedChargeIndex === -1) return state;

            const result = calculateMission(item, selectedChargeIndex, chargeTables[selectedChargeIndex], municionTypes);

            const original = state.misiones.find(m => m.key === item.key);
            if (!original) return state;

            const updatedResult = { ...result, key: item.key, tipoFuego: original.tipoFuego };
            const newMisiones = state.misiones.map(m => m.key === item.key ? updatedResult : m);

            return { ...state, misiones: newMisiones };
        }

        case DELETE_ITEM:
            return { ...state, misiones: state.misiones.filter(m => m.key !== action.payload.key) };

        case CLEAR_TABLE:
            return { ...state, misiones: [], resultadosActuales: null };

        default:
            return state;
    }
};
