import { useState } from "react";
import {
  History,
  Filter,
  Search,
  PaintbrushIcon,
  CheckCircle,
  Calendar,
  XCircle,
  Clock,
  PhoneCall,
  AlertCircle,
  AlertCircleIcon,
  User,
  ListChecksIcon,
  Download,
  Ticket,
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

  const colors = {
    primaryBlue: "#003366",
    primaryYellow: "#FFCC00",
    primaryRed: "#CC0000",
    secondaryBlueLight: "#E6F0FA",
    secondaryBlueDark: "#0056b3",
    monoSilver: "#E2E8F0",
  };

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

  console.log(historial);

  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="bg-white rounded-3xl shadow-sm border p-8 md:p-6 relative overflow-hidden"
        style={{ borderColor: colors.monoSilver }}>
        {/* Línea decorativa superior */}
        <div
          className="absolute top-0 left-0 w-full h-3"
          style={{ backgroundColor: colors.primaryBlue }}></div>

        {/* Encabezado Estilo Index */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-6">
          <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: colors.primaryBlue }}>
            registro de <span style={{ color: colors.secondaryBlueDark }}>actividad</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vincula operadores con sus áreas de atención</p>
        </div>
          <History
            className="w-20 h-20 opacity-10 -rotate-12"
            style={{ color: colors.primaryBlue }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Panel Lateral de Filtros */}
          <div className="space-y-6">
            <div
              className="h-2 w-24 rounded-full"
              style={{ backgroundColor: colors.primaryYellow }}></div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-dashed">
              <div className="flex items-center gap-2 mb-6">
                <Filter
                  className="w-5 h-5"
                  style={{ color: colors.primaryBlue }}
                />
                <span className="font-bold uppercase tracking-wider text-sm opacity-70">
                  Filtros de Historial
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
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
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all text-sm"
                    style={{ borderColor: colors.monoSilver }}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
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
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all text-sm"
                    style={{ borderColor: colors.monoSilver }}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
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
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all text-sm"
                    style={{ borderColor: colors.monoSilver }}>
                    <option value="">Todos los servicios</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
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
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all text-sm"
                    style={{ borderColor: colors.monoSilver }}>
                    <option value="">Cualquier estado</option>
                    <option value="4">Atendido</option>
                    <option value="1">En Espera</option>
                    <option value="5">No Atendido</option>
                  </select>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={handleCargarHistorial}
                    className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-blue-200"
                    style={{ backgroundColor: colors.primaryBlue }}>
                    <Search className="w-4 h-4" /> ACTUALIZAR VISTA
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setFiltrosHistorial({
                          ...filtrosHistorial,
                          servicio_id: "",
                          estado: "",
                        });
                        setHistorial([]);
                      }}
                      className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-bold transition-colors">
                      <PaintbrushIcon className="w-3 h-3" /> LIMPIAR
                    </button>
                    <button
                      onClick={() =>
                        exportarCSV(
                          historial,
                          `Historial-${filtrosHistorial.fecha_inicio}`,
                        )
                      }
                      disabled={historial.length === 0}
                      className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                      <Download className="w-3 h-3" /> EXPORTAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Tickets */}
          <div className="lg:col-span-2">
            {LoadingSpin ? (
              <div className="h-full flex items-center justify-center py-20">
                <CardLoader />
              </div>
            ) : historial.length > 0 ? (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">
                  {historial.length} Registros encontrados
                </p>
                {historial.map((ticket) => {
                  const info = getEstadoBadge(ticket.estado);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setModalinfo(ticket)}
                      className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          {/* Identificador de Ticket Estilizado */}
                          <div
                            className="h-16 w-30 p-1 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-inner shrink-0"
                            style={{
                              backgroundColor:
                                ticket.color || colors.primaryBlue,
                            }}>
                            <span className="text-2xl leading-none">
                              {ticket.numero}
                            </span>
                            <span className="text-[8px] opacity-70 uppercase mt-1">
                              ID:{ticket.id}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 ${info.bg} ${info.text}`}>
                                <info.icon className="w-3 h-3" /> {info?.label}
                              </span>
                              {/* <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                {ticket?.servicio_nombre}
                              </span> */}
                            </div>
                            <h4 className="text-gray-800 font-black text-lg uppercase">
                              {/* {ticket.cliente || "No registrado"} */}
                            </h4>
                            <div className="flex items-center gap-3 mt-10 opacity-60">
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                <Calendar className="w-3 h-3" />{" "}
                                {new Date(
                                  ticket?.created_at,
                                ).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                <Clock className="w-3 h-3" />{" "}
                                {new Date(ticket.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-slate-50 group-hover:bg-blue-50 text-slate-300 group-hover:text-blue-500 p-3 rounded-xl transition-all">
                            <ListChecksIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            VER DETALLES
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-20 flex flex-col justify-center items-center border border-dashed text-center">
                <History className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-bold opacity-30 uppercase">Sin registros</p>
                <p className="text-xs opacity-40 max-w-[200px]">
                  Selecciona un rango de fechas para visualizar el historial de
                  tickets.
                </p>
              </div>
            )}
            {historial.length > 0 && (
                  <div
                    className="flex items-center p-2 rounded-2xl text-[10px] border-l-8"
                    style={{
                      backgroundColor: `${colors.secondaryBlueLight}60`,
                      borderColor: colors.secondaryBlueLight,
                    }}>
                    <AlertCircleIcon
                      className="mr-4 shrink-0"
                      style={{ color: colors.secondaryBlueDark }}
                    />
                    <span
                      className="font-bold "
                      style={{ color: colors.secondaryBlueDark }}>
                      Los datos mostrados corresponden al flujo histórico de la
                      fecha seleccionada.
                    </span>
                  </div>
                )}
          </div>
        </div>
      </div>

      {modalinfo && (
        <InfoModal ticket={modalinfo} modal={() => setModalinfo(null)} />
      )}
    </div>
  );
}

export default HistorialSection;
