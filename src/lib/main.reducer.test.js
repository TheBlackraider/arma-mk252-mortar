import { 
  findBaseCharge, 
  calculateMission, 
  getRecommendedCharge,
  validateMissionInput,
  calculateAllCharges,
  mainReducer,
  initialState,
  triangulateObserver,
} from './main.reducer';
import { CALCULATE_ITEM, GET_ALL_ITEMS, RECALCULATE_ITEM, DELETE_ITEM, CLEAR_TABLE } from './main.actions';
import { Mision } from '../data/mision.entity';
import Charge0 from '../data/Charge0';
import Charge1 from '../data/Charge1';
import Charge2 from '../data/Charge2';

describe('findBaseCharge', () => {
  const mockChargeTable = [
    { range: 100, elevation: 800,  elevPer100m: 50, timeOfFlight: 10.0, timeOfFlightPer100m: 1.0 },
    { range: 200, elevation: 1000, elevPer100m: 60, timeOfFlight: 9.0,  timeOfFlightPer100m: 1.2 },
    { range: 300, elevation: 1200, elevPer100m: 70, timeOfFlight: 8.0,  timeOfFlightPer100m: 1.4 }
  ];

  test('returns first entry when no distance provided', () => {
    expect(findBaseCharge(mockChargeTable)).toEqual(mockChargeTable[0]);
  });

  test('returns {range: -Infinity} for empty or null charge table', () => {
    expect(findBaseCharge([])).toEqual({ range: -Infinity });
    expect(findBaseCharge(null)).toEqual({ range: -Infinity });
  });

  test('returns exact entry when distance matches a range exactly', () => {
    expect(findBaseCharge(mockChargeTable, 200)).toEqual(mockChargeTable[1]);
    expect(findBaseCharge(mockChargeTable, 100)).toEqual(mockChargeTable[0]);
  });

  test('interpolates elevation linearly between two entries', () => {
    // 150m is halfway between 100 and 200
    // elevation: 800 + 0.5*(1000-800) = 900
    const result = findBaseCharge(mockChargeTable, 150);
    expect(result.elevation).toBeCloseTo(900, 5);
  });

  test('interpolates elevPer100m linearly between two entries', () => {
    // 150m: 50 + 0.5*(60-50) = 55
    const result = findBaseCharge(mockChargeTable, 150);
    expect(result.elevPer100m).toBeCloseTo(55, 5);
  });

  test('interpolates timeOfFlight linearly between two entries', () => {
    // 150m: 10.0 + 0.5*(9.0-10.0) = 9.5
    const result = findBaseCharge(mockChargeTable, 150);
    expect(result.timeOfFlight).toBeCloseTo(9.5, 5);
  });

  test('interpolates timeOfFlightPer100m linearly between two entries', () => {
    // 150m: 1.0 + 0.5*(1.2-1.0) = 1.1
    const result = findBaseCharge(mockChargeTable, 150);
    expect(result.timeOfFlightPer100m).toBeCloseTo(1.1, 5);
  });

  test('interpolates at non-midpoint (t=0.4)', () => {
    // 140m between 100 and 200: t = (140-100)/(200-100) = 0.4
    // elevation: 800 + 0.4*(1000-800) = 880
    const result = findBaseCharge(mockChargeTable, 140);
    expect(result.elevation).toBeCloseTo(880, 5);
  });

  test('returns first entry for distance below minimum range', () => {
    expect(findBaseCharge(mockChargeTable, 50)).toEqual(mockChargeTable[0]);
  });

  test('returns last entry for distance above maximum range', () => {
    expect(findBaseCharge(mockChargeTable, 400)).toEqual(mockChargeTable[2]);
  });

  test('Charge0 real data: 425m interpolates correctly between 400m and 450m', () => {
    // t = (425-400)/(450-400) = 0.5
    // elevation: 1127 + 0.5*(1029-1127) = 1078
    // elevPer100m: 61 + 0.5*(91-61) = 76
    // timeOfFlight: 12.8 + 0.5*(12.1-12.8) = 12.45
    const result = findBaseCharge(Charge0, 425);
    expect(result.elevation).toBeCloseTo(1078, 5);
    expect(result.elevPer100m).toBeCloseTo(76, 5);
    expect(result.timeOfFlight).toBeCloseTo(12.45, 5);
  });
});

