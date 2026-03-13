export class Mision {

  static DEFAULT_VALUES = {
    key: 0,
    alturaPropia: 0,
    azimuth: 0,
    denominacion: "",
    municion: "",
    distancia: 0,
    altura: 0,
    resultado: 0,
    rumbo: 0,
    tiempo: 0,
    tipoFuego: 'directo',
  };

  constructor(data = {}) {
    const config = { ...Mision.DEFAULT_VALUES, ...data };
    
    this.key = config.key;
    this.alturaPropia = this.parseNumericValue(config.alturaPropia);
    this.azimuth = this.parseNumericValue(config.azimuth);
    this.denominacion = config.denominacion;
    this.municion = config.municion;
    this.distancia = this.parseNumericValue(config.distancia);
    this.altura = this.parseNumericValue(config.altura);
    this.resultado = this.parseNumericValue(config.resultado);
    this.rumbo = this.parseNumericValue(config.rumbo);
    this.tiempo = this.parseNumericValue(config.tiempo, false); // false to keep decimals
    this.tipoFuego = config.tipoFuego || 'directo';
  }

  parseNumericValue(value, floor = true) {
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(parsed)) return 0;
    return floor ? Math.floor(parsed) : parsed;
  }
}
