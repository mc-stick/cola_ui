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
  Users,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  TabSpinner,
  InfoModal,
  DotsLoader,
  CardLoader,
} from "../../components/loading";
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
      atendido: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Atendido",
      },
      no_presentado: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "No Atendido",
      },
      espera: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "En Espera",
      },
      llamado: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: PhoneCall,
        label: "Llamado",
      },
      en_atencion: {
        bg: "bg-warning",
        text: "text-orange-700",
        icon: AlertCircle,
        label: "En Atención",
      },
      cancelado: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: XCircle,
        label: "Cancelado",
      },
    };
    return estados[estado] || estados.espera;
  };

  const handleCargarHistorial = async () => {
    setLoadingSpin(true);
    if (!validarFiltrosHistorial(filtrosHistorial)) {
      return;
    }
    try {
      await onCargarHistorial(filtrosHistorial);
    } catch {
    } finally {
      setTimeout(() => {
        setLoadingSpin(false);
      }, 1000);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltrosHistorial({
      fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      fecha_fin: new Date().toISOString().split("T")[0],
      servicio_id: "",
      estado: "",
      operador: "",
    });
    setHistorial([]);
    toast.success("Limpiando filtro de búsqueda.");
  };

  return (
    <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] flex items-center gap-3">
        <History className="w-8 h-8 text-[var(--color-primary-yellow)]" />
        Historial de Tickets
      </h2>
<div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5 mt-10"></div>
      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Inicio
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
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtrosHistorial.fecha_fin}
              onChange={(e) => {
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  fecha_fin: e.target.value,
                });
                handleCargarHistorial();
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Servicio
            </label>
            <select
              value={filtrosHistorial.servicio_id}
              onChange={(e) => {
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  servicio_id: e.target.value,
                });
                setHistorial([]);
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
              <option value="">Todos</option>
              {servicios.map((servicio) => (
                <option
                  key={servicio.id}
                  value={servicio.id}
                  className={`${
                    servicio.service_active === 1
                      ? ""
                      : "bg-red-100 text-red-700"
                  }`}
                  disabled={servicio.service_active !== 1}>
                  {servicio.codigo} - {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtrosHistorial.estado}
              onChange={(e) => {
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  estado: e.target.value,
                });
                setHistorial([]);
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
              <option value="">Todos</option>
              <option value="atendido">Atendido</option>
              <option value="no_presentado">No Atendido</option>
              <option value="llamado">Llamado</option>
              <option value="espera">En Espera</option>
            </select>
          </div>

          {/* Operador */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Atendido por:
            </label>
            <select
              value={filtrosHistorial.operador}
              onChange={(e) => {
                setFiltrosHistorial({
                  ...filtrosHistorial,
                  operador: e.target.value,
                });
                setHistorial([]);
              }}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
              <option value="">Todos</option>
              {usuarios
                .filter((u) => u.rol === "operador")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCargarHistorial}
            className={`flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors ${
              historial.length > 0 ? "" : "bg-green-600"
            }`}>
            <Search className="w-5 h-5 animate-bounce font-bold mt-1" />
            Buscar
          </button>

          <button
            disabled={historial.length <= 0}
            onClick={handleLimpiarFiltros}
            className={`flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold transition-colors ${
              historial.length <= 0
                ? "bg-gray-400 hover:cursor-not-allowed"
                : "bg-amber-700 hover:bg-amber-600"
            }`}>
            <PaintbrushIcon className="w-5 h-5" />
            Limpiar Filtro
          </button>

          {!LoadingSpin && (
            <button
              disabled={historial.length <= 0}
              onClick={() => exportarCSV(historial)}
              className={`flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold transition-colors ${
                historial.length <= 0
                  ? "bg-gray-400 hover:cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}>
              <Download className="w-5 h-5 animate-bounce font-bold mt-1" />
              Descargar CSV
            </button>
          )}
        </div>
      </div>

      {/* Lista de tickets */}
      {LoadingSpin ? (
        <div className="flex justify-center text-center">
          <CardLoader />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Mostrando{" "}
              <span className="font-bold text-gray-800">
                {historial.length}
              </span>{" "}
              tickets
            </p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {historial.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <History className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold">
                  No hay tickets en el historial
                </p>
                <p className="text-sm mt-2">
                  Ajusta los filtros para ver más resultados
                </p>
              </div>
            )}

            {historial.map((ticket) => {
              const estadoInfo = getEstadoBadge(ticket.accion);
              const IconoEstado = estadoInfo.icon;

              return (
                <div
                  key={ticket.id}
                  className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all border-l-4"
                  style={{
                    borderLeftColor: ticket.servicio_color || "#6B7280",
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Izquierda: info principal */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Número de Ticket */}
                      <div className="flex-shrink-0">
                        <div
                          className="text-4xl font-extrabold"
                          style={{ color: ticket.servicio_color }}>
                          {ticket.numero}
                        </div>
                        <div className="text-xs text-gray-500 text-center font-bold mt-2">
                          Ticket #<strong>{ticket.id}</strong>
                        </div>
                      </div>

                      {/* Info del Ticket */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {ticket.servicio_nombre}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${estadoInfo.bg} ${estadoInfo.text} flex items-center gap-1`}>
                            <IconoEstado className="w-3 h-3" />
                            {estadoInfo.label}
                          </span>
                        </div>

                        {/* Cliente */}
                        {ticket.identificacion && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Cliente:</span>
                            <span>
                              {ticket.tipo_identificacion}:{" "}
                              {ticket.identificacion}
                            </span>
                          </div>
                        )}

                        {/* Operador */}
                        {ticket.operador_nombre && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">Atendido por:</span>
                            <span>{ticket.operador_nombre}</span>
                            {ticket.puesto_numero && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                Puesto {ticket.puesto_numero}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Detalles */}
                        {ticket.detalles && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneCall className="w-4 h-4" />
                            <span>{ticket.detalles}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Derecha: Fechas y acciones */}
                    <div className="flex-shrink-0 text-right space-y-2">
                      <div className="space-y-1 text-xs text-gray-500 border-t pt-2 mt-2">
                        {ticket.accion !== "creado" ? (
                          <div className="flex items-center gap-2 justify-end">
                            <User className="w-3 h-3" />
                            <span>Atendido por:</span>
                            <span className="font-bold text-violet-600">
                              {ticket.usuario_nombre}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-amber-500">
                              En espera
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 justify-end">
                          <Clock className="w-3 h-3 text-green-500" />
                          <span className="font-bold">Creado:</span>
                          <span className="font-semibold italic">
                            {new Date(ticket.created_at).toLocaleString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </span>
                        </div>

                        {ticket.llamado_at && (
                          <div className="flex items-center gap-2 justify-end">
                            <PhoneCall className="w-3 h-3" />
                            <span>Llamado:</span>
                            <span className="font-semibold">
                              {new Date(ticket.llamado_at).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        )}

                        {ticket.atendido_at && (
                          <div className="flex items-center gap-2 justify-end">
                            <CheckCircle className="w-3 h-3" />
                            <span>Atendido:</span>
                            <span className="font-semibold">
                              {new Date(ticket.atendido_at).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setModalinfo(ticket)}
                            className="flex items-center justify-center">
                            <ListChecksIcon className="mt-1 mr-2 w-4 h-4 text-green-500" />
                            <span className="font-bold underline text-blue-500 hover:text-red-500">
                              Ver más detalles
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de detalles */}
      {modalinfo && (
        <InfoModal ticket={modalinfo} modal={() => setModalinfo(null)} />
      )}
    </div>
  );
}

export default HistorialSection;
