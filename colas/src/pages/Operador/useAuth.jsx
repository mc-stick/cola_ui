import { useState, useEffect } from "react";
import API from "../../services/api";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  const restaurarSesion = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const result = await API.getCurrentUser();

        if (result.success && result.user.rol === "operador") {
          setUsuario(result.user);
          console.log(result.user,"result await")

          const servicios = await API.getOperadorServicios(result.user.id);
          const asignados = servicios.filter((s) => s.asignado);
          setServiciosAsignados(asignados);

          return result.user;
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error restaurando sesión:", error);
        localStorage.removeItem("token");
      }
    }
    return null;
  };

  const handleLoginSuccess = (user, servicios) => {
     setUsuario(user);
    setServiciosAsignados(servicios);
    restaurarSesion();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    setServiciosAsignados([]);
  };

  useEffect(() => {
    restaurarSesion();
  }, []);

  return {
    usuario,
    serviciosAsignados,
    handleLoginSuccess,
    handleLogout,
    restaurarSesion,
  };
};