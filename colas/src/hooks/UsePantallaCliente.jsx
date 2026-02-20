import { useState, useEffect } from "react";
import API from "../services/api";
import { SendTwilioSms } from "../twilio/TwMsg";
import api from "../services/api";

export function usePantallaCliente() {
  const [paso, setPaso] = useState(1);
  const [tipoId, setTipoId] = useState(null);
  const [identificacion, setIdentificacion] = useState("");
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [ticketGenerado, setTicketGenerado] = useState(null);
  const [config, setConfig] = useState(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    API.getConfiguracion().then(setConfig);
    API.getServicios().then((servicios) => {
      const activos = servicios.filter((s) => s.service_active === 1);
      setServicios(activos);
    });
    //cargarServicios();
  }, []);

  // const cargarServicios = async () => {
  //   console.log("cargar serv")
  //   const data = await API.getServicios();
  //   setServicios(data.filter((s) => s.service_active === 1));
  // };

  const seleccionarServicio = async (servicio) => {
    setServicioSeleccionado(servicio);

    const ticket = await API.createTicket({
      servicio_id: servicio.id,
      tipo_identificacion: tipoId,
      identificacion: identificacion || null,
    });

    console.log(ticket, "ticket creado");

    setTicketGenerado(ticket);
    setPaso(4);

    if (tipoId === "telefono") {
      SendTwilioSms("mensaje a enviar", identificacion);
    } else {
      console.log("PRINTING", ticket.numero, servicio.nombre);
      await API.PrintTicket(ticket, servicio.nombre);
    }
  };

  const reiniciar = () => {
    reset();
  };

  const reset = () => {
    setPaso(1);
    setTipoId(null);
    setIdentificacion("");
    setServicioSeleccionado(null);
    setTicketGenerado(null);
  };

  return {
    paso,
    setPaso,
    tipoId,
    setTipoId,
    identificacion,
    setIdentificacion,
    servicios,
    servicioSeleccionado,
    ticketGenerado,
    config,
    rating,
    setRating,
    seleccionarServicio,
    reiniciar,
  };
}
