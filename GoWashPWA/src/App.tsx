import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Ingreso from './pages/Ingreso';
import GenerarQR from './pages/GenerarQR';
import Retiro from './pages/Retiro';
import Vehiculos from './pages/Vehiculos';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="ingreso" element={<Ingreso />} />
          <Route path="generar-qr" element={<GenerarQR />} />
          <Route path="retiro" element={<Retiro />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
