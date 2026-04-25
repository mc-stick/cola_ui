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
          (servicio) => servicio.id === ticket.servicio,
        );
      }); //console.log(ticketsFiltrados, "espera filter")

      setTicketsEspera(ticketsFiltrados);

      const miTicket = await API.getTicketsByOperador(usuario.id);
      console.log(miTicket, "mi ticket");
      const ticketEnAtencion = miTicket.find(
        (t) => t.estado === 2 || t.estado === 3,
      );

      // Solo actualizar el ticket actual si cambió
      setTicketActual((prevTicket) => {
        // Si es el mismo ticket, no hacer nada con el comentario
        if (prevTicket?.id === ticketEnAtencion?.id) {
          return ticketEnAtencion || null;
        }
        //console.log(ticketEnAtencion,"tk atencion comment")
        // Si cambió de ticket, cargar las notas del nuevo ticket
        // if (ticketEnAtencion) {
        //   setComentario(ticketEnAtencion.ultimo_comentario || "");
        // }

        //console.log(ticketEnAtencion,"tk atencion")

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
     const idGuardado = localStorage.getItem('idnumt');

    try {
      const ticketsOrdenados = [
    ...ticketsEspera.filter((t) => t.priority === 1),
    ...ticketsEspera.filter((t) => t.priority !== 1),
  ].filter((t) => {
    // Verificamos si el ID del ticket coincide con el almacenado
    console.log(t.id,idGuardado,"saved")
    // Usamos String() para asegurar que la comparación sea correcta independientemente del tipo
    if (idGuardado && String(t.id) === String(idGuardado)) {
      console.log(`🚀 Ticket ignorado (ya procesado): ID ${t.id} - Número ${t.numero}`);
      return false; // No incluir en la lista
    }
    return true; // Incluir en la lista
  })
      // const ticketsOrdenados = [
      //   ...ticketsEspera.filter((t) => t.prior === 1),
      //   ...ticketsEspera.filter((t) => t.prior !== 1), // mismo ajuste que hiciste arriba
      // ];

      const siguiente = ticketsOrdenados[0];

      if (!siguiente) return;

      if (
        !serviciosAsignados.some(
          (servicio) => servicio.id === siguiente.servicio,
        )
      ) {
        alert("No tienes permiso para atender este servicio");
        return;
      }

      await API.llamarTicket(
        siguiente.id,
        usuario.id,
        usuario.puesto_id,
        siguiente.servicio,
      );

      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      console.error("Error llamando ticket:", error);
      alert("Error al llamar ticket");
    }

    // try {
    //   const siguiente = ticketsEspera[0];
    //   if (
    //     !serviciosAsignados.some(
    //       (servicio) => servicio.id === siguiente.servicio
    //     )
    //   ) {
    //     alert("No tienes permiso para atender este servicio");
    //     return;
    //   }

    //   await API.llamarTicket(siguiente.id, usuario.id, usuario.puesto_id, siguiente.servicio);
    //   setTimeout(() => cargarTickets(), 500);
    // } catch (error) {
    //   console.error("Error llamando ticket:", error);
    //   alert("Error al llamar ticket");
    // }
  };

  const handleReLlamar = async () => {
    if (!ticketActual) return;
    try {
      //console.log(ticketActual,"tk actual")

      await API.rellamarTicket(
        ticketActual.id,
        usuario.id,
        usuario.puesto_id,
        ticketActual.servicio,
      );
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al re-llamar ticket");
    }
  };

  const handleAtendido = async () => {
    if (!ticketActual) return;
    try {
      await API.finalizarTicket(ticketActual.id, usuario.id, 4, comentario);
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
      await API.finalizarTicket(ticketActual.id, usuario.id, 5, comentario);
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
      await API.finalizarTicket(ticketActual.id, usuario.id, 7, comentario);
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
