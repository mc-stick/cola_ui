import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  SquareUserRoundIcon,
  UserIcon,
} from "lucide-react";
import API from "../services/api";
import AnimatedBubleBackground from "../components/common/animBubbles";
import { useNavigate } from "react-router-dom";

function LoginComponent({ onLoginSuccess, tipoUsuario = "operador" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState(null);
  const [viewpass, setViewPass] = useState(false);

  const navigate = useNavigate();
  const UCNE_URL = import.meta.env.VITE_UCNE_URL;

  // Definición de colores de la paleta para uso rápido
  const colors = {
    primaryBlue: "#1e2a4f",
    primaryRed: "#cc132c",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    monoGold: "#daab00",
    monoSilver: "#b2b2b2",
    secondaryBlueDark: "#006ca1"
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configData] = await Promise.all([API.getConfiguracion()]);
        setConfig(configData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await API.login(username, password);
      if (!result.success) {
        setError("Credenciales inválidas");
        setLoading(false);
        return;
      }

      const user = result.user;
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.rol);

      switch (user.rol) {
        case "admin":
          navigate("/admin", { replace: true });
          window.location.reload();
          break;
        case "operador":
          navigate("/operador", { replace: true });
          window.location.reload();
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error login:", error);
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col blue-overlay overflow-hidden bg-slate-50">
      <AnimatedBubleBackground />

      <div id="pswrapper" className="flex-grow flex items-center justify-center">
        <form onSubmit={handleLogin}>
          <div className="book-container shadow-2xl flex overflow-hidden rounded-2xl">
            
            {/* Lado Izquierdo - Azul Primario con Logo */}
            <div 
              className="welcome-page p-10 flex flex-col items-center justify-center text-white"
              style={{ backgroundColor: colors.primaryBlue }}
            >
              <div className="welcome-content text-center">
                <h1 aria-label=" Sign-in">
                  <img
                    src={"images/Final-08.png"}
                    className="ps-staticimg max-w-[200px]"
                    alt="imagen logo"
                    title="logo"
                  />
                </h1>
                <h2 className="mt-10 text-3xl font-bold">Bienvenidos</h2>
                <p className="mt-2 opacity-80">Gestión de colas y tickets</p>
                <div 
                    className="h-1 w-16 mx-auto mt-4" 
                    style={{ backgroundColor: colors.primaryYellow }}
                ></div>
              </div>
            </div>

            {/* Lado Derecho - Formulario Blanco */}
            <div className="login-page p-10 min-w-[350px]">
              {error && (
                <div 
                  className="flex flex-col items-center p-3 rounded-lg text-center mb-4 border"
                  style={{ backgroundColor: `${colors.primaryRed}10`, borderColor: colors.primaryRed }}
                >
                  <AlertTriangleIcon style={{ color: colors.primaryRed }} className="mb-1" />
                  <p className="text-sm font-semibold" style={{ color: colors.primaryRed }}>
                    El ID de usuario o la contraseña no son válidos.
                  </p>
                </div>
              )}

              <div className="w-full flex flex-col items-center mb-8">
                <SquareUserRoundIcon 
                  className="w-20 h-20 mb-4" 
                  style={{ color: error ? colors.primaryRed : colors.primaryBlue }} 
                />
                <h2 className="text-xl font-bold tracking-tight" style={{ color: colors.primaryBlue }}>
                  INICIAR SESIÓN
                </h2>
              </div>

              <div className="login-content space-y-4">
                {/* Input Usuario */}
                <div className="relative">
                  <label 
                    htmlFor="userid" 
                    className="block text-xs font-bold uppercase mb-1 text-gray-700"
                    
                  >
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      id="userid"
                      className="w-full border-b-2 p-2 pr-10 outline-none transition-colors focus:border-blue-500"
                      style={{ borderBottomColor: colors.monoSilver }}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                    <UserIcon className="w-5 h-5 absolute right-2 bottom-2" style={{ color: colors.primaryBlue }} />
                  </div>
                </div>

                {/* Input Contraseña */}
                <div className="relative">
                  <label 
                    htmlFor="pwd" 
                    className="block text-xs font-bold uppercase mb-1 text-gray-700"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="pwd"
                      type={viewpass ? "text" : "password"}
                      className="w-full border-b-2 p-2 pr-10 outline-none transition-colors focus:border-blue-500"
                      style={{ borderBottomColor: colors.monoSilver }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setViewPass(!viewpass)}
                      className="absolute right-2 bottom-2"
                    >
                      {viewpass ? (
                        <EyeIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <EyeOffIcon className="w-5 h-5" style={{ color: colors.primaryBlue }} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 mt-10 shadow-lg"
                style={{ 
                    backgroundColor: colors.primaryBlue,
                    opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <footer
        style={{ 
            backgroundColor: colors.primaryBlue,
            borderTop: `4px solid ${colors.primaryYellow}` 
        }}
        className="text-white h-[60px] w-full flex items-center justify-center z-10"
      >
        <p className="text-sm">
          Copyright © {new Date().getFullYear()}{" "}
          <strong style={{ color: colors.primaryYellow }}>Gestión de colas v1.2.2</strong>{" "}
          <a
            href={UCNE_URL}
            className="underline transition-colors m-2 hover:text-white"
            style={{ color: colors.secondaryBlueLight }}
          >
            UCNE
          </a>
        </p>
      </footer>
    </div>
  );
}

export default LoginComponent;