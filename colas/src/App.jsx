import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuInicial from "./pages/MenuInicial";
import PantallaAnuncios from "./pages/PantallaAnuncios";
import PantallaCliente from "./pages/PantallaCliente";
import PantallaAdmin from "./pages/PantallaAdmin";
import PantallaOperador from "./pages/PantallaOperador";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import SelectorGuia from "./helpers/GuiaSelect";
import { EvaluacionTicket } from "./components/common/Rating";

function App() {
  useEffect(() => {
    // Bloquear clic derecho
    const handleContextMenu = (e) => e.preventDefault();
    
    // Bloquear inicio de selección
    const handleSelectStart = (e) => {
      // Solo permitimos selección si el objetivo es un input o textarea
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('selectstart', handleSelectStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const [paso, setPaso] = useState(1);
  const [runTour, setRunTour] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Funciones de manejo...
  const handleStartTour = () => {
    setIsModalOpen(false);
    setTimeout(() => setRunTour(true), 300);
  };

  return (
    <div>
      <div id="center-ghost-element"></div>

       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        pauseOnHover
        theme="light"
      />
      <SelectorGuia 
        activar={runTour} 
        setActivar={setRunTour} 
        pasoActual={paso} 
      />
      <BrowserRouter basename="/cola/">
        <Routes>
          <Route path="/" element={<MenuInicial />} />

          <Route path="/anuncios" element={<PantallaAnuncios />} />
          <Route path="/evaluar/:id" element={<EvaluacionTicket />} />
          <Route path="/cliente" element={<PantallaCliente />} />
          <Route path="/admin" element={<PantallaAdmin />} />
          <Route path="/operador" element={<PantallaOperador />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
