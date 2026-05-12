import { Check, Smartphone, Receipt, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
// import TicketQR from "../common/Qr"; // Descomenta si vas a usarlo

export default function PasoConfirmacion({ 
  ticket, 
  servicio, 
  onReset, 
  tipo, 
  identificacion, 
  setIdentificacion 
}) {
  const [contador, setContador] = useState(10);

  const fin = () => {
    setIdentificacion("");
    onReset();
  };

  useEffect(() => {
    if (contador === 0) {
      fin();
      return;
    }
    const timer = setTimeout(() => setContador((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [contador]);

  return (
    <div id="ticket-creado" className="w-full max-w-2xl mx-auto animate-fade-in pb-3">
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Encabezado de Éxito */}
        <div className="flex bg-emerald-500 p-3 text-center relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce-in">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter rounded-2xl flex items-center justify-center mx-auto  animate-bounce-in">
            ¡Ticket Generado!
          </h2>
          {/* Decoración lateral de ticket */}
          <div className="absolute -bottom-3 left-0 right-0 flex justify-between px-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-3 h-6 bg-white rounded-full" />
            ))}
          </div>
        </div>

        {/* Cuerpo del Ticket */}
        <div className="p-6 pt-10 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mb-1">
            Tu turno es
          </p>
          
          <div className="text-3xl md:text-3xl font-black text-slate-800 tracking-tighter mb-3 animate-pulse">
            {ticket?.numero || "---"}
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-black text-xs mb-6">
            <Receipt size={14} /> {servicio?.nombre?.toUpperCase()}
          </div>

          <hr className="border-dashed border-slate-200 mb-6" />

          {/* Mensajes condicionales estilizados */}
          <div className="px-4">
            {tipo === "sin_id" ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  Por favor, <b>retira tu ticket físico</b> de la impresora y espera a ser llamado en pantalla.
                </p>
              </div>
            ) : tipo === "telefono" ? (
              <div className="flex flex-col items-center gap-2 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <Smartphone className="text-blue-600 mb-1" size={24} />
                <p className="text-slate-600 text-sm font-medium">
                  Hemos enviado un <b>SMS</b> a tu móvil con los detalles de tu turno.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-600 text-sm font-medium">
                  
                  <b>Por favor, toma asiento</b> y espera tu llamado.
                </p>
              </div>
            )}
          </div>

          {/* Botón de Finalización */}
          <button
            onClick={fin}
            className="group w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-lg font-black text-base transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
          >
            FINALIZAR
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>
      </div>
      

    </div>
  );
}