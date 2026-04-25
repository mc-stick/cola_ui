import { ArrowLeftCircleIcon, ChevronLeft } from "lucide-react";
import PasoConfirmacion from "../components/cliente/Confirmacion";
import PasoIngresoId from "../components/cliente/pasoDos";
import PasoSeleccionServicio from "../components/cliente/SeleccionServicio";
import PasoTipoIdentificacion from "../components/cliente/TipoIdentificacion";
import { usePantallaCliente } from "../hooks/UsePantallaCliente";
import PasoSeleccionDep from "../components/cliente/SeleccionDep";
import { useFecha, useHora } from "../components/common/clok";

// Header optimizado: Menos alto, más refinado
export const HeaderIndex = ({ config }) => {
  const hora = useHora();
  const fecha = useFecha();
  return (
    <header className="bg-[#1e2a4f] border-b-4 border-[#daab00] px-6 py-4 shadow-lg mb-8 relative overflow-hidden">
      {/* Decoración sutil de fondo (opcional) */}
      <div className="absolute top-0 right-0 w-32 h-full bg-[#cc132c]/10 skew-x-[-20deg] translate-x-16" />

      <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          {/* Contenedor del Logo */}
          <div className="relative">
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo UCNE"
                className="w-14 h-14 md:w-20 md:h-20 object-contain rounded-2xl p-2 bg-white shadow-xl"
              />
            ) : (
              <div className="w-14 h-14 bg-[#fad824] rounded-2xl flex items-center justify-center text-[#1e2a4f] font-black text-2xl shadow-xl">
                .
              </div>
            )}
            {/* Punto de estado online */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#499c35] border-4 border-[#1e2a4f] rounded-full"></div>
          </div>

          {/* Textos del Header */}
          <div>
            <h1 className="text-xl md:text-3xl font-black text-white leading-none tracking-tight">
              Solicitar Ticket
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1 w-6 bg-[#fad824] rounded-full"></span>
              <p className="text-[10px] md:text-xs font-bold text-[#4ec2eb] uppercase tracking-[0.2em] opacity-90">
                 Atención al Cliente - Autoservicio
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[#daab00] text-lg font-black tracking-wide">
            {hora}
          </span>

          <span className="text-white/90 font-bold text-base">
            {fecha}
          </span>
        </div>
      </div>
    </header>
  );
};

// Botón de volver refinado: Sin márgenes que rompan el diseño
export const BackBtnCli = ({ step }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 mb-6">
      <button
        id="btn-regresar"
        onClick={step}
        className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all duration-300">
        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </div>
        <span className="text-sm uppercase tracking-wider">Regresar</span>
      </button>
    </div>
  );
};

export default function PantallaCliente() {
  const state = usePantallaCliente();

  // Envoltura principal para evitar desbordamientos y asegurar fondo consistente
  const LayoutCliente = ({ children, showBack = true }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      {!showBack && <HeaderIndex config={state.config} />}
      {/* {showBack && <BackBtnCli step={() => state.setPaso(state.paso - 1)} />} */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 p-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-6 md:p-12 border border-white">
          {children}
        </div>
      </main>
    </div>
  );

  if (state.paso === 1)
    return (
      <LayoutCliente showBack={false}>
        <PasoTipoIdentificacion {...state} onSelect={state.setTipoId} />
      </LayoutCliente>
    );

  if (state.paso === 2)
    return (
      <LayoutCliente>
        <PasoIngresoId {...state} onConfirm={() => state.setPaso(3)} />
      </LayoutCliente>
    );

  if (state.paso === 3)
    return (
      <LayoutCliente>
        <PasoSeleccionDep
          {...state}
          servicios={state.servicios}
          departamentos={state.departamentos}
          onSelect={state.seleccionarDepartamento}
        />
      </LayoutCliente>
    );

  if (state.paso === 4)
    return (
      <LayoutCliente>
        <PasoSeleccionServicio
          {...state}
          servicios={state.servicios}
          dep={state.departamentoSeleccionado}
          onSelect={state.seleccionarServicio}
        />
      </LayoutCliente>
    );

  if (state.paso === 5)
    return (
      <LayoutCliente showBack={false}>
        <PasoConfirmacion
          ticket={state.ticketGenerado}
          servicio={state.servicioSeleccionado}
          onReset={state.reiniciar}
          tipo={state.tipoId}
          {...state}
        />
      </LayoutCliente>
    );

  return null;
}
