import React from "react";
import { TableRow } from "./TableRow";
import './Table.css'

const Table = ({ dispatcher, state }) => {

    return (
      <table className='table'>
      <thead>
        <tr>
          <th></th>
          <th>Altura Propia</th>
          <th>Denominacion</th>
          <th>Municion</th>
          <th>Distancia</th>
          <th>Altura</th>
          <th>Rumbo</th>
          <th>Elevacion</th>
          <th>Azimuth</th>
          <th>Tiempo (s)</th>
          
        </tr>
      </thead>
      <tbody>
        {state.misiones.map((item) => (
          <TableRow key={item.key} item={item} dispatcher={dispatcher} />
        ))}
      </tbody>
      </table>
    )
  }

  export default Table;

  
            
            
            
            