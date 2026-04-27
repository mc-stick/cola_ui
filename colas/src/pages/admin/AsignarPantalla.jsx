import { useState, useEffect } from "react";
import { Monitor, Check, X, AlertCircleIcon, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../services/api";

const colors = {
  primaryBlue: "#1e2a4f",
  secondaryBlueDark: "#006ca1",
  monoSilver: "#b2b2b2",
};

function AsignarServiciosPantallaSection() {
  const [pantallas, setPantallas] = useState([]);
  const [pantallaSeleccionada, setPantallaSeleccionada] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [loadingPantallas, setLoadingPantallas] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(false);

  const cargarPantallas = async () => {
    try {
      const data = await API.getPantallasConServicios();
      setPantallas(data);
    } catch {
      toast.error("Error al cargar pantallas");
    } finally {
      setLoadingPantallas(false);
    }
  };

  useEffect(() => { cargarPantallas(); }, []);

  const handleSeleccionarPantalla = async (pantalla) => {
    setPantallaSeleccionada(pantalla);
    setLoadingServicios(true);
    try {
      const data = await API.getPantallaServicios(pantalla.id);
      setServicios(data);
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setTimeout(() => setLoadingServicios(false), 600);
    }
  };

  const handleToggleServicio = async (servicio) => {
    if (!pantallaSeleccionada) return;
    try {
      if (servicio.asignado) {
        await API.desasignarServicioPantalla(pantallaSeleccionada.id, servicio.id);
        toast.info("Servicio removido de la pantalla");
      } else {
        await API.asignarServicioPantalla(pantallaSeleccionada.id, servicio.id);
        toast.success("Servicio asignado a la pantalla");
      }
      const [serviciosActualizados] = await Promise.all([
        API.getPantallaServicios(pantallaSeleccionada.id),
        cargarPantallas(),
      ]);
      setServicios(serviciosActualizados);
    } catch {
      toast.error("Error al actualizar asignación");
    }
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col"
      style={{ borderColor: colors.monoSilver, height: "calc(100vh - 140px)" }}
    >
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }} />

      {/* HEADER */}
      <div className="p-8 shrink-0 flex justify-between items-center border-b">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: colors.primaryBlue }}>
            Servicios por <span style={{ color: colors.secondaryBlueDark }}>Pantalla</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Define qué servicios se muestran en cada pantalla
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
          <Monitor className="w-6 h-6" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* COLUMNA IZQUIERDA: PANTALLAS */}
        <div className="w-1/3 border-r bg-slate-50/50 flex flex-col">
          <div className="p-4 bg-white/50 border-b">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              Seleccionar Pantalla
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loadingPantallas ? (
              <div className="flex items-center justify-center h-full opacity-20">
                <Monitor className="w-10 h-10 animate-pulse" />
              </div>
            ) : (
              pantallas.map((pantalla) => (
                <div
                  key={pantalla.id}
                  onClick={() => handleSeleccionarPantalla(pantalla)}
                  className={`group p-4 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                    pantallaSeleccionada?.id === pantalla.id
                      ? "bg-white border-blue-600 shadow-md scale-[1.02]"
                      : "bg-transparent border-transparent hover:bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="truncate">
                    <h4 className="font-black uppercase italic text-sm truncate text-slate-700">
                      {pantalla.nombre}
                    </h4>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                      {pantalla.token}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      pantallaSeleccionada?.id === pantalla.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {pantalla.servicios?.length || 0}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      pantallaSeleccionada?.id === pantalla.id
                        ? "translate-x-1 text-blue-600"
                        : "text-slate-300"
                    }`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: SERVICIOS */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {!pantallaSeleccionada ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic">
              <Monitor className="w-20 h-20 mb-4" />
              <p className="font-black uppercase tracking-widest">Selecciona una pantalla a la izquierda</p>
            </div>
          ) : loadingServicios ? (
            <div className="flex-1 flex items-center justify-center opacity-20">
              <Monitor className="w-12 h-12 animate-pulse" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                    Configurando servicios para:
                  </span>
                  <h3 className="text-2xl font-black uppercase italic text-slate-800">
                    {pantallaSeleccionada.nombre}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase leading-none">Token</span>
                  <span className="text-sm font-black text-blue-500 uppercase italic">
                    {pantallaSeleccionada.token}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      onClick={() => handleToggleServicio(servicio)}
                      className={`relative group p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        servicio.asignado
                          ? "bg-white border-green-500 shadow-sm"
                          : "bg-slate-50 border-transparent hover:border-slate-200"
                      } ${!servicio.activo && "opacity-40 grayscale pointer-events-none"}`}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-xl italic shadow-lg"
                        style={{ backgroundColor: servicio.activo ? servicio.color : "#cbd5e1" }}
                      >
                        {servicio.codigo}
                      </div>

                      <div className="flex-1 truncate">
                        <h4 className="font-black uppercase text-sm text-slate-700 truncate leading-tight">
                          {servicio.nombre}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {servicio.activo ? "Servicio Activo" : "Fuera de servicio"}
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
          Solo los servicios asignados aparecerán en la pantalla correspondiente.
        </span>
      </div>
    </div>
  );
}

export default AsignarServiciosPantallaSection;