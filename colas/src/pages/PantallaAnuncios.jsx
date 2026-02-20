import { useState, useEffect } from "react";
import API from "../services/api";
import { BellRing, CheckCircle, AlertTriangle } from "lucide-react";
import DemoSpeaker from "../TTS/DEMOindex";
import "./../styles/Pantalla.css";

function PantallaAnuncios() {
  const [config, setConfig] = useState(null);
  const [ticketsLlamados, setTicketsLlamados] = useState([]);
  const [medios, setMedios] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ticketNuevo, setTicketNuevo] = useState(null);
  const [ticketEspera, setTicketEspera] = useState([]);
  const [historialTickets, setHistorialTickets] = useState({});

  // ← NUEVO: Guardar el ID del ticket que fue llamado nuevamente
  const [ticketRellamado, setTicketRellamado] = useState(null);

  const [showSpeaker, setShowSpeaker] = useState(true);

  useEffect(() => {
    setShowSpeaker(false);
    const timeout = setTimeout(() => {
      setShowSpeaker(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [ticketsLlamados]);

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      setFecha(
        ahora.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
      setHora(
        ahora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };

    actualizarReloj();
    const interval = setInterval(actualizarReloj, 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const [configData, mediosData] = await Promise.all([
        API.getConfiguracion(),
        API.getMedios(),
      ]);
      setConfig(configData);

      const media = mediosData.filter((item) => item.medio_active === 1);
      setMedios(media);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    let ticketsAnteriores = [];

    const cargarTickets = async () => {
      try {
        const tickets = await API.getTicketsLlamados();
        const esperaTickets = await API.getTicketsEspera();

        if (tickets.length > 0 && ticketsAnteriores.length > 0) {
          const nuevoTicket = tickets.find(
            (t) => !ticketsAnteriores.some((ta) => ta.id === t.id),
          );

          if (nuevoTicket) {
            setTicketNuevo(nuevoTicket);
            setTimeout(() => {
              setTicketNuevo(null);
            }, 9000);
          }

          // ← MODIFICADO: Detectar SOLO el ticket específico que fue rellamado
          tickets.forEach((ticket) => {
            const ticketAnterior = ticketsAnteriores.find(
              (ta) => ta.id === ticket.id,
            );
            if (
              ticketAnterior &&
              ticket.llamado_veces > ticketAnterior.llamado_veces
            ) {
              // Guardar el ticket que fue rellamado con timestamp
              setTicketRellamado({
                id: ticket.id,
                timestamp: Date.now(),
              });

              // Limpiar después de 5 segundos
              setTimeout(() => {
                setTicketRellamado(null);
              }, 5000);
            }
          });

          // Detectar tickets finalizados
          const ticketsFinalizados = ticketsAnteriores.filter(
            (ta) => !tickets.some((t) => t.id === ta.id),
          );

          if (ticketsFinalizados.length > 0) {
            setHistorialTickets((prevHistorial) => {
              const nuevoHistorial = { ...prevHistorial };

              ticketsFinalizados.forEach((ticket) => {
                const servicioNombre = ticket.servicio_nombre;

                if (!nuevoHistorial[servicioNombre]) {
                  nuevoHistorial[servicioNombre] = [];
                }

                nuevoHistorial[servicioNombre] = [
                  { ...ticket, finalizado_at: new Date() },
                  ...nuevoHistorial[servicioNombre],
                ].slice(0, 5);
              });

              return nuevoHistorial;
            });
          }
        }

        ticketsAnteriores = tickets;
        setTicketsLlamados(tickets);
        setTicketEspera(esperaTickets);
      } catch (error) {
        console.error("Error cargando tickets:", error);
      }
    };

    cargarTickets();
    const interval = setInterval(cargarTickets, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (medios.length === 0) return;

    const currentMedia = medios[mediaIndex];

    if (currentMedia?.tipo === "video") {
      return;
    }
    const timeout = setTimeout(() => {
      setMediaIndex((prev) => {
        const nextIndex = (prev + 1) % medios.length;
        if (nextIndex === 0) {
          cargarDatos();
        }
        return nextIndex;
      });
    }, config?.tiempo_rotacion || 5000);

    return () => clearTimeout(timeout);
  }, [medios, mediaIndex, config]);

  const handleVideoEnded = () => {
    setMediaIndex((prev) => {
      const nextIndex = (prev + 1) % medios.length;
      if (nextIndex === 0) {
        cargarDatos();
      }
      return nextIndex;
    });
  };

  // Agrupar tickets por servicio
  const ticketsPorServicio = ticketsLlamados.reduce((acc, ticket) => {
    const servicioNombre = ticket.servicio_nombre;
    if (!acc[servicioNombre]) {
      acc[servicioNombre] = {
        color: ticket.servicio_color,
        tickets: [],
      };
    }
    acc[servicioNombre].tickets.push(ticket);
    return acc;
  }, {});

  // Agregar servicios que tienen historial pero no tickets activos
  Object.keys(historialTickets).forEach((servicioNombre) => {
    if (
      !ticketsPorServicio[servicioNombre] &&
      historialTickets[servicioNombre].length > 0
    ) {
      const primerTicketHistorial = historialTickets[servicioNombre][0];
      ticketsPorServicio[servicioNombre] = {
        color: primerTicketHistorial.servicio_color,
        tickets: [],
      };
    }
  });

  const ticketActual = ticketsLlamados.length > 0 ? ticketsLlamados[0] : null;

  return (
    <div className="min-h-screen bg-[var(--color-primary-blue)] relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-primary-green)] text-white px-5 py-3 shadow-lg">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {config?.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="w-16 h-16 drop-shadow-lg object-contain rounded-lg p-1"
              />
            )}
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
              {config?.nombre_empresa || "MI EMPRESA"}
            </h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold mb-1">
              <span className="capitalize">{fecha}</span>
            </div>
            <div className="flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl font-extrabold">
              <span>{hora}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de ticket nuevo */}
      {ticketNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 sm:p-16 max-w-2xl w-full mx-4 shadow-2xl border-4 border-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-primary-yellow)] animate-bounce-in">
            <div className="text-center">
              <div className="bg-[var(--color-primary-yellow)] text-[var(--color-mono-black)] text-sm font-bold px-4 py-2 rounded-full inline-block mb-3">
                TURNO SIGUIENTE
              </div>
              <div className="bg-[var(--color-primary-green)] w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <BellRing className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-[var(--color-primary-blue)]">
                ¡Turno Llamado!
              </h2>
              <div
                className="text-7xl sm:text-8xl font-extrabold mb-6"
                style={{ color: ticketNuevo.servicio_color }}>
                {ticketNuevo.numero}
              </div>
              <div className="mt-2 p-4">
                <hr
                  className="border-2"
                  style={{ borderColor: ticketNuevo.servicio_color }}
                />
              </div>
              <div className="text-6xl sm:text-7xl font-extrabold text-[var(--color-primary-red)]">
                {ticketNuevo.puesto_nombre}
              </div>
              <DemoSpeaker
                number={ticketNuevo.numero}
                text={ticketNuevo.puesto_nombre}
                song={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal de tickets */}
      {ticketsLlamados.length > 0 ? (
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-100px)]">
            <div className="lg:col-span-5 overflow-y-auto pr-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-mono-white)] mb-4 uppercase flex justify-center items-center gap-2 sticky top-0 pb-3 z-10">
                Atendiendo los siguientes tickets
              </h2>
              <hr className="border-2 border-gray-400 mb-4" />

              <div className="flex justify-center w-full">
                <div
                  className={`grid gap-4 w-full ${
                    Object.keys(ticketsPorServicio).length === 1
                      ? "grid-cols-1 max-w-md mx-auto"
                      : Object.keys(ticketsPorServicio).length === 2
                        ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                        : Object.keys(ticketsPorServicio).length === 3
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
                          : Object.keys(ticketsPorServicio).length === 4
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
                            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}>
                  {Object.entries(ticketsPorServicio).map(
                    ([servicioNombre, data]) => (
                      <div
                        key={servicioNombre}
                        className="bg-[var(--color-mono-white)] rounded-xl p-4 shadow-lg flex flex-col h-fit border-t-8"
                        style={{ borderTopColor: data.color }}>
                        <div className="flex flex-col items-center gap-2 mb-3 pb-2 border-b-2 border-gray-200">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.color }}></div>
                            <h3
                              className="text-3xl font-bold flex-1 uppercase"
                              style={{ color: data.color }}>
                              {servicioNombre}
                            </h3>
                          </div>
                          {data.tickets.length ?
                          <span className="bg-green-500 text-white  px-2 py-1 rounded-full text-xs font-bold w-fit">
                            {data.tickets.length} activos
                          </span>:
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold w-fit">
                            {data.tickets.length} activos
                          </span>}
                        </div>

                        {/* Tickets activos */}
                        <ul
                          role="list"
                          className="divide-y divide-white/10 space-y-3 mb-3">
                          {data.tickets.map((ticket, index) => (
                            <li
                              key={ticket.id}
                              className={`flex justify-between gap-x-4 p-4 rounded-2xl shadow-md border-2 transition-all
        ${
          index === 0 && ticketActual?.id === ticket.id
            ? "bg-gradient-to-r from-[var(--color-secondary-yellow-light)] to-[var(--color-primary-yellow)] border-[var(--color-primary-yellow)]"
            : index === 1
              ? "bg-gradient-to-r from-[var(--color-secondary-green-light)] to-[var(--color-primary-green)] border-[var(--color-primary-green)]"
              : "bg-gradient-to-r from-[var(--color-secondary-blue-light)] to-[var(--color-primary-blue)] border-[var(--color-primary-blue)]"
        }`}>
                              <div className="flex min-w-0 gap-x-4 items-center">
                                <div className="min-w-0 flex-auto">
                                  <div className=" min-w-0 flex-auto font-bold text-[var(--color-mono-black)] text-3xl">
                                    {ticket.numero}
                                  </div>
                                  {index === 0 &&
                                  ticketActual?.id === ticket.id ? (
                                    <div className="px-3 py-1 rounded-full font-bold text-sm text-[var(--color-mono-white)] bg-[var(--color-primary-green)] shadow-md">
                                      AHORA
                                    </div>
                                  ) : (
                                    <div className="px-3 py-1 rounded-full font-bold text-sm text-[var(--color-mono-white)] bg-[var(--color-primary-blue)] shadow">
                                      ATENDIENDO
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <p className="text-xl font-bold text-[var(--color-mono-black)] truncate">
                                  {ticket.puesto_nombre}
                                </p>

                                {ticket.llamado_veces > 1 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-primary-yellow)] text-[var(--color-mono-black)] text-xs font-bold">
                                    <AlertTriangle className="w-8 h-8" />
                                    <p className="text-lg text-black/70">
                                      {ticket.llamado_veces} Llamado
                                      {ticket.llamado_veces ? "s" : ""}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Historial */}
                        {historialTickets[servicioNombre] &&
                          historialTickets[servicioNombre].length > 0 && (
                            <div className="pt-3 border-t-2 border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-[var(--color-primary-green)]" />
                                <h4 className="text-xs font-bold text-bkacl/80 uppercase">
                                  Últimos Atendidos
                                </h4>
                              </div>

                              <ul
                                role="list"
                                className="divide-y divide-white/10 space-y-2">
                                {historialTickets[servicioNombre].map(
                                  (ticket) => (
                                    <li
                                      key={`hist-${ticket.id}-${ticket.finalizado_at}`}
                                      className="flex justify-between items-center p-3 rounded-2xl shadow-inner border-2 border-white/10 bg-gradient-to-tl from-[var(--color-secondary-blue-dark)] to-[var(--color-primary-blue)]">
                                      <div className="text-xl font-bold line-through text-white/70">
                                        {ticket.numero}
                                      </div>
                                      <div className="text-sm font-bold line-through text-white/80">
                                        {ticket.puesto_nombre}
                                      </div>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Pantalla de medios
        <div
          className="flex items-center justify-center pt-1"
          style={{ height: "calc(100vh - 90px)" }}>
          {medios.length > 0 && (
            <div className="w-full h-full mx-auto animate-fade-in">
              <div className="relative rounded-3xl shadow-2xl overflow-hidden h-full">
                <div className="relative w-full h-full flex items-center rounded-3xl pb-2 justify-center">
                  {medios[mediaIndex].tipo === "imagen" ? (
                    <img
                      src={medios[mediaIndex].url}
                      alt={medios[mediaIndex].nombre}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <video
                      key={medios[mediaIndex].url}
                      src={medios[mediaIndex].url}
                      className="w-full h-full object-contain rounded-xl"
                      autoPlay
                      muted
                      onEnded={handleVideoEnded}
                    />
                  )}
                </div>

                {medios.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {medios.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === mediaIndex ? "w-8 bg-[var(--color-primary-yellow)]" : "w-2 bg-gray-800"}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {mediaIndex + 1} / {medios.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PantallaAnuncios;
