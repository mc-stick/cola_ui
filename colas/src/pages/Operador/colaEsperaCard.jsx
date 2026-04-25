import { FileWarningIcon, Users, Clock, ArrowRightCircle } from "lucide-react";
import { tiempoTranscurrido } from "./TimeUtils";

const colors = {
  primaryBlue: "#1e2a4f",
  primaryRed: "#cc132c",
  primaryYellow: "#fad824",
  monoSilver: "#b2b2b2",
};

export const ColaEsperaCard = ({
  ticketsEspera,
  ticketActual,
  serviciosAsignados,
  usuario,
  onLlamarSiguiente,
}) => {
  const getButtonText = () => {
    if (serviciosAsignados.length === 0) return "Sin servicios asignados";
    if (usuario.puesto_numero === null) return "Sin puesto asignado";
    if (ticketsEspera.length === 0) return "Cola vacía";
    if (ticketActual !== null) return "Finaliza la atención actual";
    return "Llamar Siguiente";
  };

  const idGuardado = localStorage.getItem('idnumt');

 

  // Ordenar: Prioridad 1 primero
  // const ticketsOrdenados = [
  //   ...ticketsEspera.filter((t) => t.priority === 1),
  //   ...ticketsEspera.filter((t) => t.priority !== 1),
  // ].slice(0, 10);

  const ticketsOrdenados = [
    ...ticketsEspera.filter((t) => t.priority === 1),
    ...ticketsEspera.filter((t) => t.priority !== 1),
  ].filter((t) => {
    if (idGuardado && String(t.id) === String(idGuardado)) {
      return false; 
    }
    return true; 
  })
  .slice(0, 10);

 const isButtonDisabled =
    ticketsEspera.length === 0 ||
    ticketActual !== null ||
    serviciosAsignados.length === 0 ||
    usuario.puesto_numero === null ||
    ticketsOrdenados.length === 0;



  return (
    <div id="espera-tk" className="bg-white rounded-[2.5rem] shadow-sm border p-8 relative overflow-hidden flex flex-col h-full" style={{ borderColor: colors.monoSilver }}>
      {/* Barra de acento */}
      <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2" style={{ color: colors.primaryBlue }}>
            <Users className="w-5 h-5 opacity-30" />
            Cola de Espera
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próximos en línea</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black leading-none" style={{ color: colors.primaryBlue }}>
            {ticketsOrdenados.length}
          </span>
          <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">Tickets</span>
        </div>
      </div>

      {/* Alerta de Configuración */}
      {serviciosAsignados.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 animate-pulse">
          <p className="text-amber-700 text-xs font-bold flex items-center gap-3">
            <FileWarningIcon size={18} />
            <span>Configuración incompleta: Sin servicios.</span>
          </p>
        </div>
      )}

      {/* Botón Principal de Acción */}
      <button
        id="llamar-tk"
        onClick={onLlamarSiguiente}
        disabled={isButtonDisabled}
        className={`w-full py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] mb-8 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:scale-100 ${
          isButtonDisabled 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200" 
            : "text-white hover:brightness-110 shadow-blue-900/20"
        }`}
        style={{ backgroundColor: isButtonDisabled ? undefined : colors.primaryBlue }}>
        {getButtonText()}
        {!isButtonDisabled && <ArrowRightCircle size={20} />}
      </button>

      {/* Lista de Tickets */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {ticketsOrdenados.map((ticket, index) => (
          <div
            key={ticket.id}
            className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 relative overflow-hidden"
          >
            {/* Indicador lateral de color del servicio */}
            <div 
              className="absolute left-0 top-0 h-full w-1.5" 
              style={{ backgroundColor: ticket.color || colors.primaryBlue }}
            />

            <div className="flex items-center gap-4 pl-2">
              <div className="bg-white w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-100 shadow-sm">
                {index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tighter" style={{ color: colors.primaryBlue }}>
                    {ticket.numero}
                  </span>
                  {ticket.priority === 1 && (
                    <span className="bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter animate-bounce">
                      Prioridad
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                  {ticket.servicio_nombre}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-blue-500 font-black text-[10px] uppercase tracking-tighter">
                <Clock size={12} strokeWidth={3} />
                {tiempoTranscurrido(ticket.created_at)}
              </div>
              <p className="text-[8px] font-bold text-slate-300 uppercase">En espera</p>
            </div>
          </div>
        ))}

        {ticketsEspera.length === 0 && serviciosAsignados.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-20 group">
             <Users size={48} className="mb-4 group-hover:scale-110 transition-transform duration-500" />
             <p className="text-sm font-black uppercase tracking-widest">Cola Despejada</p>
             <p className="text-[10px] font-bold uppercase mt-1">No hay clientes pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
};