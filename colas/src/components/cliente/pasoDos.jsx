import { useEffect, useState } from "react";
import { BackBtnCli } from "../../pages/PantallaCliente";
import { esTelefonoRDValido } from "../../utils/validar";
import NumericKeypad from "../common/NumKeypad";
import {
  Smartphone,
  Fingerprint,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { usePantallaCliente } from "../../hooks/UsePantallaCliente";

export default function PasoIngresoId({
  tipoId,
  identificacion,
  setIdentificacion,
  onConfirm,
  setPaso,
}) {
  const [runTour, setRunTour] = useState(false);

  const state = usePantallaCliente();

  const agregar = (d) => {
    setIdentificacion((prev) => {
      if (tipoId === "telefono" && prev.length >= 10) return prev;
      if (tipoId === "identificacion" && prev.length >= 8) return prev;

      const nuevo = prev + d;

      if (tipoId === "telefono") {
        if (nuevo.length === 1 && nuevo !== "8") return prev;
        if (nuevo.length === 2 && !["80", "82", "84"].includes(nuevo))
          return prev;
        if (nuevo.length === 3 && !["809", "829", "849"].includes(nuevo)) {
          return prev;
        }
      }
      return nuevo;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setRunTour(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const borrar = () => setIdentificacion((prev) => prev.slice(0, -1));

  const disabled =
    tipoId === "telefono"
      ? !esTelefonoRDValido(identificacion)
      : identificacion.length !== 8;

  // Formateador visual para el display
  const renderIdentificacion = () => {
    if (!identificacion) return null;
    if (tipoId === "telefono") {
      const s1 = identificacion.slice(0, 3);
      const s2 = identificacion.slice(3, 6);
      const s3 = identificacion.slice(6);
      if (identificacion.length <= 3) return s1;
      if (identificacion.length <= 6) return `${s1}-${s2}`;
      return `${s1}-${s2}-${s3}`;
    }
    return identificacion;
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      {/* Encabezado del Paso */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center justify-center w-12 h-12 m-2 bg-blue-50 text-blue-600 rounded-2xl">
          {tipoId === "telefono" ? (
            <Smartphone size={28} />
          ) : (
            <Fingerprint size={28} />
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-800">
          Ingresa tu {tipoId === "telefono" ? "Teléfono" : "ID CAMPUS"}
        </h2>
      </div>

      {/* Visualizador Estilo Input Gigante */}
      <div id="visualizador-id">
        <div className="flex flex-col items-center w-fit mx-auto">
          {/* Número */}
          <div className="text-2xl md:text-2xl font-black text-slate-800 tracking-tight min-h-[40px] flex items-center justify-center">
            {identificacion ? (
              renderIdentificacion()
            ) : (
              <span className="text-slate-300 opacity-50 text-xl uppercase tracking-widest font-bold">
                {tipoId === "telefono" ? "000-000-0000" : "00000000"}
              </span>
            )}
          </div>

          {/* Line clamp / progreso */}
          <div className="mb-2 h-1 bg-slate-200 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (identificacion.length / (tipoId === "telefono" ? 10 : 8)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Indicador */}

        <div className="w-full max-w-sm mx-auto mb-12 bg-slate-50 p-4 rounded-[2.5rem] shadow-sm ">
          <NumericKeypad
            value={identificacion}
            onAdd={agregar}
            onDelete={borrar}
            onConfirm={onConfirm}
            confirmDisabled={disabled}
          />
        </div>
      </div>
      {/*        
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <button
          id="btn-regresar"
          onClick={() => {
            setPaso(1);
            setIdentificacion("");
          }}
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </div>
          <span className="text-sm uppercase tracking-wider">Regresar</span>
        </button>
      </div> */}

      {/* Botón de Confirmación Principal (Solo si el teclado no lo tiene integrado) */}
      {/* {!disabled && (
        <button
          onClick={onConfirm}
          className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center gap-3 animate-bounce-in">
          CONTINUAR <ChevronRight size={28} />
        </button>
      )} */}
    </div>
  );
}
