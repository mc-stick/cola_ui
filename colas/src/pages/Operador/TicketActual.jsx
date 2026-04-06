import {
  Bell,
  PhoneCall,
  Check,
  X,
  TicketIcon,
  ClockIcon,
  ArrowRightLeftIcon,
  MessageSquare
} from "lucide-react";
import { useEffect, useState } from "react";
import { TabSpinner } from "../../components/loading";

const colors = {
  primaryBlue: "#1e2a4f",
  primaryRed: "#cc132c",
  primaryYellow: "#fad824",
  primaryGreen: "#499c35",
  secondaryBlueLight: "#4ec2eb",
  monoSilver: "#b2b2b2",
};

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
  const [btns, setbtns] = useState(false);

  useEffect(() => {
    if (!ticketActual) return;
    setbtns(true);
    const timer = setTimeout(() => setbtns(false), 5000);
    return () => clearTimeout(timer);
  }, [ticketActual?.id]);

  return (
    <div id="atencion-tk" className="bg-white rounded-[2.5rem] shadow-sm border p-8 relative overflow-hidden transition-all duration-500" style={{ borderColor: colors.monoSilver }}>
      {/* Acento superior de diseño */}
      <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: colors.primaryBlue }}></div>

      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase" style={{ color: colors.primaryBlue }}>
          <Bell className="w-6 h-6 opacity-30" />
          Atención en Curso
        </h3>
        {ticketActual && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Canal Activo</span>
          </div>
        )}
      </div>

      {ticketActual ? (
        <div className="flex flex-col gap-6">
          {/* VISUALIZACIÓN DEL TICKET */}
          <div className="bg-gray-50 rounded-[2rem] p-10 flex flex-col items-center justify-center border border-dashed text-center relative overflow-hidden">
            {/* <div className="absolute  opacity-5">
              
            </div> */}

            {ticketActual.comentario && (
              <div className="mb-4 flex items-start gap-3 p-4 bg-white rounded-2xl border-l-4 shadow-sm w-full text-left" style={{ borderColor: colors.primaryYellow }}>
                <MessageSquare className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: colors.primaryYellow }} />
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Nota adjunta</p>
                  <p className="text-sm font-medium italic text-gray-600 leading-tight">"{ticketActual.comentario}"</p>
                </div>
              </div>
            )}

            <div className="flex text-[6rem] font-black gap-2 leading-none tracking-tighter mb-2" style={{ color: ticketActual.color || colors.primaryBlue }}>
              <TicketIcon className="opacity-50 mt-1 mr-4" size={80} />{ticketActual.numero}
            </div>
            
            <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-4">{ticketActual.servicio_nombre}</p>
            
            <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border shadow-sm">
               <ClockIcon className="w-3 h-3 opacity-40" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Llamado {ticketActual.llamado || 1} {ticketActual.llamado === 1 ? "vez" : "veces"}
               </span>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="space-y-4">
            {btns ? (
              <div className="py-12 bg-gray-50 rounded-3xl border border-dashed flex flex-col items-center gap-4">
                <TabSpinner />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Sincronizando terminales...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <BotonReLlamar ticketActual={ticketActual} onReLlamar={onReLlamar} disabledbtn={btns} />
                  
                  <button
                    disabled={btns}
                    onClick={onAtendido}
                    className="flex items-center justify-center gap-2 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-green-900/10"
                    style={{ backgroundColor: colors.primaryGreen }}>
                    <Check className="w-5 h-5" /> Atendido
                  </button>

                  <button
                    disabled={btns}
                    onClick={onNoPresento}
                    className="flex items-center justify-center gap-2 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-red-900/10"
                    style={{ backgroundColor: colors.primaryRed }}>
                    <X className="w-5 h-5" /> No presentado
                  </button>

                  <button
                    disabled={btns}
                    onClick={onMasTarde}
                    className="flex items-center justify-center gap-2 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-indigo-900/10"
                    style={{ backgroundColor: "#5850ec" }}>
                    <ClockIcon className="w-5 h-5" /> Posponer
                  </button>
                </div>

                <button
                  disabled={btns}
                  onClick={onTransferir}
                  className="w-full flex items-center justify-center gap-2 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-cyan-900/10"
                  style={{ backgroundColor: colors.secondaryBlueLight }}>
                  <ArrowRightLeftIcon className="w-5 h-5" /> Transferir a otra sección
                </button>

                {/* ÁREA DE NOTAS INTERNAS */}
                <div className="relative mt-2">
                  <div className="absolute -top-2 left-4 bg-white px-2 z-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Observaciones de atención
                  </div>
                  <textarea
                    rows="3"
                    value={comentario}
                    onChange={(e) => onComentarioChange(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder:opacity-30"
                    placeholder="Agregue información relevante aquí..."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
            <TicketIcon className="w-10 h-10 opacity-10" />
          </div>
          <h4 className="text-lg font-black tracking-tighter opacity-20 uppercase">Sin ticket activo</h4>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mt-2">Esperando asignación</p>
        </div>
      )}
    </div>
  );
};

function BotonReLlamar({ ticketActual, onReLlamar, disabledbtn }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = () => {
    if (loading || ticketActual.llamado >= 5) return;
    onReLlamar();
    setLoading(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 2; 
      });
    }, 100);
    return () => clearInterval(interval);
  }, [loading]);

  const limitReached = ticketActual.llamado >= 5;

  return (
    <button
      onClick={handleClick}
      disabled={disabledbtn || loading || limitReached}
      className={`relative overflow-hidden w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
        limitReached || disabledbtn ? "bg-slate-300 cursor-not-allowed opacity-60" : "hover:brightness-110"
      } text-white`}
      style={{ backgroundColor: (limitReached || disabledbtn) ? undefined : colors.primaryYellow }}>
      
      {loading && (
        <span
          className="absolute left-0 top-0 h-full bg-black/10 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2 text-slate-900">
        <PhoneCall className="w-5 h-5" />
        {loading
          ? "Sincronizando..."
          : limitReached
            ? "Límite alcanzado"
            : "Llamar de nuevo"}
      </span>
    </button>
  );
}