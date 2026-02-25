import { ArrowLeftCircleIcon } from "lucide-react";
import PasoConfirmacion from "../components/cliente/Confirmacion";
import PasoIngresoId from "../components/cliente/pasoDos";
import PasoSeleccionServicio from "../components/cliente/SeleccionServicio";
import PasoTipoIdentificacion from "../components/cliente/TipoIdentificacion";
import { usePantallaCliente } from "../hooks/UsePantallaCliente";

export const HeaderIndex = ({ config }) => {
  return (
    <div className=" bg-gradient-primary text-white px-8 py-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          {config?.logo_url && (
            <img
              src={config.logo_url}
              alt="Logo"
              className="w-20 h-20 drop-shadow-lg object-contain rounded-lg p-1"
            />
          )}
          Solicitar Ticket
        </h1>
      </div>
    </div>
  );
};

export const BackBtnCli = ({ step }) => {
  return (
    <button
    id="btn-regresar"
      onClick={step}
      className="bg-[--color-mono-silver] hover:bg-[--color-mono-gold] mt-10 text-white px-12 py-4 rounded-xl font-bold text-xl  transition-colors ">
      <div className="flex justify-center text-center gap-4 ">
        <span className=""><ArrowLeftCircleIcon className="w-10 h-10 flex" /></span>
        <span className="m-1">Volver</span>
       </div>
    </button>
  );
};

export default function PantallaCliente() {
  const state = usePantallaCliente();

  if (state.paso === 1)
    return (
      <>
        <HeaderIndex config={state.config} />
        <PasoTipoIdentificacion {...state} onSelect={state.setTipoId} />
      </>
    );

  if (state.paso === 2)
    return (
      <>
        <HeaderIndex config={state.config} />
        <PasoIngresoId {...state} onConfirm={() => state.setPaso(3)} />
      </>
    );

  if (state.paso === 3)
    return (
      <>
        <HeaderIndex config={state.config} />
        <PasoSeleccionServicio
          {...state}
          servicios={state.servicios}
          onSelect={state.seleccionarServicio}
        />
      </>
    );

  if (state.paso === 4)
    return (
      <>
        <HeaderIndex config={state.config} />
        <PasoConfirmacion
          ticket={state.ticketGenerado}
          servicio={state.servicioSeleccionado}
          onReset={state.reiniciar}
          tipo={state.tipoId}
          {...state}
        />
      </>
    );

  return null;
}
