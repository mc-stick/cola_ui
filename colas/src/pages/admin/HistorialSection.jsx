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
  HistoryIcon,
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
      //toast.error("Error de conexión");
    } finally {
      setTimeout(() => setLoadingSpin(false), 500);
    }
  };

  

  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="bg-white rounded-3xl shadow-sm border p-8 md:p-6 relative overflow-hidden"
        style={{ borderColor: colors.monoSilver }}>
        {/* Línea decorativa superior */}
        

        {/* Encabezado Estilo Index */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <HistoryIcon className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
              <span className="text-[#1e2a4f]">Historial</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Panel de historial de tickets
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
  {/* PANEL FILTROS */}
  <div className="space-y-3">
    <div className="bg-gray-50 rounded-2xl p-4 border border-dashed mt-2">
      <div className="flex items-center gap-2 mb-4">
        <Filter
          className="w-3.5 h-3.5"
          style={{ color: colors.primaryBlue }}
        />

        <span className="font-black uppercase tracking-widest text-[10px] text-slate-500">
          Filtros de Historial
        </span>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="text-[9px] font-black uppercase mb-1 block text-slate-400 tracking-wide">
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
            className="w-full bg-white border rounded-lg px-3 py-2 outline-none transition-all text-[10px] font-bold"
            style={{ borderColor: colors.monoSilver }}
          />
        </div>

        <div>
          <label className="text-[9px] font-black uppercase mb-1 block text-slate-400 tracking-wide">
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
            className="w-full bg-white border rounded-lg px-3 py-2 outline-none transition-all text-[10px] font-bold"
            style={{ borderColor: colors.monoSilver }}
          />
        </div>

        <div>
          <label className="text-[9px] font-black uppercase mb-1 block text-slate-400 tracking-wide">
            Servicio
          </label>

          <select
            value={filtrosHistorial.servicio_id}
            onChange={(e) =>
              setFiltrosHistorial({
                ...filtrosHistorial,
                servicio_id: e.target.value,
              })
            }
            className="w-full bg-white border rounded-lg px-3 py-2 outline-none transition-all text-[10px] font-bold"
            style={{ borderColor: colors.monoSilver }}
          >
            <option value="">Todos</option>

            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-black uppercase mb-1 block text-slate-400 tracking-wide">
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
            className="w-full bg-white border rounded-lg px-3 py-2 outline-none transition-all text-[10px] font-bold"
            style={{ borderColor: colors.monoSilver }}
          >
            <option value="">Todos</option>
            <option value="4">Atendido</option>
            <option value="1">En Espera</option>
            <option value="5">No Atendido</option>
          </select>
        </div>

        <div className="pt-2 flex flex-col gap-1.5">
          <button
            onClick={handleCargarHistorial}
            className="w-full flex items-center justify-center gap-1.5 text-white py-2 rounded-lg font-black text-[10px] uppercase tracking-wide transition-transform active:scale-95"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <Search className="w-3 h-3" />
            Actualizar
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  servicio_id: "",
                  estado: "",
                });

                setHistorial([]);
              }}
              className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-[9px] font-black uppercase transition-colors"
            >
              <PaintbrushIcon className="w-2.5 h-2.5" />
              Limpiar
            </button>

            <button
              onClick={() =>
                exportarCSV(
                  historial,
                  `Historial-${filtrosHistorial.fecha_inicio}`,
                )
              }
              disabled={historial.length === 0}
              className="flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-[9px] font-black uppercase transition-colors disabled:opacity-50"
            >
              <Download className="w-2.5 h-2.5" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* HISTORIAL */}
  <div className="lg:col-span-2">
    {LoadingSpin ? (
      <div className="h-full flex items-center justify-center py-10">
        <CardLoader />
      </div>
    ) : historial.length > 0 ? (
      <div className="space-y-2 max-h-[470px] overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
          {historial.length} registros encontrados
        </p>

        {historial.map((ticket) => {
          const info = getEstadoBadge(ticket.estado);

          return (
            <div
              key={ticket.id}
              onClick={() => setModalinfo(ticket)}
              className="group bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow hover:border-blue-100 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 min-w-0">
                  {/* TICKET */}
                  <div
                    className="h-12 w-20 p-1 rounded-xl flex flex-col items-center justify-center text-white font-black shrink-0"
                    style={{
                      backgroundColor:
                        ticket.color || colors.primaryBlue,
                    }}
                  >
                    <span className="text-lg leading-none">
                      {ticket.numero}
                    </span>

                    <span className="text-[7px] opacity-70 uppercase mt-0.5">
                      ID:{ticket.id}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase flex items-center gap-1 ${info.bg} ${info.text}`}
                      >
                        <info.icon className="w-2.5 h-2.5" />

                        {info?.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 opacity-60 flex-wrap">
                      <div className="flex items-center gap-1 text-[8px] font-black">
                        <Calendar className="w-2.5 h-2.5" />

                        {new Date(
                          ticket?.created_at,
                        ).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1 text-[8px] font-black">
                        <Clock className="w-2.5 h-2.5" />

                        {new Date(
                          ticket.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="bg-slate-50 group-hover:bg-blue-50 text-slate-300 group-hover:text-blue-500 p-2 rounded-lg transition-all">
                    <ListChecksIcon className="w-4 h-4" />
                  </div>

                  <span className="text-[8px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                    Ver
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="bg-gray-50 rounded-2xl p-10 flex flex-col justify-center items-center border border-dashed text-center">
        <History className="w-10 h-10 mb-3 opacity-10" />

        <p className="font-black opacity-30 uppercase text-[10px]">
          Sin registros
        </p>

        <p className="text-[9px] opacity-40 max-w-[180px]">
          Selecciona un rango de fechas para visualizar el historial.
        </p>
      </div>
    )}

    {historial.length > 0 && (
      <div
        className="flex items-center p-2 mt-2 rounded-xl text-[9px] border-l-4"
        style={{
          backgroundColor: `${colors.secondaryBlueLight}40`,
          borderColor: colors.secondaryBlueLight,
        }}
      >
        <AlertCircleIcon
          className="mr-2 shrink-0 w-3.5 h-3.5"
          style={{ color: colors.secondaryBlueDark }}
        />

        <span
          className="font-black uppercase tracking-wide"
          style={{ color: colors.secondaryBlueDark }}
        >
          Datos históricos según filtros seleccionados.
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
