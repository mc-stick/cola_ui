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
              className="px-6 py-3 rounded-xl border border-red-300 text-red-600 bg-red-100 hover:bg-gray-100 transition">
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
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
          className={`h-10 w-10 rounded-full animate-bounce`}
          style={{ animationDelay: `-${0.3 - index * 0.15}s`}}>
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
  return (
    <div className="fixed inset-0 bg-gray-800/10  flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full mx-4 shadow-xl animate-bounce-in">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-blue-100">
              <InfoIcon className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-black pr-10">
              Información acerca del ticket
            </h2>
          </div>
          <div
            key={ticket.id}
            className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all border-l-4"
            style={{
              borderLeftColor: ticket.servicio_color || "#6B7280",
            }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Número de Ticket */}
                <div className="flex-shrink-0">
                  <div
                    className="text-4xl font-extrabold"
                    style={{
                      color: ticket.servicio_color, //|| hservicios.map(t=>t.color),
                    }}>
                    {ticket.numero}
                  </div>
                  <div className="text-xs text-gray-500 text-center font-bold mt-2">
                    Ticket #<strong>{ticket.id}</strong>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-right space-y-2">
                <div className="space-y-1 text-xs text-gray-500 border-t pt-2 mt-2">
                  {ticket.accion !== "creado" ? (
                    <div className="flex items-center gap-2 justify-end">
                      <User className="w-5 h-5" />
                      <span>Atendido por:</span>
                      <span className="font-bold text-violet-600">
                        {ticket.usuario_nombre}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-amber-500">
                        En espera
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="font-bold">Creado:</span>
                    <span className="font-semibold italic">
                      {new Date(ticket.created_at).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  {ticket.transferido === 1 && (
                    <div className="flex items-center gap-2 justify-end">
                      <ArrowRightLeft className="w-5 h-5 text-cyan-500 font-bold" />
                      <span className="font-bold text-orange-600">
                        Ticket transferido
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-lg font-semibold text-gray-500 border-t pt-2 mt-2">
              {ticket.notes ? "Comentario:" : ""}
            </div>
            <span className="italic text-sm">
              {ticket.notes || "No hay comentarios"}
            </span>
          </div>
          <button
            onClick={() => modal(false)}
            className="px-6 mt-10 text-lg py-3 font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
