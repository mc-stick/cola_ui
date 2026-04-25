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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div
        id="modal-transferir"
        className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-fade-in border border-white/20"
      >
        {/* Cabecera del Modal */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="bg-cyan-100 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-100/50 transition-transform hover:rotate-0">
              <ArrowRightLeftIcon className="w-10 h-10 text-cyan-600 -rotate-3" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 tracking-tighter mb-2">
            Transferir Ticket
          </h3>
          <p className="text-gray-500 font-medium">
            Vas a reasignar el ticket:{" "}
            <span className="inline-block px-3 py-1 bg-cyan-600 text-white rounded-lg font-black ml-1 shadow-sm">
              {ticketActual?.numero}
            </span>
          </p>
        </div>

        {/* Lista de Servicios */}
        <div className="mb-8">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
            Seleccionar Servicio de Destino
          </label>
          <div
            id="modal-transferir-items"
            className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar"
          >
            {todosServicios
              .filter((t) => t.service_active === 1)
              .map((servicio) => (
                <label
                  key={servicio.id}
                  className={`group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    servicioSeleccionado === servicio.id
                      ? "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-100"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="servicio"
                      value={servicio.id}
                      checked={servicioSeleccionado === servicio.id}
                      onChange={() => setServicioSeleccionado(servicio.id)}
                      className="peer hidden"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 peer-checked:border-cyan-600 peer-checked:bg-cyan-600 transition-all flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-3 flex-1">
                   
                    <div className="flex flex-col">
                      <span
                        className={`font-bold transition-colors ${
                          servicioSeleccionado === servicio.id
                            ? "text-cyan-900"
                            : "text-gray-700"
                        }`}
                      >
                        {servicio.nombre}
                      </span>
                    </div>
                    <span
                      className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase"
                      style={{
                        backgroundColor: servicio.color,
                        color: "white",
                      }}
                    >
                      {servicio.codigo}
                    </span>
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4">
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-bold transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            id="modal-transferir-confirm"
            onClick={onConfirmar}
            disabled={!servicioSeleccionado}
            className="flex-[1.5] bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-black shadow-lg shadow-cyan-200 transition-all active:scale-95"
          >
            Confirmar Envío
          </button>
        </div>
      </div>
    </div>
  );
};
