import { useState } from "react";
import NumericKeypad from "./NumKeypad";
import SliderUpDown from "./SliderUpDown";
import api from "../../services/api";
import { BookmarkCheckIcon, CircleOffIcon } from "lucide-react";
import { usePantallaCliente } from "../../hooks/UsePantallaCliente";



export default function LlamarTicketModal({ open, onClose, onConfirm }) {
  const [servicio, setServicio] = useState("");
  const [numero, setNumero] = useState("");

  const state = usePantallaCliente();

  const servicios = state.servicios

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div id="modaltk" className="bg-white w-[420px] rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Ingresa tu número de ticket
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <div id="slider-services" className="w-1/2">
            <SliderUpDown
              servicios={servicios}
              onSelect={(s) => seleccionarServicio(s)}
            />
          </div>

          <div className="w-1/2 mb-10">
            <p className="justify-center flex">Número de ticket</p>
            <input
              type="text"
              value={servicio ? `${servicio}-${numero}` : ""}
              readOnly
              className="w-full border rounded-md px-2 py-1 text-center font-semibold text-sm"
            />
          </div>
        </div>
        <div id="keypad">
        <NumericKeypad
          value={servicio}
          onAdd={agregarNumero}
          onDelete={borrarNumero}
          onConfirm={confirmar}
          confirmDisabled={numero.length === 3 ? false : true}
        /></div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export const ModalCallTK = ({ open, onClose, onConfirm }) => {
  const [valido, setValido] = useState(null);

  if (!open) return null;

  const handleReLlamar = async () => {
    if (!open) return;
    try {
      const data = await api.llamarVolver(open);
      console.log(data.estado);
      data.estado === "pendiente" ? setValido(true) : setValido(false);
    } catch (error) {
      setValido(false);
    }
  };

  handleReLlamar();

  console.log(onConfirm);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div id="validate-tk" className="bg-white w-[420px] rounded-2xl shadow-2xl p-6">
        <div className="text-xl font-semibold mb-4 text-center flex justify-center">
          {valido ? (
            <div>
              <span className="flex justify-center">
                <BookmarkCheckIcon className="w-20 h-20 text-green-600" />
              </span>
              <br />
              <p className="">Espera a ser llamado, tu turno llegara pronto.</p>
            </div>
          ) : (
            <div>
              <span className="flex justify-center">
                <CircleOffIcon className="w-20 h-20 text-red-600" />
              </span>
              <br />
              <p className="">El ticket ya no es válido.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => onClose(null)}
            className="px-5 py-2 rounded-lg bg-[--color-primary-blue] text-white hover:bg-gray-500">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
