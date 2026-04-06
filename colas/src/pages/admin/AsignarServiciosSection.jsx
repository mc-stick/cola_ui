import { useState } from "react";
import { UserCog, Users, Briefcase, Check, X, AlertCircleIcon, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { Spinner, TabSpinner } from "../../components/loading";

function AsignarServiciosSection({
  operadoresServicios,
  LoadingSpin,
  onToggleServicio,
  API,
}) {
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  const [serviciosOperador, setServiciosOperador] = useState([]);
  const [loaditems, setLoaditems] = useState(false);

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryYellow: "#fad824",
    secondaryBlueDark: "#006ca1",
    monoSilver: "#b2b2b2",
  };

  const handleSeleccionarOperador = async (operador) => {
    if (!operador.activo) {
      toast.error("Usuario inactivo.");
      return;
    }
    setOperadorSeleccionado(operador);
    setLoaditems(true);
    try {
      const servicios = await API.getOperadorServicios(operador.id);
      setServiciosOperador(servicios);
    } catch (error) {
      toast.error("Error al cargar servicios");
    } finally {
      setTimeout(() => setLoaditems(false), 800);
    }
  };

  const handleToggleServicio = async (servicio) => {
    if (!operadorSeleccionado) return;
    try {
      if (servicio.asignado) {
        await API.desasignarServicioOperador(operadorSeleccionado.id, servicio.id);
        toast.info("Servicio removido.");
      } else {
        await API.asignarServicioOperador(operadorSeleccionado.id, servicio.id);
        toast.success("Servicio asignado.");
      }
      const serviciosActualizados = await API.getOperadorServicios(operadorSeleccionado.id);
      setServiciosOperador(serviciosActualizados);
      if (onToggleServicio) await onToggleServicio();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col" 
      style={{ borderColor: colors.monoSilver, height: 'calc(100vh - 140px)' }}
    >
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER */}
      <div className="p-8 shrink-0 flex justify-between items-center border-b">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: colors.primaryBlue }}>
            Asignación de <span style={{ color: colors.secondaryBlueDark }}>Servicios</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vincula operadores con sus áreas de atención</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
            <UserCog className="w-6 h-6" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* COLUMNA IZQUIERDA: OPERADORES */}
        <div className="w-1/3 border-r bg-slate-50/50 flex flex-col">
          <div className="p-4 bg-white/50 border-b">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Seleccionar Operador</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {LoadingSpin ? (
              <div>

                {/*  <Spinner /> */}
              </div>
              
            ) : (
              operadoresServicios.map((operador) => (
                <div
                  key={operador.id}
                  onClick={() => handleSeleccionarOperador(operador)}
                  className={`group p-4 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                    operadorSeleccionado?.id === operador.id
                      ? "bg-white border-blue-600 shadow-md scale-[1.02]"
                      : "bg-transparent border-transparent hover:bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="truncate">
                    <h4 className={`font-black uppercase italic text-sm truncate ${operador.activo ? "text-slate-700" : "text-slate-300 line-through"}`}>
                      {operador.nombre}
                    </h4>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                      {operador.puesto_nombre || "Sin puesto"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                        operadorSeleccionado?.id === operador.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                        {operador.servicios?.length || 0}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${operadorSeleccionado?.id === operador.id ? "translate-x-1 text-blue-600" : "text-slate-300"}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: SERVICIOS */}
        <div className="flex-1 flex flex-col bg-white">
          {!operadorSeleccionado ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic">
              <UserCog className="w-20 h-20 mb-4" />
              <p className="font-black uppercase tracking-widest">Selecciona un operador a la izquierda</p>
            </div>
          ) : loaditems ? (
            <div className="flex-1 flex items-center justify-center">
              {/* <Spinner /> */}
              </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Configurando atención para:</span>
                  <h3 className="text-2xl font-black uppercase italic text-slate-800">{operadorSeleccionado.nombre}</h3>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase leading-none">Puesto Actual</span>
                  <span className="text-sm font-black text-slate-700 uppercase italic">{operadorSeleccionado.puesto_nombre}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviciosOperador.map((servicio) => (
                    <div
                      key={servicio.id}
                      onClick={() => handleToggleServicio(servicio)}
                      className={`relative group p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        servicio.asignado 
                        ? "bg-white border-green-500 shadow-sm" 
                        : "bg-slate-50 border-transparent hover:border-slate-200"
                      } ${!servicio.service_active && "opacity-40 grayscale pointer-events-none"}`}
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-xl italic shadow-lg"
                        style={{ backgroundColor: servicio.service_active ? servicio.color : '#cbd5e1' }}
                      >
                        {servicio.codigo}
                      </div>

                      <div className="flex-1 truncate">
                        <h4 className="font-black uppercase text-sm text-slate-700 truncate leading-tight">
                          {servicio.nombre}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {servicio.service_active ? "Área Activa" : "Área fuera de servicio"}
                        </p>
                      </div>

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        servicio.asignado ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
                      }`}>
                        {servicio.asignado ? <Check className="w-5 h-5" /> : <X className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-12 py-4 bg-slate-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Nota: Solo los servicios asignados y activos aparecerán en la consola del operador.
        </span>
      </div>
    </div>
  );
}

export default AsignarServiciosSection;