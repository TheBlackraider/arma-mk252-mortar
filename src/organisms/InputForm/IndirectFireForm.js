import React, { useState } from 'react';
import { triangulateObserver } from '../../lib/main.reducer';

function IndirectFireForm({ onCalculate }) {
  const [d_mo, setD_mo] = useState('');
  const [rumbo_mo, setRumbo_mo] = useState('');
  const [d_oo, setD_oo] = useState('');
  const [rumbo_relativo_oo, setRumbo_relativo_oo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = triangulateObserver({
      d_mo: Number(d_mo),
      rumbo_mo: Number(rumbo_mo),
      d_oo: Number(d_oo),
      rumbo_relativo_oo: Number(rumbo_relativo_oo),
    });
    onCalculate({ distancia: result.distancia, rumbo: result.rumbo, tipoFuego: 'indirecto' });
  };

  return (
    <form className="indirect-fire-card" onSubmit={handleSubmit}>
      <h3>Fuego Indirecto por Observador</h3>
      <div className="indirect-row">
        <label>
          Dist. Mortero→Obs (m)
          <input type="number" value={d_mo} onChange={e => setD_mo(e.target.value)} placeholder="0" />
        </label>
        <label>
          Rumbo Mortero→Obs (mils)
          <input type="number" value={rumbo_mo} onChange={e => setRumbo_mo(e.target.value)} placeholder="0" />
        </label>
        <label>
          Dist. Obs→Objetivo (m)
          <input type="number" value={d_oo} onChange={e => setD_oo(e.target.value)} placeholder="0" />
        </label>
        <label>
          Rumbo relativo Obs→Obj (mils)
          <input type="number" value={rumbo_relativo_oo} onChange={e => setRumbo_relativo_oo(e.target.value)} placeholder="0" />
        </label>
      </div>
      <button type="submit" className="btn-primary">Calcular Indirecto</button>
    </form>
  );
}

export default IndirectFireForm;
