import { useState } from "react";
import {
  History,
  Filter,
  Search,
  PaintbrushIcon,
  CheckCircle,
  XCircle,
  Clock,
  PhoneCall,
  AlertCircle,
  User,
  ListChecksIcon,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import { InfoModal, CardLoader } from "../../components/loading";
import { exportarCSV } from "../../components/jsontoCsv";

function HistorialSection({
  historial,
  setHistorial,
  servicios,
  usuarios,
  LoadingSpin,
  setLoadingSpin,
  onCargarHistorial,
  validarFiltrosHistorial,
}) {
  const [modalinfo, setModalinfo] = useState(null);
  const [filtrosHistorial, setFiltrosHistorial] = useState({
    fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    fecha_fin: new Date().toISOString().split("T")[0],
    servicio_id: "",
    estado: "",
    operador: "",
  });

  const getEstadoBadge = (estado) => {
    const estados = {
      4: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
        label: "Atendido",
      },
      5: {
        bg: "bg-rose-100",
        text: "text-rose-700",
        icon: XCircle,
        label: "No Atendido",
      },
      1: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: Clock,
        label: "En Espera",
      },
      2: {
        bg: "bg-sky-100",
        text: "text-sky-700",
        icon: PhoneCall,
        label: "Llamado",
      },
      3: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: AlertCircle,
        label: "En Atención",
      },
      6: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: XCircle,
        label: "Cancelado",
      },
    };
    return (
      estados[estado] || {
        bg: "bg-gray-100",
        text: "text-gray-500",
        icon: Clock,
        label: "Pendiente",
      }
    );
  };

  const handleCargarHistorial = async () => {
    setLoadingSpin(true);
    if (!validarFiltrosHistorial(filtrosHistorial)) {
      setLoadingSpin(false);
      return;
    }
    try {
      await onCargarHistorial(filtrosHistorial);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setTimeout(() => setLoadingSpin(false), 500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 w-full max-w-full overflow-hidden">
      {/* Header Estilo Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Registro de Actividad
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Consulta el historial de turnos y tickets generados.
          </p>
        </div>

        {historial.length > 0 && (
          <button
            onClick={() => exportarCSV(historial)}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Download className="w-4 h-4" /> Exportar Datos
          </button>
        )}
      </div>

      {/* Panel de Filtros Simplificado */}
      <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
              Desde
            </label>
            <input
              type="date"
              value={filtrosHistorial.fecha_inicio}
              onChange={(e) =>
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  fecha_inicio: e.target.value,
                })
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
              Hasta
            </label>
            <input
              type="date"
              value={filtrosHistorial.fecha_fin}
              onChange={(e) =>
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  fecha_fin: e.target.value,
                })
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
              Servicio / Área
            </label>
            <select
              value={filtrosHistorial.servicio_id}
              onChange={(e) =>
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  servicio_id: e.target.value,
                })
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Todos los servicios</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
              Estado
            </label>
            <select
              value={filtrosHistorial.estado}
              onChange={(e) =>
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  estado: e.target.value,
                })
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Cualquier estado</option>
              <option value="4">Atendido</option>
              <option value="1">En Espera</option>
              <option value="5">No Atendido</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleCargarHistorial}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
            <Search className="w-4 h-4" /> Actualizar Vista
          </button>
          <button
            onClick={() => {
              setFiltrosHistorial({
                ...filtrosHistorial,
                servicio_id: "",
                estado: "",
              });
              setHistorial([]);
            }}
            className="text-slate-400 hover:text-slate-600 px-4 py-2 text-sm font-bold transition-all">
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Resultados con estilo Dashboard */}
      {LoadingSpin ? (
        <CardLoader />
      ) : (
        <div className="w-full">
          <p className="text-slate-400 text-[11px] font-bold uppercase mb-4 tracking-wider">
            Resultados: {historial.length} tickets encontrados
          </p>

          <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {historial.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm">
                  Selecciona los filtros para ver el historial.
                </p>
              </div>
            ) : (
              historial.map((ticket) => {
                const info = getEstadoBadge(ticket.estado);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setModalinfo(ticket)}
                    className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div
                        className="px-4 py-2 rounded-xl flex flex-col items-center justify-center text-white font-black shadow-inner w-fit"
                        style={{ backgroundColor: ticket.color || "#64748b" }}>
                        <span className="text-xl leading-none">
                          {ticket.numero}
                        </span>
                        <span className="text-[10px] opacity-80 font-bold uppercase mt-1">
                          ticket ID:{ticket.id}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 ${info.bg} ${info.text}`}>
                            <info.icon className="w-3 h-3" /> {info.label}
                          </span>
                          <span className="text-slate-400 text-[10px] font-medium italic">
                            {new Date(ticket.created_at).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <h4 className="text-slate-700 font-bold text-sm uppercase tracking-tight truncate max-w-[200px]">
                          {ticket.cliente || "Ticket General"}
                        </h4>
                        <p className="text-slate-400 text-xs font-medium">
                          Área: {ticket.servicio_nombre || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                          Fecha
                        </p>
                        <p className="text-slate-600 text-xs font-bold">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 p-2 rounded-xl transition-all">
                        <ListChecksIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {modalinfo && (
        <InfoModal ticket={modalinfo} modal={() => setModalinfo(null)} />
      )}
    </div>
  );
}

export default HistorialSection;
