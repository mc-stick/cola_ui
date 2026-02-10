import { useState, useEffect } from "react";
import API from "../../services/api";

export const useTransferencia = (ticketActual, comentario, cargarTickets, setTicketActual, setComentario) => {
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
    setShowTransferModal(true);
    console.log(ticketActual, "ticket actual");
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
        (servicio) => servicio.id === servicioSeleccionado
      );
      console.log(ticketActual);
      await API.transferirTicket(
        ticketActual,
        servicioSeleccionado,
        comentario,
        serv_nm[0].nombre
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