import { useState, useEffect } from "react";
import { Monitor, Check, X, AlertCircleIcon, ChevronRight, Layers } from "lucide-react";
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
    className="bg-white rounded-[2rem] shadow-sm border relative overflow-hidden flex flex-col"
    style={{ borderColor: "#e2e8f0", height: "calc(100vh - 140px)" }}
  >
    {/* Decoración fondo */}
    <div className="absolute top-0 right-0 w-32 h-full bg-[#1e2a4f]/5 skew-x-[-20deg] translate-x-16 pointer-events-none"></div>

    {/* HEADER */}
    <div className="p-5 md:px-6 md:py-5 shrink-0 relative z-10 border-b border-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <Monitor className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
              Servicios por <span className="text-[#1e2a4f]">Pantalla</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Configuración de visualización por dispositivo
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <Layers className="w-4 h-4" />
        </div>
      </div>
    </div>

    {/* CONTENIDO */}
    <div className="flex-1 flex overflow-hidden relative z-10">

      {/* SIDEBAR PANTALLAS */}
      <div className="w-[340px] border-r border-slate-100 bg-slate-50/40 flex flex-col">

        {/* HEADER SIDEBAR */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Seleccionar Pantalla
          </span>
        </div>

        {/* LISTADO */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
          {loadingPantallas ? (
            <div className="h-full flex justify-center items-center flex-col gap-2">
              <div className="w-6 h-6 border-2 border-slate-100 border-t-[#daab00] rounded-full animate-spin"></div>

              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                Cargando...
              </p>
            </div>
          ) : (
            pantallas.map((pantalla) => (
              <div
                key={pantalla.id}
                onClick={() => handleSeleccionarPantalla(pantalla)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                  pantallaSeleccionada?.id === pantalla.id
                    ? "bg-white border-[#4ec2eb] shadow-md"
                    : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                }`}
              >
                <div className="min-w-0">
                  <h4 className="font-black uppercase italic text-sm truncate leading-none text-slate-800">
                    {pantalla.nombre}
                  </h4>

                  <p className="text-[8px] mt-1 font-bold text-[#4ec2eb] uppercase tracking-widest truncate">
                    {pantalla.token}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[8px] font-black px-2 py-1 rounded-lg ${
                      pantallaSeleccionada?.id === pantalla.id
                        ? "bg-[#1e2a4f] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {pantalla.servicios?.length || 0}
                  </span>

                  <ChevronRight
                    className={`w-4 h-4 transition-all ${
                      pantallaSeleccionada?.id === pantalla.id
                        ? "translate-x-1 text-[#1e2a4f]"
                        : "text-slate-300"
                    }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {!pantallaSeleccionada ? (
          <div className="flex-1 flex flex-col justify-center items-center opacity-20 italic text-center">
            <Monitor className="w-14 h-14 mb-4" />

            <p className="text-[10px] font-black uppercase tracking-widest">
              Selecciona una pantalla
            </p>
          </div>
        ) : loadingServicios ? (
          <div className="flex-1 flex justify-center items-center flex-col gap-2">
            <div className="w-6 h-6 border-2 border-slate-100 border-t-[#daab00] rounded-full animate-spin"></div>

            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Cargando servicios...
            </p>
          </div>
        ) : (
          <>
            {/* HEADER CONFIG */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#4ec2eb]">
                  Configurando servicios para
                </span>

                <h3 className="text-lg font-black uppercase italic text-slate-800 leading-none mt-1">
                  {pantallaSeleccionada.nombre}
                </h3>
              </div>

              <div className="text-right">
                <span className="block text-[7px] font-black uppercase tracking-widest text-slate-400">
                  Token
                </span>

                <span className="text-[10px] font-black uppercase italic text-slate-700">
                  {pantallaSeleccionada.token}
                </span>
              </div>
            </div>

            {/* SERVICIOS */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={() => handleToggleServicio(servicio)}
                    className={`group rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-4 ${
                      servicio.asignado
                        ? "bg-white border-green-400 shadow-sm"
                        : "bg-slate-50 border-transparent hover:border-slate-200"
                    } ${
                      !servicio.activo &&
                      "opacity-40 grayscale pointer-events-none"
                    }`}
                  >
                    {/* ICONO */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 border-b-2 border-black/10 text-white"
                      style={{
                        backgroundColor: servicio.activo
                          ? servicio.color
                          : "#cbd5e1",
                      }}
                    >
                      {servicio.codigo}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-black uppercase italic text-sm leading-none text-slate-800 truncate">
                          {servicio.nombre}
                        </h4>

                        {servicio.asignado && (
                          <span className="bg-green-100 text-green-700 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase">
                            Visible
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] uppercase tracking-widest">
                        <Layers className="w-2.5 h-2.5" />

                        {servicio.activo
                          ? "Servicio activo"
                          : "Fuera de servicio"}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        servicio.asignado
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {servicio.asignado ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* FOOTER */}
    <div className="px-8 py-3 bg-slate-50 border-t flex items-center shrink-0 relative z-10">
      <AlertCircleIcon className="w-3.5 h-3.5 mr-2 text-[#daab00]" />

      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        Solo los servicios asignados aparecerán en la pantalla correspondiente.
      </span>
    </div>
  </div>
);
}

export default AsignarServiciosPantallaSection;