import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuInicial from './pages/MenuInicial';
import PantallaAnuncios from './pages/PantallaAnuncios';
import PantallaCliente from './pages/PantallaCliente';
import PantallaAdmin from './pages/PantallaAdmin';
import PantallaOperador from './pages/PantallaOperador';

function App() {
  return (
    <BrowserRouter basename="/cola/">
      <Routes>
        <Route path="/" element={<MenuInicial />} />
        <Route path="/anuncios" element={<PantallaAnuncios />} />
        <Route path="/cliente" element={<PantallaCliente />} />
        <Route path="/admin" element={<PantallaAdmin />} />
        <Route path="/operador" element={<PantallaOperador />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;