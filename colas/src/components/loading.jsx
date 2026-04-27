import {
  ArrowRightLeft,
  BarChart,
  CheckCircle2Icon,
  Clock,
  InfoIcon,
  ListChecksIcon,
  MessageSquare,
  Settings2Icon,
  ThumbsUpIcon,
  Trash2Icon,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import { StarRatingButton } from "./common/Rating";

export function Spinner({ timeout = 1000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), timeout);
    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div className="fixed inset-0  backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
      <div className="flex flex-col items-center justify-center p-12 w-full animate-pulse ">
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
          <Settings2Icon className="absolute w-8 h-8 text-blue-500/50 " />
        </div>
        <div className="mt-6 font-bold text-slate-400 tracking-widest uppercase text-xs">
          Cargando información...
        </div>
      </div>
    </div>
  );
}

export function TabSpinner({ timeout = 1000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), timeout);
    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div className="flex flex-col items-center justify-center p-12 w-full animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
        <Clock className="absolute w-8 h-8 text-blue-500/50" />
      </div>
      <div className="mt-6 font-bold text-slate-400 tracking-widest uppercase text-xs">
        Cargando información...
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title = "¿Confirmar acción?",
  message = "¿Estás seguro de que deseas continuar?",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl border border-white animate-scale-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-blue-50 text-blue-600 rotate-3">
            <InfoIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">{title}</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse w-full shadow-sm mb-3">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-slate-100 flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-3 w-1/3 rounded-full bg-slate-100"></div>
          <div className="h-4 w-3/4 rounded-full bg-slate-200"></div>
        </div>
        <div className="h-8 w-20 rounded-lg bg-slate-50"></div>
      </div>
    </div>
  );
}

export function InfoModal({ ticket = {}, modal = () => {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getHistorialDetail(ticket.id);
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    if (ticket?.id) fetchData();
  }, [ticket.id]);

  console.log(data, "data");

  const calf = data?.map((dat) => dat.Estrellas);

  const promedio =
    calf?.length > 0
      ? calf.reduce((acc, curr) => acc + curr, 0) / calf.length
      : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white animate-scale-in flex flex-col max-h-[90vh]">
        {/* HEADER LIMPIO */}
        <div className="p-6 md:p-8 border-b border-slate-100 relative">
          <button
            onClick={() => modal(false)}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div>
            <div
              className="px-4 py-2 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg w-fit"
              style={{ backgroundColor: ticket.color || "#3b82f6" }}
            >
              <span className="text-xl">{ticket.numero}</span>
              <span className="text-xl">
                {promedio != 0 ? (
                  <StarRatingButton
                    value={promedio || 0}
                    readOnly
                    size={window.innerWidth < 640 ? 16 : 18}
                  />
                ) : (
                  " "
                )}
              </span>
              
            </div><span className="text-gray-500 justify-center flex text-sm">{promedio == 0 && "No evaluado."}</span></div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-50 text-blue-600 text-[12px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Ticket <br /> #{ticket.id}
                </span>
                <div className="flex items-center justify-around gap-2 mb-1">
                  <span className=" m-2 text-slate-400 text-xs font-medium italic">
                    <strong className="text-slate-600">Creado:</strong>
                    <br />
                    {new Date(ticket.created_at).toLocaleDateString()}
                    <br />
                    <span className="text-[10px] not-italic opacity-80">
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </span>

                  <span className=" m-2 text-slate-400 text-xs font-medium italic">
                    <strong className="text-slate-600">Finalizado:</strong>
                    <br />
                    {new Date(ticket.created_at).toLocaleDateString()}
                    <br />
                    <span className="text-[10px] not-italic opacity-80">
                      {new Date(ticket.finalizado_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </span>
                  <span className="m-2 block text-slate-400 text-xs font-medium italic">
                    <strong className="text-slate-600">
                      Lapso de atención:
                    </strong>
                    <br />
                    {(() => {
                      const inicio = new Date(ticket.created_at);
                      const fin = new Date(ticket.finalizado_at);
                      const diffMs = fin - inicio;

                      if (isNaN(diffMs)) return "Pendiente";

                      const diffHrs = Math.floor(diffMs / 3600000);
                      const diffMins = Math.ceil((diffMs % 3600000) / 60000);

                      return (
                        <>
                          <span className="m-2 flex gap-2 text-slate-400 text-xs font-medium italic">
                            <Clock className="w-4 h-4" />
                            Aprox. {diffHrs > 0 ? `${diffHrs}h ` : ""}
                            {diffMins} min
                          </span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {data[0]?.Cliente || "Cargando..."}
              </h2>
            </div>
          </div>

          {data[0]?.cli_comment && (
            <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4  gap-3 items-start">
              <span className="flex gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-1" />{" "}
                Comentario del cliente:
              </span>
              <p className="text-sm text-slate-600 italic">
                "{data[0].cli_comment}"
              </p>
            </div>
          )}
        </div>

        {/* BODY - LISTA DE PASOS */}
        <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50 flex-1 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Línea de atención
          </p>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <CardLoader />
                <CardLoader />
              </div>
            ) : (
              data.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      {/* <div className="bg-slate-50 text-blue-600 font-bold text-lg w-12 h-12 flex items-center justify-center rounded-xl border border-slate-100">
                        {item.Servicio?.substring(0, 2).toUpperCase()}
                      </div> */}
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {item.Servicio}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-3 h-3 text-slate-300" />
                          <span className="text-xs text-slate-500 font-medium">
                            {item.Operador || "Sin asignar"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <ThumbsUpIcon className="w-3 h-3 text-slate-300" />
                          <span className="text-xs text-slate-500 font-medium">
                            {item?.Estrellas ? (
                              <StarRatingButton
                                readOnly
                                value={item.Estrellas || 0}
                                size={window.innerWidth < 640 ? 12 : 16}
                              />
                            ) : (
                              "No calificado"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 pt-3 sm:pt-0">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                        {item.Estado}
                      </span>
                      {item.Transferido === 1 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 mt-1 uppercase">
                          <ArrowRightLeft className="w-3 h-3" /> Transferido
                        </span>
                      )}
                      <span className="m-2 block text-slate-400 text-xs font-medium italic">
                        {(() => {
                          const inicio = new Date(item.Creado);
                          const fin = new Date(item.Finalizado);
                          const diffMs = fin - inicio;

                          if (isNaN(diffMs)) return "Pendiente";

                          const diffHrs = Math.floor(diffMs / 3600000);
                          const diffMins = Math.ceil(
                            (diffMs % 3600000) / 60000,
                          );

                          return (
                            <>
                              <span className="m-2 flex gap-2 text-slate-400 text-xs font-medium italic">
                                <Clock className="w-4 h-4" />
                                Aprox. {diffHrs > 0 ? `${diffHrs}h ` : ""}
                                {diffMins} min
                              </span>
                            </>
                          );
                        })()}
                      </span>
                    </div>
                  </div>

                  {item.comentario && (
                    <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 italic">
                      Nota: {item.comentario}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={() => modal(false)}
            className="w-full sm:w-auto px-10 py-3.5 text-sm font-bold rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
