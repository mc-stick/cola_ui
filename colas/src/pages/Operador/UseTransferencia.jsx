import { useState, useEffect } from "react";
import API from "../../services/api";

export const useTransferencia = (
  ticketActual,
  comentario,
  cargarTickets,
  setTicketActual,
  setComentario,
  usuario
) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [todosServicios, setTodosServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");

  const cargarTodosServicios = async () => {
    try {
      const servicios = await API.getServicios();
      setTodosServicios(servicios);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const abrirModalTransferir = () => {
    if (!comentario || comentario.trim().length < 10) {
      alert(
        "Añade contexto de la solicitud antes de transferir el ticket.",
      );

      // Enfocar el textarea con id="message"
      const textarea = document.getElementById("message");
      if (textarea) textarea.focus();

      return;
    }

    setShowTransferModal(true);

    //console.log(ticketActual, "ticket actual");
    setServicioSeleccionado("");
  };

  const cerrarModalTransferir = () => {
    setShowTransferModal(false);
    setServicioSeleccionado("");
  };

  const handleConfirmarTransferencia = async () => {
    if (!ticketActual || !servicioSeleccionado) {
      alert("Debes seleccionar un servicio");
      return;
    }

    try {
      const serv_nm = todosServicios.filter(
        (servicio) => servicio.id === servicioSeleccionado,
      );
      //console.log(ticketActual);
      await API.transferirTicket(
        ticketActual,
        servicioSeleccionado,
        comentario,
        usuario.id
      );

      setTicketActual(null);
      setComentario("");
      cerrarModalTransferir();
      setTimeout(() => cargarTickets(), 500);
      alert("Ticket transferido exitosamente");
    } catch (error) {
      console.error("Error al transferir ticket:", error);
      alert("Error al transferir ticket");
    }
  };

  useEffect(() => {
    cargarTodosServicios();
  }, []);

  return {
    showTransferModal,
    todosServicios,
    servicioSeleccionado,
    setServicioSeleccionado,
    abrirModalTransferir,
    cerrarModalTransferir,
    handleConfirmarTransferencia,
  };
};
