import { Check } from "lucide-react";
import TicketQR from "../common/Qr";


export default function PasoConfirmacion({ ticket, servicio, onReset, tipo }) {
  console.log(ticket)
  return (
    <>
      <div  className="animation-fade-in text-center">
        <div id="ticket-creado" className="bg-white m-20 p-12 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8">
              ¡Ticket Generado!
            </h2>

            <div className="text-7xl font-extrabold">{ticket?.numero}</div>

            <div className="text-2xl font-semibold italic mt-10 text-gray-700 mb-4">
              {servicio?.nombre}
            </div>
            {tipo === "sin_id" ? (
              <div className="text-lg font-semibold italic mt-10 text-gray-700 mb-4">
                Por favor, retira tu ticket y espera tu llamado.
              </div>
            ) : (
              <div className="text-lg font-semibold italic mt-10 text-gray-700 mb-4">
                Tu número de ticket se envio por SMS a tu teléfono.
              </div>
            )}

            <TicketQR value={ticket.id} />

            <button
              className="bg-blue-600 hover:bg-blue-700 mt-10 text-white px-12 py-4 rounded-xl font-bold text-xl transition-colors"
              onClick={onReset}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
