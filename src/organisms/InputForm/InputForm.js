import React, { useReducer, useState, useEffect, useRef } from "react";

import NumberBox from "../../molecules/NumberBox/NumberBox";
import TextBox from "../../molecules/TextBox/TextBox";
import SelectBox from "../../molecules/SelectBox/SelectBox";
import { initialState, mainReducer } from "../../lib/main.reducer";
import IndirectFireForm from "./IndirectFireForm";

import "./InputForm.css";
import { calculateItem } from "../../lib/main.actions";
import Table from "../../molecules/Table/Table";


// ─── ChargeResultsPanel ───────────────────────────────────────────────────────

const ChargeResultsPanel = ({ resultadosActuales }) => {
  if (!resultadosActuales) return null;

  const cargas = ['ch0', 'ch1', 'ch2'];
  const recomendada  = cargas.find(c => resultadosActuales[c].recomendada);
  const enRangoOtras = cargas.filter(c =>
    !resultadosActuales[c].recomendada && !resultadosActuales[c].fuera_de_rango
  );
  const fueraDeRango = cargas.filter(c => resultadosActuales[c].fuera_de_rango);

  return (
    <div className="results-panel">
      <h3 className="results-panel__title">Resultados por carga</h3>
      <div className="results-panel__cards">
        {recomendada && (
          <div className="charge-card charge-card--recommended">
            <div className="charge-card__header">
              <span className="badge badge-success">RECOMENDADA</span>
              <span className="charge-card__name">{recomendada.toUpperCase()}</span>
            </div>
            <div className="charge-card__stat">
              <span className="charge-card__label">Elevación</span>
              <span className="charge-card__value">{resultadosActuales[recomendada].elevacion.toFixed(2)} mils</span>
            </div>
            <div className="charge-card__stat">
              <span className="charge-card__label">Tiempo</span>
              <span className="charge-card__value">{resultadosActuales[recomendada].tiempo.toFixed(2)} s</span>
            </div>
          </div>
        )}
        {enRangoOtras.map(charge => (
          <div key={charge} className="charge-card">
            <div className="charge-card__header">
              <span className="charge-card__name">{charge.toUpperCase()}</span>
            </div>
            <div className="charge-card__stat">
              <span className="charge-card__label">Elevación</span>
              <span className="charge-card__value">{resultadosActuales[charge].elevacion.toFixed(2)} mils</span>
            </div>
            <div className="charge-card__stat">
              <span className="charge-card__label">Tiempo</span>
              <span className="charge-card__value">{resultadosActuales[charge].tiempo.toFixed(2)} s</span>
            </div>
          </div>
        ))}
        {fueraDeRango.map(charge => (
          <div key={charge} className="charge-card charge-card--out-of-range">
            <div className="charge-card__header">
              <span className="charge-card__name">{charge.toUpperCase()}</span>
            </div>
            <div className="charge-card__stat">
              <span className="badge badge-danger">FUERA DE RANGO</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ─── InputForm ────────────────────────────────────────────────────────────────

const MILS_TO_DEGREES = 360 / 6400;

const InputForm = () => {

  const [state, dispatch] = useReducer(mainReducer, initialState);

  const [denominacion, setDenominacion] = useState('');
  const [municion, setMunicion] = useState('ch0');
  const [distancia, setDistancia] = useState(0);
  const [altura, setAltura] = useState(0);
  const [rumbo, setRumbo] = useState(0);
  const [alturaPropia, setAlturaPropia] = useState(0);

  const [resultado, setResultado] = useState(0);
  const [azimuth, setAzimuth] = useState(0);
  const [tiempo, setTiempo] = useState(0);

  const hasPreselected = useRef(false);

  const optionsMunicion = ["Ch0", "Ch1", "Ch2"];

  const handleClick = (event) => {
    event.preventDefault();
    const item = { alturaPropia, denominacion, municion, distancia, altura, rumbo };
    dispatch(calculateItem(item));
  };

  const handleIndirectCalculate = ({ distancia: dist, rumbo: rumMils, tipoFuego }) => {
    const rumbo = Math.round(rumMils * MILS_TO_DEGREES);
    dispatch(calculateItem({ alturaPropia, denominacion, municion, distancia: dist, altura, rumbo, tipoFuego }));
  };

  useEffect(() => {
    setResultado(state.resultadoActual);
    setAzimuth(state.azimuthActual);
    setTiempo(state.tiempoActual);
  }, [state.resultadoActual, state.azimuthActual, state.tiempoActual]);

  useEffect(() => {
    if (!state.resultadosActuales) {
      hasPreselected.current = false; // reset cuando se borra todo
      return;
    }
    if (hasPreselected.current) return; // ya se pre-seleccionó, no sobreescribir
    const recomendada = Object.keys(state.resultadosActuales)
      .find(charge => state.resultadosActuales[charge].recomendada);
    if (recomendada) {
      setMunicion(recomendada);
      hasPreselected.current = true;
    }
  }, [state.resultadosActuales]);

  return (
    <div className="form-layout">

      {/* ── Columna izquierda: formulario de entrada ── */}
      <section className="calc-card">
        <h2 className="calc-card__title">Parámetros de disparo</h2>

        <div className="form-field">
          <label className="form-label">Altura Propia</label>
          <NumberBox name="alturaPropia" placeholder="Altura del arma" value={alturaPropia} onChange={setAlturaPropia} />
        </div>

        <form className="input-form" data-testid="input-form">
          <div className="form-field">
            <label className="form-label">Denominación</label>
            <TextBox name="denominacion" placeholder="Denominacion del objetivo" value={denominacion} onChange={setDenominacion} />
          </div>
          <div className="form-field">
            <label className="form-label">Munición</label>
            <SelectBox name="municion" placeholder="Tipo de municion" options={optionsMunicion} value={municion} onChange={setMunicion} disabled={!state.resultadosActuales} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Distancia (m)</label>
              <NumberBox name="distancia" placeholder="Distancia" value={distancia} onChange={setDistancia} />
            </div>
            <div className="form-field">
              <label className="form-label">Altura (m)</label>
              <NumberBox name="altura" placeholder="Altura obj." value={altura} onChange={setAltura} />
            </div>
            <div className="form-field">
              <label className="form-label">Rumbo (°)</label>
              <NumberBox name="rumbo" placeholder="Rumbo" value={rumbo} onChange={setRumbo} />
            </div>
          </div>
          <button className="btn-primary btn-full" onClick={handleClick}>Calcular</button>
        </form>

        {state.resultadosActuales && (
          <div className="resultado-actual">
            <div className="resultado-actual__item">
              <span className="resultado-actual__label">Elevación</span>
              <span className="resultado-actual__value">{resultado.toFixed(2)} mils</span>
            </div>
            <div className="resultado-actual__item">
              <span className="resultado-actual__label">Azimuth</span>
              <span className="resultado-actual__value">{azimuth.toFixed(2)} mils</span>
            </div>
            <div className="resultado-actual__item">
              <span className="resultado-actual__label">Tiempo vuelo</span>
              <span className="resultado-actual__value">{tiempo.toFixed(2)} s</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Columna derecha: resultados por carga ── */}
      <div className="right-column">
        <ChargeResultsPanel resultadosActuales={state.resultadosActuales} />
        <IndirectFireForm onCalculate={handleIndirectCalculate} />
      </div>

      {/* ── Historial de misiones ── */}
      <section className="table-section">
        <Table dispatcher={dispatch} state={state} />
      </section>

    </div>
  );
};

export default InputForm;
