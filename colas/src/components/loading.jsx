import {
  ArrowRightLeft,
  BarChart,
  CheckCircle2Icon,
  Clock,
  InfoIcon,
  ListChecksIcon,
  MessageSquare,
  Trash2Icon,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export function Spinner({ timeout = 1000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), timeout);
    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
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
              className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white animate-scale-in flex flex-col max-h-[90vh]">
        {/* HEADER LIMPIO */}
        <div className="p-6 md:p-8 border-b border-slate-100 relative">
          <button
            onClick={() => modal(false)}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div
              className="px-4 py-2 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg w-fit"
              style={{ backgroundColor: ticket.color || "#3b82f6" }}>
              <span className="text-xl">{ticket.numero}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Ticket #{ticket.id}
                </span>
                <span className="text-slate-400 text-xs font-medium italic">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {data[0]?.Cliente || "Cargando..."}
              </h2>
            </div>
          </div>

          {data[0]?.cli_comment && (
            <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start">
              <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
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
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
            className="w-full sm:w-auto px-10 py-3.5 text-sm font-bold rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
