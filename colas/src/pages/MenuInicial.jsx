import { useNavigate } from "react-router-dom";
import { Tv, Ticket, Settings, User } from "lucide-react";
import API from "../services/api";
import { useEffect, useState } from "react";

function MenuInicial() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);

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

  const pantallas = [
    {
      path: "/anuncios",
      titulo: "Pantalla TV",
      descripcion: "Mostrar turnos y multimedia",
      icon: Tv,
      color: "bg-blue-700",
      colorHover: "hover:bg-blue-800",
    },
    {
      path: "/cliente",
      titulo: "Pantalla Cliente",
      descripcion: "Solicitar tickets",
      icon: Ticket,
      color: "bg-green-600",
      colorHover: "hover:bg-green-700",
    },
    {
      path: "/admin",
      titulo: "Pantalla Admin",
      descripcion: "Configuración del sistema",
      icon: Settings,
      color: "bg-orange-600",
      colorHover: "hover:bg-orange-700",
    },
    {
      path: "/operador",
      titulo: "Pantalla Operador",
      descripcion: "Atención y gestión de tickets",
      icon: User,
      color: "bg-red-600",
      colorHover: "hover:bg-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex flex-col items-center justify-center p-8">
      <div className="text-center text-white mb-16">
        <h1 className="flex text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          {config?.logo_url && (
            <img
              src={config.logo_url}
              alt="Logo"
              className="w-20 h-20 drop-shadow-lg object-contain rounded-lg p-1 mr-10"
            />
          )}
          Sistema de Gestión de Colas
        </h1>
        <p className="text-xl md:text-2xl opacity-90 mb-6">
          Selecciona una pantalla para continuar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full mb-8">
        {pantallas.map((pantalla) => {
          const Icon = pantalla.icon;
          return (
            <div
              key={pantalla.path}
              onClick={() => navigate(pantalla.path)}
              className="bg-white rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div
                className={`${pantalla.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                {pantalla.titulo}
              </h2>
              <p className="text-gray-600 mb-6 text-center leading-relaxed">
                {pantalla.descripcion}
              </p>
              <button
                className={`w-full ${pantalla.color} ${pantalla.colorHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200`}>
                Abrir
              </button>
            </div>
          );
        })}
      </div>
      <footer className="mt-40 ">
        <p className="text-white">
          <span className="">
            Copyright © {new Date().getFullYear()}.
          </span>
          <label>
            <strong className=" m-4">Gestion de colas</strong>
          </label>
          <a
            className="underline cursor-pointer m-2 font-bold hover:text-yellow-400"
            href="https://www.ucne.edu/">
            UCNE
          </a>
        </p>
      </footer>
    </div>
  );
}

export default MenuInicial;
