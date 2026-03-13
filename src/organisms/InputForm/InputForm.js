import React, { useReducer, useState, useEffect } from "react";

import NumberBox from "../../molecules/NumberBox/NumberBox";
import TextBox from "../../molecules/TextBox/TextBox";
import SelectBox from "../../molecules/SelectBox/SelectBox";
import { initialState, mainReducer } from "../../lib/main.reducer";

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
    <div className="resultados-cargas">
      <h3>Resultados por carga</h3>
      {recomendada && (
        <div className="carga-recomendada-principal">
          <span className="badge-recomendada">RECOMENDADA</span>
          <span>{recomendada.toUpperCase()}</span>
          <span>Elev: {resultadosActuales[recomendada].elevacion.toFixed(2)} mils</span>
          <span>Tiempo: {resultadosActuales[recomendada].tiempo.toFixed(2)}s</span>
        </div>
      )}
      {enRangoOtras.length > 0 && (
        <div className="otras-cargas-en-rango">
          <h4>Otras opciones en rango</h4>
          {enRangoOtras.map(charge => (
            <div key={charge} className="carga-row secundaria">
              <span>{charge.toUpperCase()}</span>
              <span>Elev: {resultadosActuales[charge].elevacion.toFixed(2)} mils</span>
              <span>Tiempo: {resultadosActuales[charge].tiempo.toFixed(2)}s</span>
            </div>
          ))}
        </div>
      )}
      {fueraDeRango.map(charge => (
        <div key={charge} className="carga-row fuera-de-rango">
          <span>{charge.toUpperCase()}</span>
          <span>FUERA DE RANGO</span>
        </div>
      ))}
    </div>
  );
};


// ─── InputForm ────────────────────────────────────────────────────────────────

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

  const optionsMunicion = ["Ch0", "Ch1", "Ch2"];

  const handleClick = (event) => {
    event.preventDefault();
    const item = { alturaPropia, denominacion, municion, distancia, altura, rumbo };
    dispatch(calculateItem(item));
  };

  useEffect(() => {
    setResultado(state.resultadoActual);
    setAzimuth(state.azimuthActual);
    setTiempo(state.tiempoActual);
  }, [state.resultadoActual, state.azimuthActual, state.tiempoActual]);

  useEffect(() => {
    if (!state.resultadosActuales) return;
    const recomendada = Object.keys(state.resultadosActuales)
      .find(charge => state.resultadosActuales[charge].recomendada);
    if (recomendada) setMunicion(recomendada);
  }, [state.resultadosActuales]);

  return (
    <>
      <div>
        <NumberBox name="alturaPropia" label="Altura Propia" placeholder="Altura del arma" value={alturaPropia} onChange={setAlturaPropia} />

        <form className="input-form">
          <TextBox name="denominacion" label="Denominacion" placeholder="Denominacion del objetivo" value={denominacion} onChange={setDenominacion} />
          <SelectBox name="municion" label="Municion" placeholder="Tipo de municion" options={optionsMunicion} value={municion} onChange={setMunicion} disabled={!state.resultadosActuales} />
          <NumberBox name="distancia" label="Distancia" placeholder="Distancia al objetivo" value={distancia} onChange={setDistancia} />
          <NumberBox name="altura" label="Altura" placeholder="Altura del objetivo" value={altura} onChange={setAltura} />
          <NumberBox name="rumbo" label="Rumbo" placeholder="Rumbo al objetivo" value={rumbo} onChange={setRumbo} />
          <button onClick={handleClick}>Calcular</button>
        </form>

        <div className="resultado-actual">
          <p><strong>Elevación (mils):</strong> {resultado.toFixed(2)}</p>
          <p><strong>Azimuth (mils):</strong> {azimuth.toFixed(2)}</p>
          <p><strong>Tiempo de vuelo (s):</strong> {tiempo.toFixed(2)}</p>
        </div>

        <ChargeResultsPanel resultadosActuales={state.resultadosActuales} />
      </div>
      <div>
        <Table dispatcher={dispatch} state={state} />
      </div>
    </>
  );
};

export default InputForm;
