import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import MenuInicial from "./pages/MenuInicial";
import PantallaAnuncios from "./pages/PantallaAnuncios";
import PantallaCliente from "./pages/PantallaCliente";
import PantallaAdmin from "./pages/PantallaAdmin";
import PantallaOperador from "./pages/PantallaOperador";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SelectorGuia from "./helpers/GuiaSelect";
import { EvaluacionTicket } from "./components/common/Rating";
import "./App.css";
import LoginComponent from "./pages/Login";

/* ============================= */
/* 🔐 RUTA PROTEGIDA */
/* ============================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ============================= */
/* 🔄 REDIRECCIÓN AUTOMÁTICA HOME */
/* ============================= */
const HomeRedirect = () => {
  const role = localStorage.getItem("role");

  if (role === "admin" || role === "S_admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "operador") {
    return <Navigate to="/operador" replace />;
  }

  if (role === "user") {
    return <Navigate to="/cliente" replace />;
  }

  return <MenuInicial />;
};

function App() {
  const [paso, setPaso] = useState(1);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectstart", handleSelectStart);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  return (
    <div className="bg-primary font-karla">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
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
          <Route path="/login" element={<LoginComponent />} />

          <Route path="/anuncios" element={<PantallaAnuncios />} />
          <Route path="/evaluar/:id" element={<EvaluacionTicket />} />

          <Route path="/cliente" element={<PantallaCliente />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "S_admin"]}>
                <PantallaAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operador"
            element={
              <ProtectedRoute allowedRoles={["operador"]}>
                <PantallaOperador />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
