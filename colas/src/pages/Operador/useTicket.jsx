import { useState, useEffect } from "react";
import API from "../../services/api";

export const useTickets = (usuario, serviciosAsignados) => {
  const [ticketsEspera, setTicketsEspera] = useState([]);
  const [ticketActual, setTicketActual] = useState(null);
  const [comentario, setComentario] = useState("");

  const cargarTickets = async () => {
    try {
      const todosTickets = await API.getTicketsEspera();
      const ticketsFiltrados = todosTickets.filter((ticket) => {
        return serviciosAsignados.some(
          (servicio) => servicio.id === ticket.servicio_id
        );
      });

      setTicketsEspera(ticketsFiltrados);

      const miTicket = await API.getTicketsByOperador(usuario.id);
      const ticketEnAtencion = miTicket.find(
        (t) => t.estado === "llamado" || t.estado === "en_atencion"
      );

      // Solo actualizar el ticket actual si cambió
      setTicketActual((prevTicket) => {
        // Si es el mismo ticket, no hacer nada con el comentario
        if (prevTicket?.id === ticketEnAtencion?.id) {
          return ticketEnAtencion || null;
        }
        
        // Si cambió de ticket, cargar las notas del nuevo ticket
        if (ticketEnAtencion) {
          setComentario(ticketEnAtencion.notes || "");
        }
        
        return ticketEnAtencion || null;
      });
    } catch (error) {
      console.error("Error cargando tickets:", error);
    }
  };

  const handleLlamarSiguiente = async () => {
    if (ticketsEspera.length === 0) {
      alert("No hay tickets en espera para tus servicios asignados");
      return;
    }

    if (ticketActual !== null) {
      alert("Ya tienes un ticket en atención");
      return;
    }

    try {
      const siguiente = ticketsEspera[0];
      if (
        !serviciosAsignados.some(
          (servicio) => servicio.id === siguiente.servicio_id
        )
      ) {
        alert("No tienes permiso para atender este servicio");
        return;
      }

      await API.llamarTicket(siguiente.id, usuario.id, usuario.puesto_id);
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      console.error("Error llamando ticket:", error);
      alert("Error al llamar ticket");
    }
  };

  const handleReLlamar = async () => {
    if (!ticketActual) return;
    try {
      await API.llamarTicket(ticketActual.id, usuario.id, usuario.puesto_id);
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al re-llamar ticket");
    }
  };

  const handleAtendido = async () => {
    if (!ticketActual) return;
    try {
      await API.finalizarTicket(
        ticketActual.id,
        usuario.id,
        "atendido",
        comentario
      );
      setTicketActual(null);
      setComentario("");
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      console.error("Error finalizando ticket:", error);
      alert("Error al finalizar ticket");
    }
  };

  const handleNoPresento = async () => {
    if (!ticketActual) return;
    if (!confirm("¿Confirmar que el cliente NO se presentó?")) return;

    try {
      await API.finalizarTicket(
        ticketActual.id,
        usuario.id,
        "no_presentado",
        comentario
      );
      setTicketActual(null);
      setComentario("");
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al finalizar ticket");
    }
  };

  const handleMasTarde = async () => {
    if (!ticketActual) return;
    if (!confirm("¿Esta seguro de realizar esta acción?")) return;

    try {
      await API.finalizarTicket(
        ticketActual.id,
        usuario.id,
        "pendiente",
        comentario
      );
      setTicketActual(null);
      setComentario("");
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al finalizar ticket");
    }
  };

  useEffect(() => {
    if (!usuario || serviciosAsignados.length === 0) return;

    cargarTickets();
    const interval = setInterval(cargarTickets, 3000);
    return () => clearInterval(interval);
  }, [usuario, serviciosAsignados]);

  return {
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
  };
};