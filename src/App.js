import './App.css';
import InputForm from './organisms/InputForm/InputForm';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>MK252 Mortar Calculator</h1>
        <p>ARMA 3 — Calculadora de mortero de precisión</p>
      </header>
      <main className="app-main">
        <InputForm />
      </main>
    </div>
  );
}

export default App;
