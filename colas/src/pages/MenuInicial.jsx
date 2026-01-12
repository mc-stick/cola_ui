import { useNavigate } from 'react-router-dom';
import { Tv, Ticket, Settings, User } from 'lucide-react';
import API from '../services/api';
import { useEffect, useState } from 'react';

function MenuInicial() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);

   useEffect(() => {
      const cargarDatos = async () => {
        try {
          const [configData] = await Promise.all([
            API.getConfiguracion()
          ]);
          setConfig(configData);
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      };
      cargarDatos();
    }, []);

  const pantallas = [
    {
      path: '/anuncios',
      titulo: 'Pantalla TV',
      descripcion: 'Muestra turnos llamados y contenido multimedia',
      icon: Tv,
      color: 'bg-blue-700',
      colorHover: 'hover:bg-blue-800'
    },
    {
      path: '/cliente',
      titulo: 'Pantalla Cliente',
      descripcion: 'Solicitar tickets con ID, teléfono o sin identificación',
      icon: Ticket,
      color: 'bg-green-600',
      colorHover: 'hover:bg-green-700'
    },
    {
      path: '/admin',
      titulo: 'Pantalla Admin',
      descripcion: 'Configuración y gestión del sistema',
      icon: Settings,
      color: 'bg-purple-600',
      colorHover: 'hover:bg-purple-700'
    },
    {
      path: '/operador',
      titulo: 'Pantalla Operador',
      descripcion: 'Atención y gestión de tickets',
      icon: User,
      color: 'bg-red-600',
      colorHover: 'hover:bg-red-700'
    }
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
        {/* <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
          <p className="text-sm">
            <strong>Nota:</strong> Este menú es provisional y se eliminará en producción
          </p>
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full mb-8">
        {pantallas.map((pantalla) => {
          const Icon = pantalla.icon;
          return (
            <div
              key={pantalla.path}
              onClick={() => navigate(pantalla.path)}
              className="bg-white rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`${pantalla.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                {pantalla.titulo}
              </h2>
              <p className="text-gray-600 mb-6 text-center leading-relaxed">
                {pantalla.descripcion}
              </p>
              <button 
                className={`w-full ${pantalla.color} ${pantalla.colorHover} text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200`}
              >
                Abrir →
              </button>
            </div>
          );
        })}
      </div>

      {/* <div className="text-white text-center opacity-80">
        <p>Desarrollado para gestión eficiente de colas y turnos</p>
      </div> */}
    </div>
  );
}

export default MenuInicial;