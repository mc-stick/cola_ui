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
  const UCNE_URL = import.meta.env.URL_REDIRECT;

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
      
      // Mapear números de rol a nombres
      const roleMap = {
        "1": "admin",
        "2": "operador",
        "3": "user"
      };
      
      const roleName = roleMap[user.rol] || "user";
      localStorage.setItem("role", roleName);

      // Navegar según el rol
      if (roleName === "admin") {
        navigate("/admin", { replace: true });
        window.location.reload();
      } else if (roleName === "operador") {
        navigate("/operador", { replace: true });
        window.location.reload();
      } else {
        navigate("/cliente", { replace: true });
      }
    } catch (error) {
      console.error("Error login:", error);
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex flex-col blue-overlay overflow-hidden bg-slate-50">
    <AnimatedBubleBackground />

    <div
      id="pswrapper"
      className="flex-grow flex items-center justify-center px-4"
    ><form onSubmit={handleLogin}>
  <div
    className="book-container shadow-2xl flex overflow-hidden rounded-[1.5rem] scale-[0.82] origin-center max-w-[760px]"
  >

    {/* Lado Izquierdo */}
    <div
      className="welcome-page px-8 py-7 flex flex-col items-center justify-center text-white min-w-[230px]"
      style={{ backgroundColor: colors.primaryBlue }}
    >
            <div className="welcome-content text-center">
              <h1 aria-label="Sign-in">
                <img
                  src={"images/Final-08.png"}
                  className="ps-staticimg max-h-[250px] mx-auto"
                  alt="imagen logo"
                  title="logo"
                />
              </h1>

              <h2 className="mt-6 text-2xl font-bold">
                Bienvenidos
              </h2>

              <p className="mt-1 text-sm opacity-80">
                Gestión de colas y tickets
              </p>

              <div
                className="h-1 w-12 mx-auto mt-3 rounded-full"
                style={{ backgroundColor: colors.primaryYellow }}
              ></div>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="login-page px-7 py-6 min-h-[270px] bg-white">

            {error && (
              <div
                className="flex flex-col items-center p-2 rounded-xl text-center mb-4 border"
                style={{
                  backgroundColor: `${colors.primaryRed}10`,
                  borderColor: colors.primaryRed,
                }}
              >
                <AlertTriangleIcon
                  className="w-4 h-4 mb-1"
                  style={{ color: colors.primaryRed }}
                />

                <p
                  className="text-[11px] font-semibold"
                  style={{ color: colors.primaryRed }}
                >
                  El ID de usuario o la contraseña no son válidos.
                </p>
              </div>
            )}

            {/* HEADER LOGIN */}
            <div className="w-full flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-3">
                <SquareUserRoundIcon
                  className="w-10 h-10"
                  style={{
                    color: error
                      ? colors.primaryRed
                      : colors.primaryBlue,
                  }}
                />
              </div>

              <h2
                className="text-lg font-black tracking-tight uppercase"
                style={{ color: colors.primaryBlue }}
              >
                Iniciar Sesión
              </h2>
            </div>

            {/* FORM */}
            <div className="login-content space-y-4">

              {/* Usuario */}
              <div className="relative">
                <label
                  htmlFor="userid"
                  className="block text-[10px] font-black uppercase mb-1 text-slate-500 tracking-widest"
                >
                  Usuario
                </label>

                <div className="relative">
                  <input
                    required
                    type="text"
                    id="userid"
                    className="w-full border-b-2 p-2 pr-9 text-sm outline-none transition-all focus:border-blue-500 bg-transparent"
                    style={{
                      borderBottomColor: colors.monoSilver,
                    }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />

                  <UserIcon
                    className="w-4 h-4 absolute right-2 bottom-2"
                    style={{ color: colors.primaryBlue }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="relative">
                <label
                  htmlFor="pwd"
                  className="block text-[10px] font-black uppercase mb-1 text-slate-500 tracking-widest"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    required
                    id="pwd"
                    type={viewpass ? "text" : "password"}
                    className="w-full border-b-2 p-2 pr-9 text-sm outline-none transition-all focus:border-blue-500 bg-transparent"
                    style={{
                      borderBottomColor: colors.monoSilver,
                    }}
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
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeOffIcon
                        className="w-4 h-4"
                        style={{ color: colors.primaryBlue }}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[11px] text-white transition-all transform hover:scale-[1.02] active:scale-95 mt-8 shadow-lg"
              style={{
                backgroundColor: colors.primaryBlue,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </div>
      </form>
    </div>

    {/* FOOTER */}
    <footer
      style={{
        backgroundColor: colors.primaryBlue,
        borderTop: `3px solid ${colors.primaryYellow}`,
      }}
      className="text-white h-[50px] w-full flex items-center justify-center z-10"
    >
      <p className="text-[11px] text-center px-4">
        Copyright © {new Date().getFullYear()}{" "}
        <strong style={{ color: colors.primaryYellow }}>
          Gestión de colas v1.2.2
        </strong>

        <a
          href={UCNE_URL}
          className="underline transition-colors ml-2 hover:text-white"
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