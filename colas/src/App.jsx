import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  const [paso, setPaso] = useState(1);
  const [runTour, setRunTour] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    let finished = false;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();

        // ❌ API falla → ir a 404
        if (!data.ok && location.pathname !== "/404") {
          navigate("/404");
        }

        // ✅ API vuelve → salir de 404
        if (data.ok && location.pathname === "/404") {
          navigate("/login");
        }
      } catch {
        if (location.pathname !== "/404") {
          navigate("/404");
        }
      } finally {
        if (!finished) {
          finished = true;
          setLoading(false);
        }
      }
    };

    checkHealth();

    // ⏱️ máximo 5s loader
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        setLoading(false);
      }
    }, 5000);

    // 🔄 recargar SOLO si estás en /404
    const reloadInterval = setInterval(() => {
      if (location.pathname === "/404") {
        window.location.reload();
      }
    }, 15000);

    // 🧠 bloquear clic derecho / selección
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectstart", handleSelectStart);

    return () => {
      clearTimeout(timeout);
      clearInterval(reloadInterval);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("selectstart", handleSelectStart);
    };
  }, [navigate, location.pathname]);

  /* ============================= */
  /* ⏳ LOADER GLOBAL */
  /* ============================= */
  if (loading) {
    return (
      <div className="flex">
        <Spinner />
      </div>
    );
  }

  /* ============================= */
  /* 🚀 APP */
  /* ============================= */
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
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/anuncios" element={<PantallaAnuncios />} />
        <Route path="/evaluar/:id" element={<EvaluacionTicket />} />
        <Route path="/cliente" element={<PantallaCliente />} />
        <Route path="/404" element={<NotFound />} />

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
    </div>
  );
}

export default App;