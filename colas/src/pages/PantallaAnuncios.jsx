import { useState, useEffect, useRef, useCallback } from "react";
import API from "../services/api";
import { BellRing, CheckCircle, AlertTriangle } from "lucide-react";
import DemoSpeaker from "../TTS/DEMOindex";
import "./../styles/Pantalla.css";
import { useFecha, useHora } from "../components/common/clok";

// Duración que permanece visible cada modal antes de pasar al siguiente
const MODAL_DURACION_MS = 5000;

function PantallaAnuncios() {
  const hora = useHora();
  const fecha = useFecha();
  const [config, setConfig] = useState(null);
  const [ticketsLlamados, setTicketsLlamados] = useState([]);
  const [medios, setMedios] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [ticketEspera, setTicketEspera] = useState([]);
  const [historialTickets, setHistorialTickets] = useState({});

  // ── Cola de tickets pendientes de mostrar ──────────────────────────────────
  const colaRef = useRef([]); // tickets pendientes
  const mostrandoRef = useRef(false); // ¿hay un modal activo ahora mismo?
  const timeoutRef = useRef(null); // timeout del modal actual

  // Ticket que se muestra en pantalla (null = modal oculto)
  const [ticketVisible, setTicketVisible] = useState(null);

  // ── Función que procesa el siguiente ticket de la cola ─────────────────────
  const procesarCola = useCallback(() => {
    if (colaRef.current.length === 0) {
      mostrandoRef.current = false;
      setTicketVisible(null);
      return;
    }

    const siguiente = colaRef.current.shift();
    mostrandoRef.current = true;
    setTicketVisible(siguiente);

    timeoutRef.current = setTimeout(() => {
      procesarCola();
    }, MODAL_DURACION_MS);
  }, []);

  // ── Encola un ticket y arranca la cola si está libre ──────────────────────
  const encolarTicket = useCallback(
    (ticket) => {
      colaRef.current.push(ticket);
      if (!mostrandoRef.current) {
        procesarCola();
      }
    },
    [procesarCola],
  );

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Reloj ──────────────────────────────────────────────────────────────────

  // ── Datos generales ────────────────────────────────────────────────────────
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

  // ── Polling de tickets ─────────────────────────────────────────────────────
  useEffect(() => {
    let ticketsAnteriores = [];

    const cargarTickets = async () => {
      try {
        const tickets = await API.getTicketsLlamados();
        const esperaTickets = await API.getTicketsEspera();

        if (tickets.length > 0) {
          if (ticketsAnteriores.length === 0) {
            // Primera carga: encolar el primer ticket visible
            encolarTicket(tickets[0]);
          } else {
            // Ticket nuevo (no existía antes)
            const nuevoTicket = tickets.find(
              (t) => !ticketsAnteriores.some((ta) => ta.id === t.id),
            );
            if (nuevoTicket) {
              encolarTicket(nuevoTicket);
            }

            // Rellamado: ticket que aumentó su contador "llamado"
            tickets.forEach((ticket) => {
              const ticketAnterior = ticketsAnteriores.find(
                (ta) => ta.id === ticket.id,
              );
              if (ticketAnterior && ticket.llamado > ticketAnterior.llamado) {
                encolarTicket(ticket);
              }
            });

            // Tickets finalizados → historial
            const ticketsFinalizados = ticketsAnteriores.filter(
              (ta) => !tickets.some((t) => t.id === ta.id),
            );
            if (ticketsFinalizados.length > 0) {
              setHistorialTickets((prevHistorial) => {
                const nuevoHistorial = { ...prevHistorial };
                ticketsFinalizados.forEach((ticket) => {
                  const svc = ticket.servicio_nombre;
                  if (!nuevoHistorial[svc]) nuevoHistorial[svc] = [];
                  nuevoHistorial[svc] = [
                    { ...ticket, finalizado_at: new Date() },
                    ...nuevoHistorial[svc],
                  ].slice(0, 5);
                });
                return nuevoHistorial;
              });
            }
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
  }, [encolarTicket]);

  // ── Rotación de medios ─────────────────────────────────────────────────────
  useEffect(() => {
    if (medios.length === 0) return;
    const currentMedia = medios[mediaIndex];
    if (currentMedia?.tipo === "video") return;

    const timeout = setTimeout(() => {
      setMediaIndex((prev) => {
        const nextIndex = (prev + 1) % medios.length;
        if (nextIndex === 0) cargarDatos();
        return nextIndex;
      });
    }, config?.tiempo_rotacion || 5000);

    return () => clearTimeout(timeout);
  }, [medios, mediaIndex, config]);

  const handleVideoEnded = () => {
    setMediaIndex((prev) => {
      const nextIndex = (prev + 1) % medios.length;
      if (nextIndex === 0) cargarDatos();
      return nextIndex;
    });
  };

  // ── Agrupación de tickets por servicio ────────────────────────────────────
  const ticketsPorServicio = ticketsLlamados.reduce((acc, ticket) => {
    const svc = ticket.servicio_nombre;
    if (!acc[svc]) acc[svc] = { color: ticket.servicio_color, tickets: [] };
    acc[svc].tickets.push(ticket);
    return acc;
  }, {});

  Object.keys(historialTickets).forEach((svc) => {
    if (!ticketsPorServicio[svc] && historialTickets[svc].length > 0) {
      ticketsPorServicio[svc] = {
        color: historialTickets[svc][0].servicio_color,
        tickets: [],
      };
    }
  });

  const ticketActual = ticketsLlamados.length > 0 ? ticketsLlamados[0] : null;

  // ── Componente de anuncios ─────────────────────────────────────────────────
  const Ads = () => (
    <div
      className="flex items-center justify-center overflow-hidden w-full"
      style={{ height: "calc(100vh - 140px)" }} // Altura fija garantizada
    >
      {medios.length > 0 && (
        <div className="w-full h-full p-4 flex flex-col">
          {/* Marco Dorado con altura flexible para llenar el padre (flex-grow) */}
          <div
            className="relative rounded-[3rem] shadow-[0_20px_50px_rgba(30,42,79,0.2)] overflow-hidden flex-grow border-[6px] bg-black"
            style={{ borderColor: "var(--color-mono-gold)" }}
          >
            {/* Contenedor Interno: 
            Usamos absolute inset-0 para que no dependa del tamaño del contenido hijo
          */}

            {!config?.blur ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[2.8rem]">
                <div className="absolute inset-0 z-0">
                  {medios[mediaIndex].tipo === "imagen" ? (
                    <img
                      src={medios[mediaIndex].url}
                      alt=""
                      className={`w-full h-full object-contain ${!config?.Split && "blur-xl"}  scale-100 `}
                    />
                  ) : (
                    <video
                      src={medios[mediaIndex].url}
                      className="w-full h-full object-cover blur-3xl scale-100 "
                      autoPlay
                      muted
                      loop
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[2.8rem]">
                {/* 1. CAPA DE FONDO (BLUR) */}
                <div className="absolute inset-0 z-0">
                  {medios[mediaIndex].tipo === "imagen" ? (
                    <img
                      src={medios[mediaIndex].url}
                      alt=""
                      className="w-full h-full object-cover blur-3xl scale-125 opacity-70"
                    />
                  ) : (
                    <video
                      src={medios[mediaIndex].url}
                      className="w-full h-full object-cover blur-3xl scale-125 opacity-70"
                      autoPlay
                      muted
                      loop
                    />
                  )}
                </div>

                {/* 2. OVERLAY OSCURO (Para dar profundidad) */}
                <div className="absolute inset-0 bg-black/40 z-10" />

                {/* 3. CONTENIDO PRINCIPAL (SIN DEFORMAR) */}
                <div className="relative z-20 flex items-center justify-center w-full h-full p-2">
                  {medios[mediaIndex].tipo === "imagen" ? (
                    <img
                      src={medios[mediaIndex].url}
                      alt={medios[mediaIndex].nombre}
                      // max-h-full y w-auto asegura que nunca se corte ni se estire
                      className="max-w-full max-h-full rounded-xl object-contain drop-shadow-2xl"
                    />
                  ) : (
                    <video
                      key={medios[mediaIndex].url}
                      src={medios[mediaIndex].url}
                      className="max-w-full max-h-full rounded-xl object-contain drop-shadow-2xl"
                      autoPlay
                      muted
                      onEnded={handleVideoEnded}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Overlay gradiente inferior para los puntos */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 via-transparent to-transparent z-30 pointer-events-none" />

            {/* Indicadores de progreso */}
            {medios.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-40">
                {medios.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      index === mediaIndex
                        ? "w-10 bg-[var(--color-primary-yellow)] shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        : "w-2.5 bg-white/30 backdrop-blur-md"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Contador superior */}
            <div className="absolute top-6 right-6 z-40 bg-black/50 backdrop-blur-xl text-white px-5 py-2 rounded-full text-xs font-black border border-white/20 tracking-tighter">
              {mediaIndex + 1} <span className="text-white/40 mx-1">/</span>{" "}
              {medios.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render Principal ───────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-[#edf2f7] relative overflow-hidden flex flex-col">
      {/* Header con personalidad */}
      <header className="bg-[var(--color-primary-blue)] px-10 py-5 shadow-xl relative z-20 shrink-0">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            {config?.logo_url && (
              <div className="bg-transparent p-2 rounded-2xl shadow-inner border border-white/10">
                <img
                  src={config.logo_url}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                {config?.nombre_empresa || "MI EMPRESA"}
              </h1>
              {/* <div className="flex items-center gap-2 mt-1">
                <span className="h-1 w-10 bg-[var(--color-primary-yellow)] rounded-full"></span>
                <p className="text-xs font-bold text-[var(--color-secondary-blue-light)] uppercase tracking-[0.2em]">
                  Sistema de Atención Inteligente
                </p>
              </div> */}
            </div>
          </div>

          {/* Widget de Tiempo */}
          <div className=" backdrop-blur-md rounded-3xl p-4  text-center min-w-[200px]">
            <div className="text-white/60 text-xl font-bold uppercase mb-1 tracking-widest">
              {fecha}
            </div>
            <div className="text-4xl font-black text-[var(--color-primary-yellow)] leading-none tabular-nums">
              {hora}
            </div>
          </div>
        </div>
      </header>

      {/* Área de Contenido */}
      <main className="flex-grow overflow-hidden relative">
        {config?.Split ? (
          <div
            className={`grid grid-cols-1 ${ticketsLlamados.length > 0 ? "lg:grid-cols-[35%_65%]" : ""} h-full`}
          >
            {/* LISTA LATERAL */}
            {ticketsLlamados.length > 0 && (
              <div className="bg-[#e2e8f0] p-8 overflow-y-auto border-r-4 border-[var(--color-mono-gold)]/20 shadow-inner">
                <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary-blue)]/10 pb-4">
                  <h2 className="text-2xl font-black text-[var(--color-primary-blue)] uppercase">
                    En Ventanilla
                  </h2>
                  <span className="bg-[var(--color-primary-green)] text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">
                    EN VIVO
                  </span>
                </div>

                <ul className="space-y-6">
                  {Object.entries(ticketsPorServicio).flatMap(([, data]) =>
                    data.tickets.map((ticket) => (
                      <li
                        key={ticket.id}
                        className="flex justify-between items-center rounded-[2.5rem] bg-white shadow-lg p-6 border-b-[8px] transition-all hover:scale-[1.02]"
                        style={{ borderBottomColor: data.color }}
                      >
                        <div>
                          <span className="block text-3xl font-black tracking-tighter text-[var(--color-primary-blue)]">
                            {ticket.numero}
                          </span>
                          <span className="text-[10px] font-black text-[var(--color-mono-silver)] uppercase tracking-widest italic">
                            {ticket.llamado > 1
                              ? `${ticket.llamado} llamados`
                              : "Atendiendo"}
                          </span>
                        </div>
                        <div className="text-right bg-[var(--color-primary-blue)] text-white p-4 rounded-3xl min-w-[120px]">
                          <span className="text-xl font-black block uppercase leading-none">
                            {ticket.puesto_nombre}
                          </span>
                        </div>
                      </li>
                    )),
                  )}
                </ul>
              </div>
            )}

            <div className="bg-white overflow-hidden h-full flex items-center justify-center">
              <Ads />
            </div>
          </div>
        ) : (
          /* VISTA GRID (Tarjetas blancas sobre fondo gris azulado suave) */
          <div className="p-8 h-full overflow-y-auto">
            {ticketsLlamados.length > 0 ? (
              <div className="max-w-[1600px] mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(ticketsPorServicio).map(
                  ([servicioNombre, data]) => (
                    <div
                      key={servicioNombre}
                      className="bg-white rounded-[3.5rem] p-8 shadow-xl border-t-[12px] flex flex-col h-fit relative"
                      style={{ borderTopColor: data.color }}
                    >
                      <div className="mb-6">
                        <h3 className="text-3xl font-black text-[var(--color-primary-blue)] uppercase tracking-tighter">
                          {servicioNombre}
                        </h3>
                        <div className="text-[10px] font-bold text-[var(--color-primary-green)] bg-[var(--color-primary-green)]/10 px-3 py-1 rounded-full inline-block mt-2 italic">
                          {data.tickets.length} personas en turno
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {data.tickets.map((ticket, index) => (
                          <li
                            key={ticket.id}
                            className={`p-6 rounded-[2.5rem] flex justify-between items-center border-2 transition-all ${
                              index === 0 && ticketActual?.id === ticket.id
                                ? "bg-[var(--color-secondary-yellow-light)] border-[var(--color-mono-gold)] shadow-lg scale-[1.05]"
                                : "bg-[#f8fafc] border-transparent shadow-sm"
                            }`}
                          >
                            <div className="text-6xl font-black tracking-tighter text-[var(--color-primary-blue)]">
                              {ticket.numero}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-xl uppercase text-[var(--color-secondary-blue-dark)]">
                                {ticket.puesto_nombre}
                              </p>
                              {index === 0 &&
                                ticketActual?.id === ticket.id && (
                                  <span className="flex h-2 w-2 rounded-full bg-[var(--color-primary-red)] animate-ping ml-auto mt-2"></span>
                                )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <Ads />
            )}
          </div>
        )}
      </main>

      {/* Modal de Turno Llamado */}
      {ticketVisible && (
        <div className="fixed inset-0 bg-[var(--color-primary-blue)]/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#fdfdfd] rounded-[5rem] p-12 max-w-3xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden border-[10px] border-[var(--color-primary-yellow)]">
            <div className="text-center">
              <div className="mb-4 inline-block bg-[var(--color-secondary-blue-dark)] text-white px-8 py-2 rounded-full font-black text-xl animate-bounce">
                ¡SU TURNO!
              </div>
              <div
                className="text-[8rem] font-black mb-2 tracking-tighter leading-none italic"
                style={{
                  color:
                    ticketVisible.servicio_color || "var(--color-primary-blue)",
                }}
              >
                {ticketVisible.numero}
              </div>
              <div className="h-1 w-40 bg-[var(--color-mono-silver)]/30 mx-auto mb-8 rounded-full"></div>
              <div className="text-6xl font-black text-[var(--color-primary-red)] tracking-tight uppercase">
                {ticketVisible.puesto_nombre}
              </div>
              <div className="mt-8">
                <DemoSpeaker
                  number={ticketVisible.numero}
                  text={ticketVisible.puesto_nombre}
                  song={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallaAnuncios;
