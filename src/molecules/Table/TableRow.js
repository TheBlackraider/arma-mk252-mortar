import React, { useEffect, useState } from "react";

import NumberBox from "../../molecules/NumberBox/NumberBox";
import SelectBox from "../../molecules/SelectBox/SelectBox";

import { calculateItem } from "../../lib/main.actions";import './Table.css'


  export const TableRow = ({ item, dispatcher }) => {
    const optionsMunicion = ["Ch0", "Ch1", "Ch2"];

    const [denominacion, setDenominacion] = useState('');
    const [municion, setMunicion] = useState('');
    const [distancia, setDistancia] = useState(0);
    const [altura, setAltura] = useState(0);
    const [rumbo, setRumbo] = useState(0);
    const [alturaPropia, setAlturaPropia] = useState(0);


    useEffect(() => {
        setAlturaPropia(item.alturaPropia);
        setDenominacion(item.denominacion);
        setMunicion(item.municion);
        setDistancia(item.distancia);
        setAltura(item.altura);
        setRumbo(item.rumbo);

    }, [item.alturaPropia, item.denominacion, item.municion, item.distancia, item.altura, item.rumbo]);

    const handleClick = (event) => {
        event.preventDefault();
        const itemChanged = { key: item.key, alturaPropia, denominacion, municion, distancia, altura, rumbo}
        dispatcher(calculateItem(itemChanged));
    }
   
    return (
      <tr key={item.key}>
        <td><button onClick={(e) => handleClick(e)}>Recalcular</button></td>
        <td><NumberBox name="alturaPropia" label="Altura Propia" placeholder="Altura del arma" value={alturaPropia} onChange={setAlturaPropia} /></td>
        <td>{denominacion}</td>
        <td><SelectBox name="municion" label="Municion" placeholder="Tipo de municion" options={optionsMunicion} value={municion} onChange={setMunicion} /></td>
        <td><NumberBox name="distancia" label="Distancia" placeholder="Distancia al objetivo" value={item.distancia} onChange={setDistancia} /></td>
        <td><NumberBox name="altura" label="Altura" placeholder="Altura del objetivo" value={item.altura} onChange={setAltura} /></td>
        <td><NumberBox name="rumbo" label="Rumbo" placeholder="Rumbo al objetivo" value={item.rumbo} onChange={setRumbo} /></td>
        <td>{item.resultado.toFixed(2)}</td>
        <td>{item.azimuth.toFixed(2)}</td>
        <td>{item.tiempo.toFixed(2)}s</td>
      </tr>   
    );
}

