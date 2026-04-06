import { useEffect, useState } from "react";
import { BackBtnCli } from "../../pages/PantallaCliente";
import api from "../../services/api";
import { obtenerSaludo } from "../../utils/getWelcome";
import { AlertTriangle, Building2, ChevronRight } from "lucide-react";

export default function PasoSeleccionDep({
  departamentos,
  servicios,
  onSelect,
  setPaso,
  setIdentificacion,
  identificacion,
}) {
  const [user, setUser] = useState("");
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filtrar departamentos que tienen servicios activos
  const departamentosConServicios = departamentos.filter((d) => {
    return (
      d &&
      servicios.some((s) => s.service_active === 1 && s.departamento === d.id)
    );
  });

  const handleBack = () => {
    setPaso(1);
    setIdentificacion("");
    setShow(true);
  };

  const handleVerificar = async () => {
    setLoading(true);
    try {
      const data = await api.verificarUsuario(identificacion);
      if (data && (data.cn || data.displayName)) {
        setUser(data.cn || data.displayName);
        setShow(true);
      } else {
        setShow(false);
      }
    } catch (error) {
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si es identificación (ID CAMPUS - 8 caracteres), verificar
    if (identificacion && identificacion.length === 8) {
      handleVerificar();
    }
  }, [identificacion]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verificando Identidad...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {show ? (
        <div id="table-service" className="flex flex-col items-center">
          {/* Header de Bienvenida */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Acceso Autorizado
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
              {obtenerSaludo()}, 
              {user && <span className="text-blue-600">{" " + user}</span>}
            </h1>
            <p className="text-slate-500 text-lg">¿A qué departamento te diriges hoy?</p>
          </div>

          {/* Grid de Departamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {departamentosConServicios.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className="group relative bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Indicador visual de color */}
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-80 group-hover:w-3 transition-all" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <Building2 size={28} />
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-blue-400 transition-colors" />
                </div>

                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
                  {s.nombre}
                </h3>
                
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Seleccionar Departamento
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Estado de Error: Usuario no encontrado */
        <div className="max-w-md mx-auto py-12 px-8 bg-red-50 border border-red-100 rounded-[2.5rem] flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
            <AlertTriangle size={40} />
          </div>

          <h2 className="text-2xl font-black text-red-800 mb-2">
            ID no reconocido
          </h2>

          <p className="text-red-600/70 font-medium mb-8">
            Lo sentimos, no pudimos encontrar un usuario vinculado al ID <b>{identificacion}</b>. Por favor, verifica los datos e intenta de nuevo.
          </p>

          <button
            onClick={handleBack}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
          >
            Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
}