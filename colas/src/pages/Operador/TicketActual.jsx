import {
  Bell,
  PhoneCall,
  Check,
  X,
  TicketIcon,
  ClockIcon,
  ArrowRightLeftIcon,
} from "lucide-react";

export const TicketActualCard = ({
  ticketActual,
  comentario,
  onComentarioChange,
  onReLlamar,
  onAtendido,
  onNoPresento,
  onMasTarde,
  onTransferir,
}) => {
  return (
    <div id="atencion-tk" className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-blue-600" />
        Ticket Actual
      </h3>

      {ticketActual ? (
        <div className="text-center">
          <div
            className="text-7xl font-extrabold mb-4 animate-pulse"
            style={{ color: ticketActual.servicio_color || "#1E40AF" }}>
            {ticketActual.numero}
          </div>
          <div className="text-2xl text-gray-700 mb-2 font-semibold">
            {ticketActual.servicio_nombre}
          </div>
          <div id="llamar-tk-again-number" className="text-sm text-gray-500 mb-6">
            Llamado{" "}
            <span>
              {ticketActual.llamado_veces || 1}{" "}
              {ticketActual.llamado_veces === 1 ? "vez" : "veces"}
            </span>
          </div>

          <div>
            <div id="btns-tk" className="grid grid-cols-1 gap-3 mt-8">
                
              <button
                id="llamar-tk-again"
                onClick={onReLlamar}
                disabled={ticketActual.llamado_veces >= 5 }
                className={`flex items-center justify-center gap-2
                 ${ticketActual.llamado_veces >= 5 ? "bg-gray-500 hover:bg-gray-600 hover: cursor-not-allowed":  "bg-yellow-500 hover:bg-yellow-600"} text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg`}>
                <PhoneCall className="w-6 h-6" />
                Llamar de Nuevo
              </button>
              <button
                onClick={onAtendido}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                <Check className="w-6 h-6" />
                Atendido
              </button>
              <button
                onClick={onNoPresento}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                <X className="w-6 h-6" />
                No se Presentó
              </button>
              <button
                onClick={onMasTarde}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                <ClockIcon className="w-6 h-6" />
                Volver mas tarde.
              </button>
              <button
                id="llamar-tk-transfer"
                onClick={onTransferir}
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                <ArrowRightLeftIcon className="w-6 h-6" />
                Transferir
              </button>
            </div>
            <div id="message-box" className="mt-2">
              <textarea
                id="message"
                rows="3"
                value={comentario}
                onChange={(e) => onComentarioChange(e.target.value)}
                className="gap-3 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
                placeholder="Agrega un comentario aqui..."></textarea>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TicketIcon className="w-24 h-24 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No hay ticket en atención</p>
          <p className="text-gray-400 text-sm mt-2">
            Llama al siguiente cliente de la cola
          </p>
        </div>
      )}
    </div>
  );
};