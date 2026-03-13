import React from "react";
import { TableRow } from "./TableRow";
import { clearTable } from "../../lib/main.actions";
import './Table.css'

const Table = ({ dispatcher, state }) => {

    return (
      <div className="table-wrapper">
        <div className="table-header">
          <h2 className="table-title">Historial de misiones</h2>
          <button className="btn-danger" onClick={() => dispatcher(clearTable())}>Borrar todo</button>
        </div>
        <table className='mission-table'>
          <thead>
            <tr>
              <th>Acciones</th>
              <th>Altura Propia</th>
              <th>Denominacion</th>
              <th>Municion</th>
              <th>Distancia</th>
              <th>Altura Obj.</th>
              <th>Rumbo</th>
              <th>Elevacion</th>
              <th>Azimuth</th>
              <th>Tiempo (s)</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {state.misiones.map((item) => (
              <TableRow key={item.key} item={item} dispatcher={dispatcher} />
            ))}
          </tbody>
        </table>
        {state.misiones.length === 0 && (
          <p className="table-empty">No hay misiones registradas</p>
        )}
      </div>
    );
  }

  export default Table;
