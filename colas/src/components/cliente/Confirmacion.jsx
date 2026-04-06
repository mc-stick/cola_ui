import { Check, Smartphone, Receipt, ArrowRight } from "lucide-react";
// import TicketQR from "../common/Qr"; // Descomenta si vas a usarlo

export default function PasoConfirmacion({ 
  ticket, 
  servicio, 
  onReset, 
  tipo, 
  identificacion, 
  setIdentificacion 
}) {

  const fin = () => {
    setIdentificacion("");
    onReset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-5">
      <div className="bg-white rounded-[3rem] overflow-hidden">
        {/* Encabezado de Éxito */}
        <div className="flex bg-emerald-500 p-5 text-center relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter rounded-3xl flex items-center justify-center mx-auto  animate-bounce-in">
            ¡Ticket Generado!
          </h2>
          {/* Decoración lateral de ticket */}
          <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-4 h-8 bg-white rounded-full" />
            ))}
          </div>
        </div>

        {/* Cuerpo del Ticket */}
        <div className="p-10 pt-14 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mb-2">
            Tu turno es
          </p>
          
          <div className="text-4xl md:text-4xl font-black text-slate-800 tracking-tighter mb-4 animate-pulse">
            {ticket?.numero || "---"}
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-700 rounded-full font-black text-sm mb-10">
            <Receipt size={18} /> {servicio?.nombre?.toUpperCase()}
          </div>

          <hr className="border-dashed border-slate-200 mb-10" />

          {/* Mensajes condicionales estilizados */}
          <div className="px-6">
            {tipo === "sin_id" ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                  Por favor, <b>retira tu ticket físico</b> de la impresora y espera a ser llamado en pantalla.
                </p>
              </div>
            ) : tipo === "telefono" ? (
              <div className="flex flex-col items-center gap-3 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                <Smartphone className="text-blue-600 mb-2" size={32} />
                <p className="text-slate-600 text-lg font-medium">
                  Hemos enviado un <b>SMS</b> a tu móvil con los detalles de tu turno.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-slate-600 text-lg font-medium">
                  
                  <b>Por favor, toma asiento</b> y espera tu llamado.
                </p>
              </div>
            )}
          </div>

          {/* Botón de Finalización */}
          <button
            onClick={fin}
            className="group w-full mt-6 bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95"
          >
            FINALIZAR
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}