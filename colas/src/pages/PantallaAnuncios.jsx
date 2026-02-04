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
            const ticketAnterior = ticketsAnteriores.find(ta => ta.id === ticket.id);
            if (ticketAnterior && ticket.llamado_veces > ticketAnterior.llamado_veces) {
              // Guardar el ticket que fue rellamado con timestamp
              setTicketRellamado({
                id: ticket.id,
                timestamp: Date.now()
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-5 py-3 shadow-lg">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {config?.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="w-16 h-16 drop-shadow-lg object-contain rounded-lg p-1"
              />
            )}
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              {config?.nombre_empresa || "MI EMPRESA"}
            </h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1">
              <span className="capitalize">{fecha}</span>
            </div>
            <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              <span>{hora}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de ticket nuevo */}
      {ticketNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 sm:p-16 max-w-2xl w-full mx-4 shadow-2xl animate-bounce-in">
            <div className="text-center">
              <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                TURNO SIGUIENTE
              </div>
              <div className="bg-blue-500 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <BellRing
                  color="orange"
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                />
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-4">
                ¡Turno Llamado!
              </h2>
              <div
                className="text-6xl sm:text-8xl font-extrabold mb-6"
                style={{ color: ticketNuevo.servicio_color }}>
                {ticketNuevo.numero}
              </div>
              <div className="text-2xl sm:text-3xl text-gray-700 mb-4">
                {ticketNuevo.servicio_nombre}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-700">
                {ticketNuevo.puesto_nombre}
              </div>
              <DemoSpeaker
                // key={`modal-${ticketNuevo.id}-${Date.now()}`}
                number={ticketNuevo.numero}
                text={ticketNuevo.puesto_nombre}
                song={true}
              />
            </div>
          </div>
        </div>
      )}

      {ticketsLlamados.length > 0 ? (
        <div className="p-2 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-100px)]">
            {/* Columna principal: Servicios con tickets - Siempre centrado */}
            <div className="lg:col-span-5 overflow-y-auto pr-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase justify-center flex items-center gap-2 sticky top-0 bg-gray-50 pb-3 z-10">
                atendiendo los siguientes tickets
              </h2>
              <hr className="border-2 border-gray-500" />
              <br />

              {/* Contenedor con flex para centrar el grid */}
              <div className="flex justify-center w-full">
                {/* Grid de columnas por servicio - Centrado automáticamente */}
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
                        className="bg-white rounded-xl p-4 shadow-lg flex flex-col h-fit">
                        {/* Título del servicio */}
                        <div
                          className="flex flex-col gap-2 mb-3 pb-2 border-b-4"
                          style={{ borderBottomColor: data.color }}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.color }}></div>
                            <h3
                              className="text-lg font-bold flex-1 uppercase"
                              style={{ color: data.color }}>
                              {servicioNombre}
                            </h3>
                          </div>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold w-fit">
                            {data.tickets.length} activos
                          </span>
                        </div>

                        {/* Lista de tickets activos en columna */}
                        <div className="space-y-2 mb-3 flex-1">
                          {data.tickets.length > 0 ? (
                            data.tickets.map((ticket, index) => (
                              <div
                                key={ticket.id}
                                className={`flex flex-col p-3 rounded-lg border-2 transition-all ${
                                  index === 0 && ticketActual?.id === ticket.id
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-green-500 bg-green-50 hover:border-gray-300"
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div
                                    className="text-3xl font-extrabold"
                                    style={{ color: data.color }}>
                                    {ticket.numero}
                                  </div>
                                  {index === 0 &&
                                  ticketActual?.id === ticket.id ? (
                                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                      AHORA
                                    </div>
                                  ) : (
                                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                      ATENDIENDO
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-around text-center border-t pt-2">
                                  <div className="text-sm font-bold text-gray-600">
                                    {ticket.puesto_nombre}
                                  </div>
                                  {ticket.llamado_veces > 1 && (
                                    <div className="text-xs flex justify-center items-center text-white bg-orange-600 border-2 font-bold rounded-xl pr-2">
                                      <AlertTriangle className="w-8 h-8 p-1 m-1" />
                                      llamado ({ticket.llamado_veces}ª vez)
                                      {/* ← SOLUCIÓN: Solo reproducir si este ticket fue rellamado */}
                                      {ticketRellamado && ticketRellamado.id === ticket.id && (
                                        <DemoSpeaker
                                          //key={`speaker-${ticket.id}-${ticketRellamado.timestamp}`}
                                          number={ticket.numero}
                                          text={ticket.puesto_nombre}
                                          song={false}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <></>
                          )}
                        </div>

                        {/* Historial - Últimos 5 atendidos */}
                        {historialTickets[servicioNombre] &&
                          historialTickets[servicioNombre].length > 0 && (
                            <div className="pt-3 border-t-2 border-gray-200 mt-auto">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <h4 className="text-xs font-bold text-gray-600 uppercase">
                                  Últimos Atendidos
                                </h4>
                              </div>
                              <div className="flex flex-col gap-2">
                                {historialTickets[servicioNombre].map(
                                  (ticket) => (
                                    <div
                                      key={`hist-${ticket.id}-${ticket.finalizado_at}`}
                                      className="flex flex-row items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 flex-1 min-w-[60px]">
                                      <div
                                        className="text-xl font-bold line-through opacity-50"
                                        style={{ color: data.color }}>
                                        {ticket.numero}
                                      </div>
                                      <div className="text-sm font-bold text-gray-500">
                                        P{ticket.puesto_numero}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
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
        // Pantalla de medios cuando no hay tickets
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
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === mediaIndex
                            ? "w-8 bg-gray-400/70"
                            : "w-2 bg-gray-800"
                        }`}
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