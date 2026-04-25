import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";

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
import NotFound from "./components/common/404";
import { Spinner } from "./components/loading";

/* ============================= */
/* 🔐 RUTA PROTEGIDA */
/* ============================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
};

/* ============================= */
/* 🔄 REDIRECCIÓN AUTOMÁTICA HOME */
/* ============================= */
const HomeRedirect = () => {
  const role = localStorage.getItem("role");

  if (role === "admin" || role === "S_admin")
    return <Navigate to="/admin" replace />;
  if (role === "operador") return <Navigate to="/operador" replace />;
  if (role === "user") return <Navigate to="/cliente" replace />;

  return <MenuInicial />;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);
  const [paso, setPaso] = useState(1);
  
  // 📍 Guardamos la última ruta válida antes del error
  const lastValidPath = useRef(window.location.pathname);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();

        if (data.ok) {
         
          if (location.pathname === "/404") {
            const destination = lastValidPath.current === "/404" ? "/" : lastValidPath.current;
            navigate(destination, { replace: true });
          } else {
            
            lastValidPath.current = location.pathname;
          }
        } else {
          if (location.pathname !== "/404") {
            lastValidPath.current = location.pathname; 
            navigate("/404", { replace: true });
          }
        }
      } catch (error) {
        if (location.pathname !== "/404") {
          lastValidPath.current = location.pathname;
          navigate("/404", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkHealth();

    const healthInterval = setInterval(checkHealth, 3000); 

    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectstart", handleSelectStart);

    return () => {
      clearInterval(healthInterval);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("selectstart", handleSelectStart);
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="font-karla">
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

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/anuncios" element={<PantallaAnuncios />} />
        <Route path="/evaluar/:id" element={<EvaluacionTicket />} />
        <Route path="/cliente" element={<PantallaCliente />} />
        <Route path="/404" element={<NotFound />} />

        <Route
          path="/admin"
          element={
            // <ProtectedRoute allowedRoles={["admin", "S_admin"]}>
              <PantallaAdmin />
            // </ProtectedRoute>
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

        {/* Cambiado Navigate a /404 o login según prefieras */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;