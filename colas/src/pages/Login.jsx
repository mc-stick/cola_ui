import { useState } from "react";
import { UserCircle } from "lucide-react";
import API from "../services/api";
import { SendTwilioSms } from "../twilio/TwMsg";

/**
 * Componente de Login reutilizable
 * @param {Object} props
 * @param {Function} props.onLoginSuccess - Callback cuando el login es exitoso. Recibe (usuario, serviciosAsignados)
 * @param {string} props.tipoUsuario - 'operador' o 'admin' para personalizar el título
 */
function LoginComponent({ onLoginSuccess, tipoUsuario = "operador" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await API.login(username, password);

      if (result.success) {
        // Verificar que el usuario tenga el rol correcto
        if (tipoUsuario === "admin" && result.user.rol !== "admin") {
          setError("No tienes permisos de administrador");
          setLoading(false);
          return;
        }

        if (tipoUsuario === "operador" && result.user.rol !== "operador") {
          setError("No tienes permisos de operador");
          setLoading(false);
          return;
        }

        // Si es operador, cargar servicios asignados
        let serviciosAsignados = [];
        if (tipoUsuario === "operador") {
          const servicios = await API.getOperadorServicios(result.user.id);
          serviciosAsignados = servicios.filter((s) => s.asignado);
        }

        // Llamar al callback de éxito
        onLoginSuccess(result.user, serviciosAsignados);
      } else {
        setError("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPass = async (e) => {
    e.preventDefault();
    //setLoading(true);
    setError("");

    if (username.trim() === "") {
      setError("Ingresa un nombre se usuario para continuar.");
      return;
    }

    if (!confirm("¿Deseas restablecer tu contraseña?\nEsta opcion no de puede deshacer, ¿deseas continuar?")) {
      return;
    }
    if (!confirm("Se enviará la clave de acceso a tu número de teléfono.")) {
      return;
    }

    try {
      const result = await API.getUsuariosForgot(username);
      if (result) {
        const pass = Math.random().toString(36).slice(-8);
       
        const res = await API.getUsuariosForgotPass(username, pass);
       
        SendTwilioSms(
          `Notificaciones UCNE.\n\n¡Parece que tu clave de acceso a la plataforma de colas ha sido restablecida!\n 
          Nueva clave de acceso: ${pass}`,
          result.tel
        );
      } 
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getTitulo = () => {
    return tipoUsuario === "admin" ? "Acceso Administrador" : "Acceso Operador";
  };

  const getColorGradient = () => {
    return tipoUsuario === "admin"
      ? "from-orange-700 to-orange-900"
      : "from-blue-700 to-blue-900";
  };

  const getColorAccent = () => {
    return tipoUsuario === "admin" ? "orange" : "blue";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getColorGradient()} flex items-center justify-center p-8`}>
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <div
            className={`bg-${getColorAccent()}-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{getTitulo()}</h2>
          <p className="text-gray-600 mt-2">Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              placeholder="Ingresa tu usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-${getColorAccent()}-600 hover:bg-${getColorAccent()}-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors`}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        
          <div className="mt-6 text-center">
            <button
              className="text-sm text-blue-600 underline"
              onClick={handleForgetPass}>
              Olvidé mi contraseña
            </button>
          </div>
        
      </div>
    </div>
  );
}

export default LoginComponent;
