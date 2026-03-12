import React, { useReducer, useState, useEffect } from "react";


import NumberBox from "../../molecules/NumberBox/NumberBox";
import TextBox from "../../molecules/TextBox/TextBox";
import SelectBox from "../../molecules/SelectBox/SelectBox";
import { initialState, mainReducer } from "../../lib/main.reducer";

import "./InputForm.css";
import { calculateItem } from "../../lib/main.actions";
import Table from "../../molecules/Table/Table";


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

    event.preventDefault(); // Evita que la página se recargue

    const item = { alturaPropia, denominacion, municion, distancia, altura, rumbo };
    
    dispatch(calculateItem(item));

  }

  useEffect(() => {
    setResultado(state.resultadoActual);
    setAzimuth(state.azimuthActual);
    setTiempo(state.tiempoActual);
  }, [state.resultadoActual, state.azimuthActual, state.tiempoActual]);

    return (
      <>
        <div>
          <NumberBox name="alturaPropia" label="Altura Propia" placeholder="Altura del arma" value={alturaPropia} onChange={setAlturaPropia} />

          <form className="input-form">
            <TextBox name="denominacion" label="Denominacion" placeholder="Denominacion del objetivo" value={denominacion} onChange={setDenominacion} />
            <SelectBox name="municion" label="Municion" placeholder="Tipo de municion" options={optionsMunicion} value={municion} onChange={setMunicion} />
            <NumberBox name="distancia" label="Distancia" placeholder="Distancia al objetivo" value={distancia} onChange={setDistancia} />
            <NumberBox name="altura" label="Altura" placeholder="Altura del objetivo" value={altura} onChange={setAltura} />
            <NumberBox name="rumbo" label="Rumbo" placeholder="Rumbo al objetivo" value={rumbo} onChange={setRumbo} />

            <button onClick={handleClick}>Calcular</button>
          </form>
          <p>{ resultado }</p>
          <p>{ azimuth }</p>
        </div>
        <div>
          <Table  dispatcher={dispatch} state={state}/>
        </div>
      </>
    );
}

export default InputForm;