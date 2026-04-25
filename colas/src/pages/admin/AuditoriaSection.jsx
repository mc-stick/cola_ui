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
        className="bg-white rounded-3xl shadow-sm border p-8 md:p-12 relative overflow-hidden"
        style={{ borderColor: colors.monoSilver }}>
        {/* Línea decorativa superior */}
        <div
          className="absolute top-0 left-0 w-full h-3"
          style={{ backgroundColor: colors.primaryBlue }}></div>

        {/* Encabezado Estilo Index */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2
              className="text-5xl font-black tracking-tighter mb-2"
              style={{ color: colors.primaryBlue }}>
              AUDITORÍA DEL SISTEMA
            </h2>
            <p className="text-lg font-medium opacity-50 uppercase tracking-widest">
              Seguridad y Seguimiento de Acciones
            </p>
          </div>
          <ShieldAlert
            className="w-20 h-20 opacity-10 rotate-12"
            style={{ color: colors.primaryBlue }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-10 mb-4">
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
                  Filtros de búsqueda
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_inicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha_inicio: e.target.value })
                    }
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all"
                    style={{ borderColor: colors.monoSilver }}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_fin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha_fin: e.target.value })
                    }
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all"
                    style={{ borderColor: colors.monoSilver }}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
                    Usuario
                  </label>
                  <select
                    value={filtros.usuario_id}
                    onChange={(e) =>
                      setFiltros({ ...filtros, usuario_id: e.target.value })
                    }
                    className="w-full bg-white border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all"
                    style={{ borderColor: colors.monoSilver }}>
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

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={handleBuscar}
                    className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold transition-transform active:scale-95"
                    style={{ backgroundColor: colors.primaryBlue }}>
                    <Search className="w-4 h-4" /> BUSCAR
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleLimpiar}
                      className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-bold transition-colors">
                      <PaintbrushIcon className="w-3 h-3" /> LIMPIAR
                    </button>
                    <button
                      onClick={() =>
                        exportarCSV(
                          auditoria,
                          `Auditoria-${filtros.fecha_inicio}-al-${filtros.fecha_fin}`,
                        )
                      }
                      disabled={auditoria.length === 0}
                      className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                      <Download className="w-3 h-3" /> EXPORTAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Logs */}
          <div className="lg:col-span-2">
            {LoadingSpin ? (
              <div className="h-full flex items-center justify-center py-20">
                <CardLoader />
              </div>
            ) : auditoria.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {auditoria.map((log) => (
                  <div
                    key={log.id}
                    className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Monitor className="w-4 h-4 opacity-40" />
                          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                            {log.accion}
                          </span>
                          {/* <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            {log.accion}
                          </span> */}
                        </div>

                        {/* Texto Truncado */}
                        <p className="text-gray-700 font-xs line-clamp-1 mb-3">
                          {log.detalle}
                        </p>

                        <button
                          onClick={() => setDetalleSeleccionado(log)}
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors">
                          <Eye className="w-3 h-3" /> Ver detalle completo
                        </button>
                      </div>

                      <div className="text-[10px] flex flex-col items-end shrink-0 gap-1 font-bold">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                          <User className="w-3 h-3" /> {log.nombre}
                        </div>
                        <div className="flex items-center gap-1 opacity-40">
                          <Calendar className="w-3 h-3" />{" "}
                          {new Date(log.fecha).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 opacity-40">
                          <Clock className="w-3 h-3" />{" "}
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
              <div className="bg-gray-50 rounded-3xl p-20 flex flex-col justify-center items-center border border-dashed text-center">
                <History className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-bold opacity-30 uppercase">Sin registros</p>
                <p className="text-xs opacity-40 max-w-[200px]">
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
      <div className="px-12 py-4 bg-white border-t flex items-center shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Formatos recomendados: 1920x1080 (Full HD) para evitar distorsiones en
          pantalla.
        </span>
      </div>
    </div>
  );
}

export default AuditoriaSection;