describe('getChargeForDistance — ELIMINADA', () => {
  // Función eliminada en Hito 5 — tests eliminados
});

describe('getRecommendedCharge', () => {
  const chargeTables = [Charge0, Charge1, Charge2];

  test('returns ch0 for distance 300 — ch0 has lowest timeOfFlight (13.5 < 28.5 < 40.8)', () => {
    expect(getRecommendedCharge(300, chargeTables)).toBe('ch0');
  });

  test('returns ch0 for distance 100 — only ch0 in range (ch1 min 150, ch2 min 300)', () => {
    expect(getRecommendedCharge(100, chargeTables)).toBe('ch0');
  });

  test('returns ch0 for distance 200 — ch0 tof 14.0 < ch1 tof 28.5', () => {
    expect(getRecommendedCharge(200, chargeTables)).toBe('ch0');
  });

  test('returns ch2 for distance 2000 — only ch2 in range (ch0 max 450, ch1 max 1950)', () => {
    expect(getRecommendedCharge(2000, chargeTables)).toBe('ch2');
  });

  test('returns ch0 at boundary 450m — ch0 max exactly, ch0 tof 12.1 < ch1 28.4 < ch2 40.7', () => {
    expect(getRecommendedCharge(450, chargeTables)).toBe('ch0');
  });

  test('returns ch1 at boundary 1950m — ch1 max exactly, ch1 tof 22.3 < ch2 tof 39.5', () => {
    expect(getRecommendedCharge(1950, chargeTables)).toBe('ch1');
  });

  test('prefers lower charge number on timeOfFlight tie', () => {
    const mockCh0 = [{ range: 200, elevation: 1000, elevPer100m: 10, timeOfFlight: 5.0, timeOfFlightPer100m: 0.5 }];
    const mockCh1 = [{ range: 200, elevation: 1000, elevPer100m: 10, timeOfFlight: 5.0, timeOfFlightPer100m: 0.5 }];
    const mockCh2 = [{ range: 200, elevation: 1000, elevPer100m: 10, timeOfFlight: 6.0, timeOfFlightPer100m: 0.5 }];
    // ch0 and ch1 both at 5.0, ch0 is lower number -> ch0 wins
    // ranges: ch0 50-200, ch1 150-1950 for this mock test
    // We use custom ranges via mock tables directly
    expect(getRecommendedCharge(200, [mockCh0, mockCh1, mockCh2])).toBe('ch0');
  });

  test('returns null when distance is out of all ranges', () => {
    expect(getRecommendedCharge(30, chargeTables)).toBeNull();
  });
});

