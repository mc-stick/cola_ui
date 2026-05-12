import { useEffect, useState } from "react";
import {
  History,
  Filter,
  Search,
  PaintbrushIcon,
  User,
  Clock,
  ShieldAlert,
  Monitor,
  Download,
  Calendar,
  AlertCircleIcon,
  X,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { CardLoader } from "../../components/loading";
import { exportarCSV } from "../../components/jsontoCsv";

// Colores definidos en tu diseño base
const colors = {
  primaryBlue: "#003366",
  primaryYellow: "#FFCC00",
  primaryRed: "#CC0000",
  secondaryBlueLight: "#E6F0FA",
  secondaryBlueDark: "#0056b3",
  monoSilver: "#E2E8F0",
};

function AuditoriaSection({
  auditoria,
  setAuditoria,
  usuarios,
  LoadingSpin,
  setLoadingSpin,
  onCargarAuditoria,
}) {
  const [filtros, setFiltros] = useState({
    fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    fecha_fin: new Date().toISOString().split("T")[0],
    usuario_id: "",
  });

  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const handleBuscar = async () => {
    setLoadingSpin(true);
    try {
      await onCargarAuditoria(filtros);
    } catch {
      toast.error("Error al cargar auditoría");
    } finally {
      setTimeout(() => setLoadingSpin(false), 800);
    }
  };

  const handleLimpiar = () => {
    setFiltros({ fecha_inicio: "", fecha_fin: "", usuario_id: "" });
    setAuditoria([]);
    toast.success("Filtros eliminados");
  };

  useEffect(() => {
    handleBuscar();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="bg-white rounded-3xl shadow-sm border p-8 md:p-6 relative overflow-hidden"
        style={{ borderColor: colors.monoSilver }}>
        {/* Línea decorativa superior */}
       

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
              <span className="text-[#1e2a4f]">Auditoria</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Panel de auditoria
            </p>
          </div>
        </div>

       

       <div className="grid lg:grid-cols-3 gap-6 mb-3">

  {/* PANEL FILTROS */}
  <div className="space-y-4">

    <div className="bg-gray-50 mt-2 rounded-[1.4rem] p-4 border border-dashed">
      <div className="flex items-center gap-2 mb-4">
        <Filter
          className="w-4 h-4"
          style={{ color: colors.primaryBlue }}
        />

        <span className="font-black uppercase tracking-widest text-[10px] opacity-70">
          Filtros de búsqueda
        </span>
      </div>

      <div className="space-y-3">

        {/* FECHA INICIO */}
        <div>
          <label className="text-[9px] font-black uppercase mb-1 block opacity-60 tracking-wider">
            Fecha Inicio
          </label>

          <input
            type="date"
            value={filtros.fecha_inicio}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                fecha_inicio: e.target.value,
              })
            }
            className="w-full bg-white border rounded-xl px-3 py-2 text-[11px] focus:ring-2 outline-none transition-all"
            style={{ borderColor: colors.monoSilver }}
          />
        </div>

        {/* FECHA FIN */}
        <div>
          <label className="text-[9px] font-black uppercase mb-1 block opacity-60 tracking-wider">
            Fecha Fin
          </label>

          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                fecha_fin: e.target.value,
              })
            }
            className="w-full bg-white border rounded-xl px-3 py-2 text-[11px] focus:ring-2 outline-none transition-all"
            style={{ borderColor: colors.monoSilver }}
          />
        </div>

        {/* USUARIO */}
        <div>
          <label className="text-[9px] font-black uppercase mb-1 block opacity-60 tracking-wider">
            Usuario
          </label>

          <select
            value={filtros.usuario_id}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                usuario_id: e.target.value,
              })
            }
            className="w-full bg-white border rounded-xl px-3 py-2 text-[11px] focus:ring-2 outline-none transition-all"
            style={{ borderColor: colors.monoSilver }}
          >
            <option value="">Todos los usuarios</option>

            {usuarios.map(
              (user) =>
                user.id !== 1 && (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ),
            )}
          </select>
        </div>

        {/* BOTONES */}
        <div className="pt-2 flex flex-col gap-2">

          <button
            onClick={handleBuscar}
            className="w-full flex items-center justify-center gap-2 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <Search className="w-3.5 h-3.5" />
            Buscar
          </button>

          <div className="grid grid-cols-2 gap-2">

            <button
              onClick={handleLimpiar}
              className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-[9px] font-black uppercase transition-colors"
            >
              <PaintbrushIcon className="w-3 h-3" />
              Limpiar
            </button>

            <button
              onClick={() =>
                exportarCSV(
                  auditoria,
                  `Auditoria-${filtros.fecha_inicio}-al-${filtros.fecha_fin}`,
                )
              }
              disabled={auditoria.length === 0}
              className="flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-xl text-[9px] font-black uppercase transition-colors disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* LISTADO */}
  <div className="lg:col-span-2">

    {LoadingSpin ? (
      <div className="h-full flex items-center justify-center py-14">
        <CardLoader />
      </div>
    ) : auditoria.length > 0 ? (

      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">

        {auditoria.map((log) => (
          <div
            key={log.id}
            className="group bg-white rounded-[1.2rem] p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default"
          >
            <div className="flex justify-between items-start gap-3">

              {/* IZQUIERDA */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-3.5 h-3.5 opacity-40" />

                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                    {log.accion}
                  </span>
                </div>

                <p className="text-[11px] text-gray-700 line-clamp-1 mb-2">
                  {log.detalle}
                </p>

                <button
                  onClick={() => setDetalleSeleccionado(log)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Ver detalle
                </button>
              </div>

              {/* DERECHA */}
              <div className="text-[9px] flex flex-col items-end shrink-0 gap-1 font-bold">

                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                  <User className="w-2.5 h-2.5" />
                  {log.nombre}
                </div>

                <div className="flex items-center gap-1 opacity-40">
                  <Calendar className="w-2.5 h-2.5" />

                  {new Date(log.fecha).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1 opacity-40">
                  <Clock className="w-2.5 h-2.5" />

                  {new Date(log.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    ) : (
      <div className="bg-gray-50 rounded-[1.5rem] p-14 flex flex-col justify-center items-center border border-dashed text-center">

        <History className="w-12 h-12 mb-3 opacity-10" />

        <p className="font-black text-sm opacity-30 uppercase">
          Sin registros
        </p>

        <p className="text-[10px] opacity-40 max-w-[180px] mt-1">
          No se encontraron acciones para los filtros seleccionados.
        </p>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Modal de Detalle */}
      {detalleSeleccionado && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div
              className="p-6 flex justify-between items-center border-b"
              style={{ backgroundColor: colors.secondaryBlueLight }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ShieldAlert
                    className="w-6 h-6"
                    style={{ color: colors.primaryBlue }}
                  />
                </div>
                <div>
                  <h3 className="font-black text-blue-900 leading-none">
                    DETALLE DE ACCIÓN
                  </h3>
                  <span className="text-[20px] font-bold opacity-50 uppercase tracking-tighter">
                    ID Registro: # {detalleSeleccionado.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex gap-4">
                <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">
                  Acción: 
                </label>
                <Monitor className="w-4 h-4 opacity-40" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {detalleSeleccionado.accion}
                </span></div>
                <br />
                <label className="text-[12px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Descripción de cambios realizados
                </label>
                <div className="bg-gray-50 rounded-2xl p-6 border text-gray-700 leading-relaxed font-medium">
                  {detalleSeleccionado.detalle.split(",").map((item, index) => (
                    <p key={index} className="mb-1">
                      {item.trim()}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">
                    Usuario
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {detalleSeleccionado.nombre}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">
                    Fecha y Hora
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {new Date(detalleSeleccionado.fecha).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="px-8 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                style={{ backgroundColor: colors.primaryBlue, color: "white" }}>
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default AuditoriaSection;
