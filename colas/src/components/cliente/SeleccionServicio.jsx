import { useEffect, useState } from "react";
import { BackBtnCli } from "../../pages/PantallaCliente";
import api from "../../services/api";
import { AlertTriangle, Tag, ChevronRight, Loader2 } from "lucide-react";

export default function PasoSeleccionServicio({
  servicios,
  departamentoSeleccionado,
  onSelect,
  setPaso,
  setIdentificacion,
  identificacion,
}) {
  const [user, setUser] = useState("");
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);

  const serviciosFiltrados = servicios.filter(
    (s) => s.departamento === departamentoSeleccionado?.id && s.service_active === 1
  );

  const handleBack = () => {
    setPaso(3); // Regresa a selección de departamento
    setShow(true);
  };

  const handleVerificar = async () => {
    setLoading(true);
    try {
      const data = await api.verificarUsuario(identificacion);
      if (data && (data.cn || data.displayName)) {
        setUser(data.cn || data.displayName);
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
    if (identificacion && identificacion.length === 8) handleVerificar();
  }, [identificacion]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-tighter">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {show ? (
        <div id="table-service" className="flex flex-col items-center">
          {/* Encabezado dinámico */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3">
              <Tag size={11} /> {departamentoSeleccionado?.nombre || 'Departamento'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
              Selecciona un Servicio
            </h2>
            <p className="text-slate-500 text-sm">Haz clic en el trámite que deseas realizar</p>
          </div>

          {/* Grid Adaptativo de Servicios */}
          <div className={`grid gap-3 w-full ${
            serviciosFiltrados.length === 1 ? "max-w-md grid-cols-1" : 
            serviciosFiltrados.length === 2 ? "max-w-3xl grid-cols-1 md:grid-cols-2" : 
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {serviciosFiltrados.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className="group relative bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 text-left flex flex-col min-h-[160px]"
              >
                {/* Línea de color superior personalizada */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-b-full transition-all group-hover:w-1/2"
                  style={{ backgroundColor: s.color || '#2563eb' }}
                />

                <div className="mt-3 mb-1 flex justify-between items-start">
                   <span 
                    className="text-2xl font-black tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity"
                    style={{ color: s.color || '#2563eb' }}
                   >
                    {s.codigo}
                  </span>
                  <div className="p-1 bg-slate-50 rounded-lg text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                  {s.nombre}
                </h3>

                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                  {s.descripcion || "Sin descripción disponible para este servicio."}
                </p>
                
                <div className="mt-auto pt-2">
                   <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                     Seleccionar ahora
                   </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Error de Usuario (Coherente con PasoSeleccionDep) */
        <div className="max-w-md mx-auto py-8 px-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-black text-red-800 mb-1">Usuario inválido</h2>
          <p className="text-red-600/70 font-medium mb-6 text-sm">No pudimos verificar tu identidad. Por favor intenta de nuevo.</p>
          <button
            onClick={handleBack}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            Regresar
          </button>
        </div>
      )}
    </div>
  );
}