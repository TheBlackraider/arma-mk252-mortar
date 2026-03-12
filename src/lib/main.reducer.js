import { GET_ALL_ITEMS, CALCULATE_ITEM } from './main.actions';
import { Mision } from '../data/mision.entity';
import Charge0 from '../data/Charge0';
import Charge1 from '../data/Charge1';
import Charge2 from '../data/Charge2';

const AZIMUTH_MULTIPLIER = 17.777778;
export const findBaseCharge = (chargeTable, distance) => {
  if (!chargeTable || chargeTable.length === 0) {
    return { range: -Infinity };
  }

  if (!distance) {
    return chargeTable[0];
  }

  // Find the largest range that's less than or equal to the target distance
  const baseCharge = chargeTable.reduce((prev, current) => {
    if (current.range <= distance) {
      return current;
    }
    return prev;
  }, chargeTable[0]);

  return baseCharge;
};

export const initialState = {
    misiones: [],
    index: 1,
    alturaPropiaActual: 0,
    resultadoActual: 0,
    azimuthActual: 0,
    tiempoActual: 0,
};

export const getChargeForDistance = (distance) => {
  const numDistance = parseInt(distance, 10);
  if (numDistance <= 400) return 'ch0';
  if (numDistance <= 1500) return 'ch1';
  return 'ch2';
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

export const getOptimalCharge = (distance, results) => {
    if (distance < 500) return results[2];  // Charge0
    if (distance < 2000) return results[0]; // Charge1
    return results[1];                      // Charge2
};

export const mainReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_ITEMS:
            return { ...state };

        case CALCULATE_ITEM: {
          console.log("CALCULATE_ITEM action received:", action.payload);
          const municionTypes = ["ch0", "ch1", "ch2"];
          const chargeTables = [Charge0, Charge1, Charge2];
          
          const item = new Mision(action.payload);
          item.key = state.index;
          item.azimuth = item.rumbo * AZIMUTH_MULTIPLIER;
      
          // Get the charge index based on selected munition type
          const selectedChargeIndex = municionTypes.indexOf(item.municion);
          
          if (selectedChargeIndex === -1) {
              // Handle invalid munition type
              console.error("Invalid munition type selected:", item.municion);
              return state;
          }
      
          // Calculate result only for the selected charge
          const result = calculateMission(
              item, 
              selectedChargeIndex, 
              chargeTables[selectedChargeIndex], 
              municionTypes
          );
      
          console.log("Calculated result:", result);
          return {
              ...state,
              resultadoActual: result.resultado,
              azimuthActual: result.azimuth,
              tiempoActual: result.tiempo,
              misiones: [...state.misiones, result],
              index: state.index + 1,
          };
      }
          

        default:
            return state;
    }
};
