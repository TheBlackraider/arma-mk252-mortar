import React, { useEffect, useState } from "react";
import { recalculateItem, deleteItem } from "../../lib/main.actions";
import './Table.css'


export const TableRow = ({ item, dispatcher }) => {
    const [distancia, setDistancia] = useState(item.distancia);
    const [altura, setAltura] = useState(item.altura);
    const [rumbo, setRumbo] = useState(item.rumbo);
    const [denominacion, setDenominacion] = useState(item.denominacion || '');

    useEffect(() => {
        setDistancia(item.distancia);
        setAltura(item.altura);
        setRumbo(item.rumbo);
    }, [item.distancia, item.altura, item.rumbo]);

    useEffect(() => {
        setDenominacion(item.denominacion || '');
    }, [item.denominacion]);

    const handleRecalcular = (e) => {
        e.preventDefault();
        dispatcher(recalculateItem({ ...item, distancia, altura, rumbo, denominacion }));
    };

    const handleBorrar = (e) => {
        e.preventDefault();
        dispatcher(deleteItem(item.key));
    };

    return (
      <tr>
        <td className="td-actions">
          <button className="btn-action btn-action--recalc" onClick={handleRecalcular}>↺</button>
          <button className="btn-action btn-action--delete" onClick={handleBorrar}>✕</button>
        </td>
        <td>{item.alturaPropia}</td>
        <td className="td-denominacion">{denominacion || '—'}</td>
        <td>{item.municion?.toUpperCase()}</td>
        <td>
          <input
            className="td-input"
            type="number"
            value={distancia}
            onChange={e => setDistancia(Number(e.target.value))}
          />
        </td>
        <td>
          <input
            className="td-input"
            type="number"
            value={altura}
            onChange={e => setAltura(Number(e.target.value))}
          />
        </td>
        <td>
          <input
            className="td-input"
            type="number"
            value={rumbo}
            onChange={e => setRumbo(Number(e.target.value))}
          />
        </td>
        <td className="td-number">{item.resultado.toFixed(2)}</td>
        <td className="td-number">{item.azimuth.toFixed(2)}</td>
        <td className="td-number">{item.tiempo.toFixed(2)}s</td>
        <td>
          {item.tipoFuego === 'indirecto' && (
            <span className="badge badge-warning">INDIRECTO</span>
          )}
        </td>
      </tr>
    );
}
