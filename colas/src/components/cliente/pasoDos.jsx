import { useEffect } from "react";
import { BackBtnCli } from "../../pages/PantallaCliente";
import { esTelefonoRDValido } from "../../utils/validar";
import NumericKeypad from "../common/NumKeypad";
import { useState } from "react";

export default function PasoIngresoId({
  tipoId,
  identificacion,
  setIdentificacion,
  onConfirm,
  setPaso,
}) {
  const [runTour, setRunTour] = useState(false);
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
    // Iniciamos el tour de esta pantalla automáticamente
    const timer = setTimeout(() => setRunTour(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const borrar = () => setIdentificacion((prev) => prev.slice(0, -1));

  const disabled =
    tipoId === "telefono"
      ? !esTelefonoRDValido(identificacion)
      : identificacion.length !== 8;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 px-4 py-6">
      {/* Contenedor principal que ocupa todo el alto */}
      <div className="">
        {/* Título */}
        {/* <h2 className="text-2xl sm:text-3xl md:text-4xl text-white text-center font-bold mb-6 drop-shadow-md">
        
      </h2> */}
        {/* Visualizador de ID compacto */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="bg-white/20 backdrop-blur-sm w-full rounded-xl py-3 px-4 text-center shadow-md flex flex-col items-center justify-center">
            <div className="text-4xl font-semibold text-white drop-shadow-sm tracking-wide">
              {identificacion ? (
                identificacion.length >= 4 &&
                identificacion.length <= 6 &&
                tipoId === "telefono" ? (
                  `${identificacion.slice(0, 3)}-${identificacion.slice(3, 6)}`
                ) : identificacion.length >= 7 && tipoId === "telefono" ? (
                  `${identificacion.slice(0, 3)}-${identificacion.slice(3, 6)}-${identificacion.slice(6)}`
                ) : (
                  identificacion
                )
              ) : (
                <span className="opacity-80 text-2xl font-black">
                  Ingresa tu {tipoId === "telefono" ? "teléfono" : "ID CAMPUS"}
                </span>
              )}
            </div>

            {/* Línea decorativa inferior */}
            <div
              className={`h-1 w-1/2 mt-3 mx-auto rounded-full transition-all duration-500 ${
                identificacion ? "bg-yellow-400" : "bg-white/30"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Teclado */}
      <div className="w-full max-w-md mx-auto mt-4">
        <NumericKeypad
          value={identificacion}
          onAdd={agregar}
          onDelete={borrar}
          onConfirm={onConfirm}
          confirmDisabled={disabled}
        />
      </div>

      {/* Botón de volver */}
      <div className="text-center">
        <BackBtnCli
          step={() => {
            setPaso(1);
            setIdentificacion("");
          }}
          className="text-white text-3xl sm:text-4xl hover:text-yellow-400 transition-colors"
        />
      </div>
    </div>
  );
}
