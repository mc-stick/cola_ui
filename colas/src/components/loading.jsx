import {
  ArrowRightLeft,
  CheckCircle2Icon,
  Clock,
  InfoIcon,
  Trash2Icon,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export function Spinner({ timeout = 1000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-blue-500"></div>
      </div>
    </div>
  );
}

export function TabSpinner({ timeout = 1000, onClose }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configData] = await Promise.all([api.getConfiguracion()]);
        setConfig(configData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div className=" inset-0 backdrop-blur-sm  items-center justify-center m-10 z-50 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="animate-spin">
          <div className="h-20 w-20  rounded-full border-8  animate-spinColors"></div>
        </div>
      </div>
      <div className=" flex items-center justify-center m-10 font-bold">
        Cargando...
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-100">
            <InfoIcon className="w-12 h-12 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{message}</p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-red-300 text-red-600 bg-red-100 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertToUI({ title = "Confirmar", action = "info" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-16 max-w-2xl w-full mx-4 shadow-2xl animate-bounce-in">
        <div className="text-center">
          <div className=" w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            {action === "confirmar" ? (
              <CheckCircle2Icon
                color="green"
                className="w-20 h-20 text-white"
              />
            ) : action === "eliminar" ? (
              <Trash2Icon color="red" className="w-20 h-20 text-white" />
            ) : (
              <InfoIcon color="blue" className="w-20 h-20 text-white" />
            )}
          </div>

          <div className="text-4xl font-bold mb-6">{title}</div>
        </div>
      </div>
    </div>
  );
}

export function DotsLoader() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configData] = await Promise.all([api.getConfiguracion()]);
        setConfig(configData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);
  const logos = new Array(3).fill(config?.logo_url);
  return (
    <div className="flex space-x-2">
      {logos.map((logo, index) => (
        <span
          key={index}
          className={`h-15 w-15  rounded-full animate-bounce`}
          style={{ animationDelay: `-${0.3 - index * 0.15}s` }}
        >
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 drop-shadow-lg object-contain rounded-lg p-1 mr-10"
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-gray-300 animate-pulse w-full">
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex items-start gap-4 flex-1 w-full">
          <div className="flex-shrink-0 space-y-2">
            <div className="h-10 w-10 rounded bg-gray-200"></div>
            <div className="h-2 w-12 rounded bg-gray-200"></div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-3 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-full rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>

        <div className="flex-shrink-0 space-y-3 text-right">
          <div className="h-3 w-16 rounded bg-gray-200"></div>
          <div className="h-3 w-20 rounded bg-gray-200"></div>
          <div className="h-3 w-24 rounded bg-gray-200"></div>
          <div className="h-3 w-12 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function InfoModal({ ticket = {}, modal = () => {} }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.getHistorialDetail(ticket.id);
      
      setData(res);
    };

    if (ticket?.id) {
      fetchData();
    }
  }, [ticket.id]);

console.log(ticket)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl overflow-hidden animate-scale-in">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <InfoIcon className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Ticket #{ticket?.id}</h2>
              <p className="text-sm opacity-90">
                Información detallada del ticket
              </p>
              
            </div>
            <div className="ml-10">
              <p>
              <span className="font-semibold">Secuencia:</span>{" "}
              <span className="text-blue-200 font-extrabold text-2xl px-4 py-2 rounded-xl">{data[0]?.Secuencia}</span>
            </p>
              <span className="">Fecha: <span className="italic">{new Date(ticket.created_at).toLocaleString('es-ES')}</span></span>
            </div>
          </div>

          <div className=" justify-between text-sm mt-4">
            <p className=" flex ">
              <span className="font-semibold">Cliente:</span>{" "}
              <span className="text-blue-200 font-extrabold text-lg uppercase gap-2 ml-2 rounded-xl">{data[0]?.Cliente}</span>
            </p>
           
              <span className="flex font-semibold mb-3">Comentario del cliente:</span>{" "}
              <span className="text-blue-900 flex font-extrabold ml-2 b-1 bg-blue-300 rounded-lg p-3 space-y-2">{data[0]?.cli_comment}</span>
            
           
          </div>
        </div>

        {/* BODY (tu lista intacta) */}
        <div className="p-6 bg-gray-500">
          <div className="space-y-3  max-h-[400px] overflow-y-auto pr-2">
            {data &&
              data.map((ticket, index) => {
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl  hover:shadow-lg transition-all border border-gray-100 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      {/* IZQUIERDA */}
                      <div className="flex px-4 py-3 items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 font-extrabold text-2xl px-4 py-2 rounded-xl">
                          {ticket.Servicio} 
                        </div>

                        <div>
                          {/* <p className="text-sm font-semibold text-gray-800">
                            {ticket.Servicio}
                          </p> */}
                          {/* <p className="text-xs text-gray-400">
                            Secuencia: {ticket.Secuencia || "-"}
                          </p> */}
                        </div>
                      </div>

                      {/* DERECHA */}
                      <div className="text-right px-4 py-3">
                        <div className="flex items-center gap-2 justify-end text-xs">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Operador</span>
                          <span className="font-semibold text-violet-600">
                            {ticket.Operador}
                          </span>
                        </div>

                        {ticket.Transferido === 1 && (
                          <div className="flex items-center gap-2 justify-end mt-1 text-xs">
                            <ArrowRightLeft className="w-4 h-4 text-cyan-500" />
                            <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg font-medium">
                              Transferido
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COMENTARIO */}
                    <div className="bg-gray-200 rounded-bl-2xl rounded-br-2xl px-4 py-3">
                      <p className="text-xs    italic">
                        {ticket.comentario || "Sin comentarios"}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3  bg-gray-300 flex justify-end">
          <button
            onClick={() => modal(false)}
            className="px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white hover:scale-105 hover:shadow-lg transition-all"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
