import { ArrowRightLeftIcon } from "lucide-react";

export const TransferModal = ({
  showTransferModal,
  ticketActual,
  todosServicios,
  servicioSeleccionado,
  setServicioSeleccionado,
  onConfirmar,
  onCerrar,
}) => {
  if (!showTransferModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        id="modal-transferir"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeftIcon className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Transferir Ticket
          </h3>
          <p className="text-gray-600">
            Ticket:{" "}
            <span className="font-bold text-cyan-600">
              {ticketActual?.numero}
            </span>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Seleccionar Servicio de Destino
          </label>
          <div
            id="modal-transferir-items"
            className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {todosServicios.map((servicio) => (
              <label
                key={servicio.id}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  servicioSeleccionado === servicio.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <input
                  type="radio"
                  name="servicio"
                  value={servicio.id}
                  checked={servicioSeleccionado === servicio.id}
                  onChange={() => setServicioSeleccionado(servicio.id)}
                  className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="ml-3 flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: servicio.color }}></div>
                  <span className="font-semibold text-gray-800">
                    {servicio.nombre}
                  </span>
                  <span
                    className="ml-auto text-xs font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: servicio.color,
                      color: "white",
                    }}>
                    {servicio.codigo}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-bold transition-colors">
            Cancelar
          </button>
          <button
            id="modal-transferir-confirm"
            onClick={onConfirmar}
            disabled={!servicioSeleccionado}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-bold transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};