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
} from "lucide-react";
import { toast } from "react-toastify";
import { CardLoader } from "../../components/loading";
import { exportarCSV } from "../../components/jsontoCsv";

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
    setFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      usuario_id: "",
      modulo: "",
    });
    setAuditoria([]);
    toast.success("Filtros limpiados");
  };

  const Convertime = (log) => {
    const [h, m] = log.hora.split(":");
    const hora12 = new Date(1970, 0, 1, h, m).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return hora12;
  };

  useEffect(() => {
    handleBuscar();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
      {/* Título */}
      <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
        <ShieldAlert className="w-10 h-10 text-red-600" />
        Auditoría del Sistema
      </h2>
      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5 mt-10"></div>
      {/* Filtros */}
      <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Usuario */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Usuario
            </label>
            <select
              value={filtros.usuario_id}
              onChange={(e) =>
                setFiltros({ ...filtros, usuario_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Todos</option>
              {usuarios.map((user) =>
                user.id !== 1 ? (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ) : null,
              )}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            onClick={handleBuscar}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition-colors">
            <Search className="w-5 h-5" />
            Buscar
          </button>

          <button
            disabled={auditoria.length === 0}
            onClick={handleLimpiar}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white shadow-md transition-colors
          ${auditoria.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-amber-700 hover:bg-amber-800"}`}>
            <PaintbrushIcon className="w-5 h-5" />
            Limpiar
          </button>

          <button
            disabled={auditoria.length === 0}
            onClick={() => exportarCSV(auditoria)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white shadow-md transition-colors
          ${auditoria.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
            <Download className="w-5 h-5" />
            CSV
          </button>
        </div>
      </div>

      {/* Tabla / Lista de Auditoría */}
      {LoadingSpin ? (
        <div className="flex justify-center py-12">
          <CardLoader />
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {auditoria.length > 0 ? (
            auditoria.map((log) => (
              <div
                key={log.auditoria_id}
                className="bg-gray-50 rounded-xl p-5 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-gray-600" />
                      {log.modulo} · {log.accion}
                    </h3>

                    <div className="bg-yellow-50 rounded-md p-2">
                      <p className="text-sm font-bold">
                        Detalles:{" "}
                        <span className="text-gray-600 font-normal italic">
                          {log.detalle}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-right flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-blue-500 font-bold">
                      <User className="w-3 h-3" />
                      {log.usuario_nombre} ({log.usuario_rol})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {new Date(log.fecha).toLocaleDateString("es-ES")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {Convertime(log)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <History className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold">
                No hay registros de auditoría
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditoriaSection;
