import { FileWarningIcon } from "lucide-react";
import { tiempoTranscurrido } from "./TimeUtils";

export const ColaEsperaCard = ({
  ticketsEspera,
  ticketActual,
  serviciosAsignados,
  usuario,
  onLlamarSiguiente,
}) => {
  const getButtonText = () => {
    if (serviciosAsignados.length === 0) {
      return "Sin servicios asignados";
    }
    if (usuario.puesto_numero === null) {
      return "No tienes un puesto asignado";
    }
    if (ticketsEspera.length === 0) {
      return "No hay tickets en espera";
    }
    if (ticketActual !== null) {
      return "Atendiendo un ticket";
    }
    return "Llamar Siguiente";
  };

  const isButtonDisabled =
    ticketsEspera.length === 0 ||
    ticketActual !== null ||
    serviciosAsignados.length === 0 ||
    usuario.puesto_numero === null;

  return (
    <div id="espera-tk" className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Tickets en Espera
        </h3>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
          {ticketsEspera.length}
        </div>
      </div>

      {serviciosAsignados.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-800 text-sm flex">
            <FileWarningIcon />{" "}
            <span className="ml-2">
              No tienes servicios asignados. Contacta al administrador.
            </span>
          </p>
        </div>
      )}

      <button
        id="llamar-tk"
        onClick={onLlamarSiguiente}
        disabled={isButtonDisabled}
        className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-xl mb-6 transition-all transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg">
        {getButtonText()}
      </button>

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {ticketsEspera.slice(0, 10).map((ticket, index) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border-l-4"
            style={{
              borderLeftColor: ticket.servicio_color || "#1E40AF",
            }}>
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                {index + 1}
              </div>
              <span
                className="text-2xl font-bold"
                style={{ color: ticket.servicio_color || "#1E40AF" }}>
                {ticket.numero}
              </span>
            </div>
            <div className="text-right">
              <div className="text-gray-700 font-semibold">
                {ticket.servicio_nombre}
              </div>
              {ticket.transferido === 1 && (
                <div className="text-red-700 font-semibold text-xs">
                  Transferido (Prioridad)
                </div>
              )}
              <div className="text-sm text-indigo-600">
                {tiempoTranscurrido(ticket.created_at)}
              </div>
            </div>
          </div>
        ))}

        {ticketsEspera.length === 0 && serviciosAsignados.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay tickets en espera</p>
            <p className="text-sm mt-2">para tus servicios asignados</p>
          </div>
        )}
      </div>
    </div>
  );
};