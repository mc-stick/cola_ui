import { useEffect, useState } from "react";
import NumericKeypad from "./NumKeypad";
import SliderUpDown from "./SliderUpDown";
import api from "../../services/api";
import { BookmarkCheckIcon, BookmarkXIcon, CircleOffIcon } from "lucide-react";
import { usePantallaCliente } from "../../hooks/UsePantallaCliente";

export default function LlamarTicketModal({ open, onClose, onConfirm }) {
  const [servicio, setServicio] = useState("");
  const [numero, setNumero] = useState("");

  const state = usePantallaCliente();

  const servicios = state.servicios;

  if (!open) return null;

  const seleccionarServicio = (s) => {
    setServicio(s.codigo);
  };

  const agregarNumero = (n) => {
    if (numero.length >= 3) return;
    setNumero((prev) => prev + n);
  };

  const borrarNumero = () => {
    setNumero((prev) => prev.slice(0, -1));
  };

  const confirmar = () => {
    if (!servicio || !numero) return;

    const ticket = `${servicio}-${numero}`;
    onConfirm(ticket);

    setServicio("");
    setNumero("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 mx-4">
        {/* Título */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Ingrese su número de ticket
        </h2>

        {/* Selector y ticket */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 w-full max-w-md mx-auto">
          {/* Slider de servicios */}
          <div className="w-full sm:w-1/2 flex flex-col items-center">
            <SliderUpDown
              servicios={servicios}
              onSelect={(s) => seleccionarServicio(s)}
            />
          </div>

          {/* Ticket seleccionado */}
          <div className="w-full sm:w-1/2 flex flex-col items-center bg-white rounded-2xl shadow-lg p-4 transition-transform transform hover:scale-105">
            <p className="text-gray-600 mb-2 text-sm font-medium">
              Número de ticket
            </p>
            <input
              type="text"
              value={servicio ? `${servicio}-${numero}` : ""}
              readOnly
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            />
          </div>
        </div>

        {/* Keypad */}
        <div id="keypad" className="mb-6">
          <NumericKeypad
            value={servicio}
            onAdd={agregarNumero}
            onDelete={borrarNumero}
            onConfirm={confirmar}
            confirmDisabled={numero.length === 3 ? false : true}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gray-400 text-white font-semibold hover:bg-gray-500 transition-colors">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={numero.length !== 3}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
              numero.length === 3
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export const ModalCallTK = ({ open, ticketId, onClose }) => {
  const [valido, setValido] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const handleReLlamar = async () => {
      try {
        const data = await api.llamarVolver(open);

        setValido(!!data?.estado);
      } catch (error) {
        setValido(false);
      } finally {
        setLoading(false);
      }
    };

    handleReLlamar();
  }, [open, ticketId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        id="validate-tk"
        className="bg-white w-[420px] rounded-2xl shadow-2xl p-6 text-center">
        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : valido ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <BookmarkCheckIcon className="w-12 h-12 text-green-600" />
            </div>

            <h4 className="text-lg font-semibold text-gray-800">
              Ticket Validado
            </h4>

            <p className="text-sm text-gray-500 max-w-xs">
              Su turno llegará pronto, por favor espere.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <BookmarkXIcon className="w-12 h-12 text-red-600" />
            </div>

            <h4 className="text-lg font-semibold text-gray-800">
              Ticket inválido
            </h4>

            <p className="text-sm text-gray-500 max-w-xs">
              Su ticket no existe o ya expiró.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => onClose(null)}
            className="px-6 py-2.5 rounded-lg bg-[--color-primary-blue] text-white text-sm font-medium hover:opacity-90 transition">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
