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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        Auditoría del Sistema
      </h2>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-semibold">Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className="w-full px-3 py-2 border-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className="w-full px-3 py-2 border-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Usuario</label>
            <select
              value={filtros.usuario_id}
              onChange={(e) =>
                setFiltros({ ...filtros, usuario_id: e.target.value })
              }
              className="w-full px-3 py-2 border-2 rounded-lg">
              <option value="">Todos</option>
              {usuarios.map((user) =>
                user.id !== 1 ? (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ) : (
                  ""
                ),
              )}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleBuscar}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-semibold">
            <Search className="w-5 h-5" />
            Buscar
          </button>

          <button
            disabled={auditoria.length === 0}
            onClick={handleLimpiar}
            className="flex items-center gap-2 bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
            <PaintbrushIcon className="w-5 h-5" />
            Limpiar
          </button>

          <button
            disabled={auditoria.length === 0}
            onClick={() => exportarCSV(auditoria)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
            <Download className="w-5 h-5" />
            CSV
          </button>
        </div>
      </div>

      {LoadingSpin ? (
        <div className="flex justify-center">
          <CardLoader />
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {auditoria.map((log) => (
            <div
              key={log.auditoria_id}
              className="bg-gray-50 rounded-xl p-5 border-l-4 border-red-500">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4" />
                    {log.modulo} · {log.accion}
                  </h3>
                  <div className="bg-warning rounded-md p-2">
                    <p className="text-sm font-bold">
                      Detalles: {" "}
                      <span className="text-sm font-normal italic text-gray-600 mt-1">
                        {log.detalle}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-right ">
                  {/* <div className="italic ">
                    IP: {"("}
                    {log.ip}
                    {")"}
                  </div> */}

                  <span className="flex items-center text-sm font-bold text-blue-500 gap-1">
                    <User className="w-3 h-3" />
                    {log.usuario_nombre} 
                    <br />
                  </span>
                  <span className="flex items-center text-sm font-bold text-blue-500 gap-1">
                    
                    ({log.usuario_rol})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.fecha).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Convertime(log)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {auditoria.length === 0 && (
            <div className="text-center py-16 text-gray-500">
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
