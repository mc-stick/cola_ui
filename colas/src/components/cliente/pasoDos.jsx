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

  return (<>
    <div id="visualizador-id">
      <h2 className="text-3xl text-center mb-6 mt-10 font-bold">
        Ingresa tu {tipoId === "telefono" ? "teléfono" : "matrícula"}
      </h2>
      
      <div className="flex flex-col items-center justify-center w-full px-4">
        {/* Contenedor del Input */}
         
          {/* El visualizador de identificación */}
          <div className="text-4xl md:text-6xl max-w-sm  text-center font-bold ] text-blue-900 drop-shadow-sm">
            {identificacion ? (
              identificacion
            ) : (
              <span className="opacity-30">------</span>
            )}
          </div>

          {/* Línea decorativa inferior */}
          <div
            className={`h-1.5 w-[25%] mt-4 mb-2 rounded-full transition-all duration-500 ${identificacion ? "bg-primary" : "bg-gray-300/50"}`}
          />
      </div>

      <div id="teclado-area" className="w-full max-w-md mx-auto">
        <NumericKeypad
          value={identificacion}
          onAdd={agregar}
          onDelete={borrar}
          onConfirm={onConfirm}
          confirmDisabled={disabled}
        />
      </div></div>
      <div  className="text-6xl text-center ">
        <BackBtnCli step={() => setPaso(1)} />
      </div>
    </>
  );
}