describe('validateMissionInput', () => {
  test('returns valid for distance 300 and rumbo 1600', () => {
    const result = validateMissionInput({ distancia: 300, rumbo: 1600 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns valid for minimum boundary distance 50', () => {
    expect(validateMissionInput({ distancia: 50, rumbo: 0 }).valid).toBe(true);
  });

  test('returns valid for maximum boundary distance 4050', () => {
    expect(validateMissionInput({ distancia: 4050, rumbo: 6400 }).valid).toBe(true);
  });

  test('returns invalid for distance 49 — below minimum', () => {
    const result = validateMissionInput({ distancia: 49, rumbo: 1600 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Distancia fuera de rango (50–4050m)');
  });

  test('returns invalid for distance 4051 — above maximum', () => {
    const result = validateMissionInput({ distancia: 4051, rumbo: 1600 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Distancia fuera de rango (50–4050m)');
  });

  test('returns invalid for rumbo -1', () => {
    const result = validateMissionInput({ distancia: 300, rumbo: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Rumbo fuera de rango (0–6400 mils)');
  });

  test('returns invalid for rumbo 6401', () => {
    const result = validateMissionInput({ distancia: 300, rumbo: 6401 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Rumbo fuera de rango (0–6400 mils)');
  });

  test('returns valid for string inputs that parse correctly', () => {
    expect(validateMissionInput({ distancia: '300', rumbo: '1600' }).valid).toBe(true);
  });

  test('accumulates multiple errors', () => {
    const result = validateMissionInput({ distancia: 10, rumbo: 7000 });
    expect(result.errors).toHaveLength(2);
  });
});

describe('calculateAllCharges', () => {
  const baseItem = { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0 };

  test('returns results for all 3 charges', () => {
    const result = calculateAllCharges(baseItem);
    expect(result).toHaveProperty('ch0');
    expect(result).toHaveProperty('ch1');
    expect(result).toHaveProperty('ch2');
  });

  test('each result has elevacion, azimuth, tiempo, recomendada, fuera_de_rango', () => {
    const result = calculateAllCharges(baseItem);
    ['ch0', 'ch1', 'ch2'].forEach(charge => {
      expect(result[charge]).toHaveProperty('elevacion');
      expect(result[charge]).toHaveProperty('azimuth');
      expect(result[charge]).toHaveProperty('tiempo');
      expect(result[charge]).toHaveProperty('recomendada');
      expect(result[charge]).toHaveProperty('fuera_de_rango');
    });
  });

  test('marks ch0 as recomendada for distance 300 — lowest timeOfFlight', () => {
    const result = calculateAllCharges(baseItem);
    expect(result.ch0.recomendada).toBe(true);
    expect(result.ch1.recomendada).toBe(false);
    expect(result.ch2.recomendada).toBe(false);
  });

  test('marks ch0 as recomendada for distance 100 — only in range', () => {
    const result = calculateAllCharges({ ...baseItem, distancia: 100 });
    expect(result.ch0.recomendada).toBe(true);
    expect(result.ch1.recomendada).toBe(false);
    expect(result.ch2.recomendada).toBe(false);
  });

  test('marks ch2 as recomendada for distance 2000 — only in range', () => {
    const result = calculateAllCharges({ ...baseItem, distancia: 2000 });
    expect(result.ch2.recomendada).toBe(true);
    expect(result.ch0.recomendada).toBe(false);
    expect(result.ch1.recomendada).toBe(false);
  });

  test('ch0 fuera_de_rango=false for distance 300 — within 50-450', () => {
    const result = calculateAllCharges(baseItem);
    expect(result.ch0.fuera_de_rango).toBe(false);
  });

  test('ch1 fuera_de_rango=true for distance 100 — ch1 min is 150', () => {
    const result = calculateAllCharges({ ...baseItem, distancia: 100 });
    expect(result.ch1.fuera_de_rango).toBe(true);
  });

  test('ch2 fuera_de_rango=true for distance 200 — ch2 min is 300', () => {
    const result = calculateAllCharges({ ...baseItem, distancia: 200 });
    expect(result.ch2.fuera_de_rango).toBe(true);
  });

  test('ch0 fuera_de_rango=true for distance 2000 — ch0 max is 450', () => {
    const result = calculateAllCharges({ ...baseItem, distancia: 2000 });
    expect(result.ch0.fuera_de_rango).toBe(true);
  });

  test('exactly one charge has recomendada=true for distance 300', () => {
    const result = calculateAllCharges(baseItem);
    const recommended = ['ch0', 'ch1', 'ch2'].filter(c => result[c].recomendada);
    expect(recommended).toHaveLength(1);
  });
});

describe('calculateMission', () => {
  const mockChargeTable = [{
    range: 100,
    elevation: 1000,
    elevPer100m: 50,
    timeOfFlight: 0.8,
    timeOfFlightPer100m: 0.5
  }];

  const mockItem = {
    distancia: 100,
    altura: 150,
    alturaPropia: 100
  };

  test('calculates mission correctly with elevation difference', () => {
    const result = calculateMission(mockItem, 0, mockChargeTable, ['ch0', 'ch1', 'ch2']);
    
    expect(result).toEqual({
      ...mockItem,
      municion: 'ch0',
      tiempo: 0.8,
      resultado: 975 // 1000 - (50/100 * 50)
    });
  });

  test('should use timeOfFlight directly from table — Charge0 at 300m returns tiempo 13.5', () => {
    const result = calculateMission(
      { distancia: 300, altura: 0, alturaPropia: 0 },
      0,
      Charge0,
      ['ch0', 'ch1', 'ch2']
    );
    expect(result.tiempo).toBe(13.5);
  });

  test('should use timeOfFlight directly from table — Charge1 at 1000m returns tiempo 27.6', () => {
    const result = calculateMission(
      { distancia: 1000, altura: 0, alturaPropia: 0 },
      1,
      Charge1,
      ['ch0', 'ch1', 'ch2']
    );
    expect(result.tiempo).toBe(27.6);
  });

  test('should use timeOfFlight directly from table — Charge2 at 2000m returns tiempo 39.5', () => {
    const result = calculateMission(
      { distancia: 2000, altura: 0, alturaPropia: 0 },
      2,
      Charge2,
      ['ch0', 'ch1', 'ch2']
    );
    expect(result.tiempo).toBe(39.5);
  });
});

describe('mainReducer', () => {
  test('returns initial state', () => {
    expect(mainReducer(undefined, {})).toEqual(initialState);
  });

  test('handles GET_ALL_ITEMS', () => {
    const state = initialState;
    expect(mainReducer(state, { type: GET_ALL_ITEMS })).toEqual(state);
  });

  test('handles CALCULATE_ITEM', () => {
    const mockPayload = {
      distancia: 300,
      altura: 100,
      alturaPropia: 50,
      rumbo: 1,
      municion: 'ch0'
    };

    const action = {
      type: CALCULATE_ITEM,
      payload: mockPayload
    };

    const result = mainReducer(initialState, action);

    expect(result.index).toBe(2);
    expect(result.misiones.length).toBe(1);
    expect(result.misiones[0].azimuth).toBe(17.777778);
    expect(result.misiones[0].key).toBe(1);
  });

  test('should initialize tiempoActual to 0', () => {
    expect(initialState.tiempoActual).toBe(0);
  });

  test('should not call console.log when dispatching CALCULATE_ITEM', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const action = {
      type: CALCULATE_ITEM,
      payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
    };
    mainReducer(initialState, action);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should not call console.error for valid municion', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const action = {
      type: CALCULATE_ITEM,
      payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch1' }
    };
    mainReducer(initialState, action);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('does not modify state when distance is out of range (< 50)', () => {
    const action = { type: CALCULATE_ITEM, payload: { distancia: 30, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' } };
    expect(mainReducer(initialState, action)).toEqual(initialState);
  });

  test('does not modify state when rumbo is out of range (> 6400)', () => {
    const action = { type: CALCULATE_ITEM, payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 7000, municion: 'ch0' } };
    expect(mainReducer(initialState, action)).toEqual(initialState);
  });

  test('sets resultadosActuales after CALCULATE_ITEM', () => {
    const action = { type: CALCULATE_ITEM, payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' } };
    const result = mainReducer(initialState, action);
    expect(result.resultadosActuales).not.toBeNull();
    expect(result.resultadosActuales).toHaveProperty('ch0');
    expect(result.resultadosActuales).toHaveProperty('ch1');
    expect(result.resultadosActuales).toHaveProperty('ch2');
  });

  test('resultadosActuales has recomendada=true on ch0 for distance 300', () => {
    const action = { type: CALCULATE_ITEM, payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' } };
    const result = mainReducer(initialState, action);
    expect(result.resultadosActuales.ch0.recomendada).toBe(true);
  });

  test('does not modify state when municion is not a valid charge (line 150 branch)', () => {
    // distancia and rumbo are valid, but municion is not ch0/ch1/ch2
    // => selectedChargeIndex === -1 => returns state unchanged
    const action = {
      type: CALCULATE_ITEM,
      payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch99' }
    };
    expect(mainReducer(initialState, action)).toEqual(initialState);
  });
});

describe('getOptimalCharge — ELIMINADA', () => {
  // Función eliminada en Hito 5 — tests eliminados
});

// ─── HITO 1: nuevas acciones + triangulateObserver ───────────────────────────

describe('triangulateObserver', () => {
  test('should calculate correct distance and heading for orthogonal case', () => {
    // obs al Sur 300m (rumbo_mo=3200), objetivo al Este del obs 400m (rumbo_abs=1600 Este)
    // triángulo 3-4-5: tx=400, ty=-300 → distancia=500, rumbo ≈ 2254 mils (SE, en [2000,2400])
    const result = triangulateObserver({ d_mo: 300, rumbo_mo: 3200, d_oo: 400, rumbo_relativo_oo: 4800 });
    expect(result.distancia).toBeCloseTo(500, 0);
    expect(result.rumbo).toBeGreaterThanOrEqual(2000);
    expect(result.rumbo).toBeLessThanOrEqual(2400);
  });

  test('should return distancia near 0 when observer and target are at same position', () => {
    // Obs al Norte 100m, objetivo opuesto (Sur) 100m desde obs → mismo punto que mortero
    const result = triangulateObserver({ d_mo: 100, rumbo_mo: 0, d_oo: 100, rumbo_relativo_oo: 3200 });
    expect(result.distancia).toBe(0);
  });

  test('should wrap rumbo_absoluto modulo 6400', () => {
    // rumbo_mo:4000 + rumbo_relativo_oo:3200 = 7200 → 7200%6400 = 800, no debe lanzar error
    expect(() => {
      triangulateObserver({ d_mo: 200, rumbo_mo: 4000, d_oo: 200, rumbo_relativo_oo: 3200 });
    }).not.toThrow();
  });

  test('should return rumbo 0 when target is due North', () => {
    // Obs en mortero (d_mo=0), objetivo 300m al Norte
    const result = triangulateObserver({ d_mo: 0, d_oo: 300, rumbo_mo: 0, rumbo_relativo_oo: 0 });
    expect(result.distancia).toBe(300);
    expect(result.rumbo).toBe(0);
  });

  test('should return rumbo 1600 when target is due East', () => {
    // Obs en mortero (d_mo=0), objetivo 300m al Este (1600 mils)
    const result = triangulateObserver({ d_mo: 0, d_oo: 300, rumbo_mo: 0, rumbo_relativo_oo: 1600 });
    expect(result.distancia).toBe(300);
    expect(result.rumbo).toBe(1600);
  });

  test('should handle rumbo_relativo_oo = 0 (observer and target on same bearing)', () => {
    // Obs 200m al Norte, objetivo 200m más al Norte = 400m Norte desde mortero
    const result = triangulateObserver({ d_mo: 200, rumbo_mo: 0, d_oo: 200, rumbo_relativo_oo: 0 });
    expect(result.distancia).toBe(400);
    expect(result.rumbo).toBe(0);
  });
});

describe('mainReducer — RECALCULATE_ITEM', () => {
  // Estado con una misión ya calculada
  const stateWithMission = mainReducer(initialState, {
    type: CALCULATE_ITEM,
    payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0', tipoFuego: 'indirecto' }
  });

  test('should update existing mission in place without growing misiones array', () => {
    const originalLength = stateWithMission.misiones.length;
    const mision = stateWithMission.misiones[0];
    const action = {
      type: RECALCULATE_ITEM,
      payload: { ...mision, distancia: 400, rumbo: 0, municion: 'ch0' }
    };
    const result = mainReducer(stateWithMission, action);
    expect(result.misiones).toHaveLength(originalLength);
  });

  test('should preserve tipoFuego of original mission when recalculating', () => {
    const mision = stateWithMission.misiones[0];
    const action = {
      type: RECALCULATE_ITEM,
      payload: { ...mision, distancia: 400, rumbo: 0, municion: 'ch0' }
    };
    const result = mainReducer(stateWithMission, action);
    expect(result.misiones[0].tipoFuego).toBe(mision.tipoFuego);
  });

  test('should not modify state when recalculate payload has invalid distance', () => {
    const mision = stateWithMission.misiones[0];
    const action = {
      type: RECALCULATE_ITEM,
      payload: { ...mision, distancia: 10, rumbo: 0, municion: 'ch0' }
    };
    expect(mainReducer(stateWithMission, action)).toEqual(stateWithMission);
  });

  test('should not modify state when key does not exist in misiones', () => {
    const action = {
      type: RECALCULATE_ITEM,
      payload: { key: 9999, distancia: 300, rumbo: 0, municion: 'ch0' }
    };
    expect(mainReducer(stateWithMission, action)).toEqual(stateWithMission);
  });

  test('should not modify resultadosActuales when recalculating a row', () => {
    const mision = stateWithMission.misiones[0];
    const action = {
      type: RECALCULATE_ITEM,
      payload: { ...mision, distancia: 400, rumbo: 0, municion: 'ch0' }
    };
    const result = mainReducer(stateWithMission, action);
    expect(result.resultadosActuales).toEqual(stateWithMission.resultadosActuales);
  });

  test('should update mission at correct position when multiple missions exist', () => {
    const state2 = mainReducer(stateWithMission, {
      type: CALCULATE_ITEM,
      payload: { distancia: 400, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
    });
    const firstMision = state2.misiones[0];
    const action = {
      type: RECALCULATE_ITEM,
      payload: { ...firstMision, distancia: 350, rumbo: 0, municion: 'ch0' }
    };
    const result = mainReducer(state2, action);
    expect(result.misiones).toHaveLength(2);
    expect(result.misiones[0].distancia).toBe(350);
    expect(result.misiones[1].distancia).toBe(400);
  });
});

describe('mainReducer — DELETE_ITEM', () => {
  const stateWithMission = mainReducer(initialState, {
    type: CALCULATE_ITEM,
    payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
  });

  test('should remove mission with matching key from misiones', () => {
    const key = stateWithMission.misiones[0].key;
    const result = mainReducer(stateWithMission, { type: DELETE_ITEM, payload: { key } });
    expect(result.misiones).toHaveLength(0);
  });

  test('should not modify state when key does not exist', () => {
    const result = mainReducer(stateWithMission, { type: DELETE_ITEM, payload: { key: 9999 } });
    expect(result.misiones).toHaveLength(stateWithMission.misiones.length);
  });

  test('should not decrement index when deleting a mission', () => {
    const key = stateWithMission.misiones[0].key;
    const result = mainReducer(stateWithMission, { type: DELETE_ITEM, payload: { key } });
    expect(result.index).toBe(stateWithMission.index);
  });

  test('should remove only the targeted mission when multiple missions exist', () => {
    const state2 = mainReducer(stateWithMission, {
      type: CALCULATE_ITEM,
      payload: { distancia: 400, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
    });
    const firstKey = state2.misiones[0].key;
    const result = mainReducer(state2, { type: DELETE_ITEM, payload: { key: firstKey } });
    expect(result.misiones).toHaveLength(1);
    expect(result.misiones[0].key).not.toBe(firstKey);
  });
});

describe('mainReducer — CLEAR_TABLE', () => {
  const stateWithMissions = mainReducer(
    mainReducer(initialState, {
      type: CALCULATE_ITEM,
      payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
    }),
    {
      type: CALCULATE_ITEM,
      payload: { distancia: 400, altura: 0, alturaPropia: 0, rumbo: 0, municion: 'ch0' }
    }
  );

  test('should reset misiones to empty array', () => {
    const result = mainReducer(stateWithMissions, { type: CLEAR_TABLE });
    expect(result.misiones).toEqual([]);
  });

  test('should set resultadosActuales to null', () => {
    const result = mainReducer(stateWithMissions, { type: CLEAR_TABLE });
    expect(result.resultadosActuales).toBeNull();
  });

  test('should not modify index when clearing table', () => {
    const result = mainReducer(stateWithMissions, { type: CLEAR_TABLE });
    expect(result.index).toBe(stateWithMissions.index);
  });

  test('should be idempotent when table is already empty', () => {
    const cleared = mainReducer(stateWithMissions, { type: CLEAR_TABLE });
    const clearedAgain = mainReducer(cleared, { type: CLEAR_TABLE });
    expect(clearedAgain.misiones).toEqual([]);
    expect(clearedAgain.resultadosActuales).toBeNull();
  });
});

describe('Mision entity — tipoFuego', () => {
  test('should have tipoFuego default value of directo', () => {
    const mision = new Mision({});
    expect(mision.tipoFuego).toBe('directo');
  });

  test('should preserve tipoFuego when passed in constructor data', () => {
    const mision = new Mision({ tipoFuego: 'indirecto' });
    expect(mision.tipoFuego).toBe('indirecto');
  });
});
