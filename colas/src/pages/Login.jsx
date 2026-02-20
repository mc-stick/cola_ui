import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  Shield,
  ShieldAlertIcon,
  ShieldIcon,
  SquareUserRoundIcon,
  UserCircle,
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

      // Guardar sesión
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.rol);

      // Redirigir según rol
      switch (user.rol) {
        case "admin":
          navigate("/admin", { replace: true });
          window.location.reload();
          break;

        case "operador":
          navigate("/operador", { replace: true });
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
    <div className="min-h-screen flex flex-col blue-overlay overflow-hidden">
      <AnimatedBubleBackground />

      <div id="pswrapper">
        <form onSubmit={handleLogin}>
          <div className="book-container">
            {/* <!-- Lado Izquierdo - Azul con Logo --> */}
            <div className="welcome-page">
              <div className="welcome-content">
                <h1 aria-label="Oracle PeopleSoft Sign-in">
                  <img
                    src={"images/Final-08.png"}
                    className="ps-staticimg"
                    alt="imagen logo"
                    title="logo"
                  />
                </h1>
                <h2 className="mt-20">Bienvenidos</h2>
                <p>Gestion de colas y tickets</p>
              </div>
            </div>

            {/* <!-- Lado Derecho - Formulario Blanco --> */}
            <div className="login-page">
              {error && (
                <div className="flex flex-col items-center bg-red-50  rounded-lg text-center">
                  <AlertTriangleIcon className=" text-red-700 font-bold" />

                  <p className="text-red-700 text-sm font-semibold">
                    El ID de usuario o la contraseña no son válidos.
                  </p>
                </div>
              )}
              <div className="w-full flex justify-center max-w-sm mx-auto mt-4">
                <h2 className="text-2xl font-bold text-blackk mb-10">
                  {error ? (
                    <span className="flex flex-col items-center mb-4">

                        <SquareUserRoundIcon className="w-20 h-20 text-red-600" />
                    </span>
                  ) : (
                    <span className="flex flex-col items-center mb-4">
                        <SquareUserRoundIcon className="w-20 h-20 text-blue-900" />
                    </span>
                  )}

                  INICIAR SESIÓN
                </h2>
              </div>
              <div className="login-content">
                <div>
                  <span className="ps_label-show" id="ptLabelUserid">
                    <label htmlFor="userid">Usuario</label>
                  </span>
                </div>
                <div className="ps_box-control userid-container">
                  <input
                    required
                    type="text"
                    id="userid"
                    name="userid"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    title="Usuario"
                    autoComplete="username"
                  />
                  <UserIcon className="w-6 h-6 absolute right-3 top-4 text-black peer-focus:text-black transition-colors" />
                </div>

                <div className="mt-5">
                  <span className="ps_label-show" id="ptLabelPassword">
                    <label htmlFor="pwd">Contraseña</label>
                  </span>
                </div>
                <div className="ps_box-control password-container">
                  <input
                    required
                    id="pwd"
                    name="pwd"
                    title="Contraseña"
                    autoComplete="current-password"
                    type={viewpass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {viewpass ? (
                    <EyeIcon
                      onClick={() => setViewPass(false)}
                      className="w-6 h-6 absolute right-3 top-4 text-gray-400 peer-focus:text-black transition-colors"
                    />
                  ) : (
                    <EyeOffIcon
                      onClick={() => setViewPass(true)}
                      className="w-6 h-6 absolute right-3 top-4 text-black peer-focus:text-black transition-colors"
                    />
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ps-button mt-10">
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <footer
        style={{ backgroundColor: "#fad8241f" }}
        className=" text-white h-[50px] w-full flex bottom-0 items-center justify-center z-10">
        <p className="text-xs ">
          Copyright © {new Date().getFullYear()}{" "}
          <strong>Gestion de colas v1.2.2</strong>{" "}
          <a
            href={UCNE_URL}
            className="underline hover:text-gray-300 transition-colors m-2">
            UCNE
          </a>
        </p>
      </footer>
    </div>
  );
}

export default LoginComponent;
