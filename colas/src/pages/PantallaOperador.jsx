import { useState } from "react";
import LoginComponent from "./Login";
import { TutorialModal } from "../components/common/infoSliderModal";
import SelectorGuia from "../helpers/GuiaSelect";
import { getTutorialDeOperador } from "../helpers/Tutoriales";

import { ColaEsperaCard, EditModal, OperatorHeader, TicketActualCard, TransferModal, useAuth, useEditUser, useTickets, useTransferencia } from "./Operador";

function PantallaOperador() {
  // Estados para tutorial
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [Guia_paso, setGuia_paso] = useState("");

  // Hook de autenticación
  const { usuario, serviciosAsignados, handleLoginSuccess, handleLogout, restaurarSesion } =
    useAuth();

  // Hook de tickets
  const {
    ticketsEspera,
    ticketActual,
    setTicketActual,
    comentario,
    setComentario,
    handleLlamarSiguiente,
    handleReLlamar,
    handleAtendido,
    handleNoPresento,
    handleMasTarde,
    cargarTickets,
  } = useTickets(usuario, serviciosAsignados);

  // Hook de transferencia
  const {
    showTransferModal,
    todosServicios,
    servicioSeleccionado,
    setServicioSeleccionado,
    abrirModalTransferir,
    cerrarModalTransferir,
    handleConfirmarTransferencia,
  } = useTransferencia(ticketActual, comentario, cargarTickets, setTicketActual, setComentario);

  // Hook de edición de usuario
  const {
    formulario,
    setFormulario,
    value,
    EditOpen,
    setEditOpen,
    handleChange,
    handleGuardarUsuario,
  } = useEditUser(usuario, restaurarSesion);

  // Funciones de tutorial
  const onGuide = (x) => {
    setIsModalOpen(false);
    setGuia_paso(x);
    setTimeout(() => setRunTour(true), 300);
    console.log(x, "guia ");
  };

  const tutorialConfig = getTutorialDeOperador(onGuide, usuario?.nombre);

  // Si no hay usuario, mostrar login
  if (!usuario) {
    return (
      <LoginComponent
        onLoginSuccess={handleLoginSuccess}
        tipoUsuario="operador"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OperatorHeader
        usuario={usuario}
        serviciosAsignados={serviciosAsignados}
        onLogout={handleLogout}
        onEdit={() => setEditOpen(true)}
        onOpenTutorial={() => setIsModalOpen(true)}
      />

      {/* Modales de tutorial */}
      <TutorialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutorials={tutorialConfig}
      />
      <SelectorGuia
        activar={runTour}
        setActivar={setRunTour}
        guia={Guia_paso}
      />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket actual */}
          <TicketActualCard
            ticketActual={ticketActual}
            comentario={comentario}
            onComentarioChange={setComentario}
            onReLlamar={handleReLlamar}
            onAtendido={handleAtendido}
            onNoPresento={handleNoPresento}
            onMasTarde={handleMasTarde}
            onTransferir={abrirModalTransferir}
          />

          {/* Cola de espera */}
          <ColaEsperaCard
            ticketsEspera={ticketsEspera}
            ticketActual={ticketActual}
            serviciosAsignados={serviciosAsignados}
            usuario={usuario}
            onLlamarSiguiente={handleLlamarSiguiente}
          />
        </div>
      </div>

      {/* Modal de edición */}
      {EditOpen && (
        <EditModal
          usuario={usuario}
          formulario={formulario}
          setFormulario={setFormulario}
          value={value}
          handleChange={handleChange}
          handleGuardarUsuario={handleGuardarUsuario}
          setEditOpen={setEditOpen}
        />
      )}

      {/* Modal de transferencia */}
      <TransferModal
        showTransferModal={showTransferModal}
        ticketActual={ticketActual}
        todosServicios={todosServicios}
        servicioSeleccionado={servicioSeleccionado}
        setServicioSeleccionado={setServicioSeleccionado}
        onConfirmar={handleConfirmarTransferencia}
        onCerrar={cerrarModalTransferir}
      />
    </div>
  );
}

export default PantallaOperador;