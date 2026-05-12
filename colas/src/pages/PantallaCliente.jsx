import { ChevronLeft } from "lucide-react";
import PasoConfirmacion from "../components/cliente/Confirmacion";
import PasoIngresoId from "../components/cliente/pasoDos";
import PasoSeleccionServicio from "../components/cliente/SeleccionServicio";
import PasoTipoIdentificacion from "../components/cliente/TipoIdentificacion";
import { usePantallaCliente } from "../hooks/UsePantallaCliente";
import PasoSeleccionDep from "../components/cliente/SeleccionDep";
import { useFecha, useHora } from "../components/common/clok";
export const HeaderIndex = ({ config }) => {
  const hora = useHora();
  const fecha = useFecha();

  return (
    <div
      className="
        rounded-2xl
        border
        relative
        overflow-hidden
        px-3
        py-3
      "
      style={{
        backgroundColor: "#1e2a4f",
        borderColor: "#daab00",
      }}
    >
      {/* Decoración */}
      <div className="absolute top-0 right-0 w-24 md:w-32 h-full bg-[#cc132c]/10 skew-x-[-20deg] translate-x-12" />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-2
        "
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo"
                className="
                  w-10 h-10
                  sm:w-12 sm:h-12
                  md:w-14 md:h-14
                  object-contain
                  rounded-xl
                  bg-white
                  p-1.5
                  shadow-xl
                "
              />
            ) : (
              <div
                className="
                  w-10 h-10
                  sm:w-12 sm:h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-lg
                  font-black
                  shadow-xl
                "
                style={{
                  backgroundColor: "#fad824",
                  color: "#1e2a4f",
                }}
              >
                .
              </div>
            )}

            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#499c35] border-2 border-[#1e2a4f]" />
          </div>

          {/* Text */}
          <div className="min-w-0">
            <h1
              className="
                text-base
                font-black
                text-white
                leading-tight
                truncate
              "
            >
              Solicitar Ticket
            </h1>

            <p
              className="
                mt-0.5
                text-[8px]
                sm:text-[9px]
                md:text-xs
                font-semibold
                uppercase
                tracking-wider
                text-[#4ec2eb]
                line-clamp-2
              "
            >
              Atención al Cliente - Autoservicio
            </p>
          </div>
        </div>

        {/* Right */}
        <div
          className="
            flex
            flex-row
            lg:flex-col
            items-start
            lg:items-end
            gap-0.5
            lg:gap-0
            flex-shrink-0
          "
        >
          <span className="text-[#daab00] text-base sm:text-lg md:text-xl font-black">
            {hora}
          </span>

          <span className="text-[9px] sm:text-xs text-white/90 font-semibold">
            {fecha}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Botón volver estilo tarjetas dashboard
// ─────────────────────────────────────────────
export const BackBtnCli = ({ step }) => {
  return (
    <button
      onClick={step}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#4ec2eb";
        e.currentTarget.style.backgroundColor = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.backgroundColor = "#ffffff";
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: "#eff6ff",
        }}
      >
        <ChevronLeft className="w-4 h-4" style={{ color: "#1e40af" }} />
      </div>

      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#475569" }}
      >
        Regresar
      </span>
    </button>
  );
};

export default function PantallaCliente() {
  const state = usePantallaCliente();
  const LayoutCliente = ({ children, showBack = true }) => (
    <div
      className="
      h-screen
      overflow-hidden
      flex
      flex-col
    "
      style={{
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Wrapper */}
      <div
        className="
        flex-1
        w-full
        max-w-6xl
        mx-auto
        p-2
        sm:p-2.5
        md:p-3
        lg:p-4
        flex
        flex-col
        gap-2.5
        overflow-hidden
      "
      >
        {/* Header */}
        {!showBack && (
          <div className="flex-shrink-0">
            <HeaderIndex config={state.config} />
          </div>
        )}

        {/* Back */}
        {showBack && (
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <BackBtnCli step={() =>{ state.setPaso(state.paso - 1);state.setIdentificacion(""); }} />

            <div className="hidden md:flex flex-col items-end">
              <span className="text-[#daab00] text-base font-black">
                {useHora()}
              </span>

              <span className="text-slate-500 text-xs font-medium">
                {useFecha()}
              </span>
            </div>
          </div>
        )}

        {/* Card principal */}
        <div
          className="
          flex-1
          min-h-0
          border
          rounded-2xl
          overflow-hidden
          flex
          flex-col
        "
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
          }}
        >
          {/* Contenido */}
          <div
            className="
            flex-1
            min-h-0
            p-3
            sm:p-4
            md:p-5
            lg:p-6
          "
          >
            {children}
          </div>
        </div>
      </div>
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
