import { useState, useEffect } from "react";
import API from "../services/api";
import { Calendar, Clock, Bell, BellRing } from "lucide-react";
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

  const [showSpeaker, setShowSpeaker] = useState(true);

  useEffect(() => {
    // Desmonta el componente
    setShowSpeaker(false);

    // Vuelve a montarlo luego de 1 segundo
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
        })
      );
      setHora(
        ahora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
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

      const media = mediosData.filter(item => item.medio_active === 1);
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

        // Detectar nuevo ticket llamado
        if (tickets.length > 0 && ticketsAnteriores.length > 0) {
          const nuevoTicket = tickets.find(
            (t) => !ticketsAnteriores.some((ta) => ta.id === t.id)
          );

          if (nuevoTicket) {
            setTicketNuevo(nuevoTicket);

            // Reproducir sonido (opcional)
            // const audio = new Audio('/notification.mp3');
            // audio.play();

            setTimeout(() => {
              setTicketNuevo(null);
            }, 9000);
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
        if(nextIndex===0){
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
      return nextIndex;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-5 py-4 shadow-lg ">
        <div className=" mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {config?.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="w-20 h-20 drop-shadow-lg object-contain rounded-lg p-1 "
              />
            )}
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-4xl  font-bold">
              {config?.nombre_empresa || "MI EMPRESA"}
            </h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-xl sm:text-xl md:text-1xl lg:text-2xl xl:text-3xl  font-bold mb-1">
              <span className="capitalize">{fecha}</span>
            </div>

            <div className="flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl  font-bold">
              <span>{hora}</span>
            </div>
          </div>
        </div>
      </div>

      {ticketNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-16 max-w-2xl w-full mx-4 shadow-2xl animate-bounce-in">
            <div className="text-center">
              <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                TURNO SIGUIENTE
              </div>
              <div className="bg-blue-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <BellRing color="orange" className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-5xl font-extrabold text-gray-800 mb-4">
                ¡Turno Llamado!
              </h2>
              <div
                className="text-8xl font-extrabold mb-6"
                style={{ color: ticketNuevo.servicio_color }}>
                {ticketNuevo.numero}
              </div>
              <div className="text-3xl text-gray-700 mb-4">
                {ticketNuevo.servicio_nombre}
              </div>
              <div className="text-4xl font-bold text-blue-700">
                Puesto {ticketNuevo.puesto_numero}
              </div>
              <DemoSpeaker
                number={ticketNuevo.numero}
                text={ticketNuevo.puesto_nombre}
              />
            </div>
          </div>
        </div>
      )}

      {ticketsLlamados.length > 0 || ticketEspera.length > 0 ? (
        <div className="flex flex-row justify-around">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3 ">
              <Bell className="w-20 h-20 text-orange-500  " />
              Tickets Llamados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketsLlamados.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-2xl p-8 shadow-lg border-l-8 transform transition-all duration-300 hover:scale-105 ${
                    index === 0 ? "ring-4 ring-blue-400 animate-pulse-slow" : ""
                  }`}
                  style={{
                    borderLeftColor: ticket.servicio_color,
                    animationDelay: `${index * 100}ms`,
                  }}>
                  <div className="text-center">
                    {index === 0 && (
                      <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-3">
                        ¡AHORA!
                      </div>
                    )}
                    <div
                      className="text-6xl font-extrabold mb-4"
                      style={{ color: ticket.servicio_color }}>
                      {ticket.numero}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      Puesto{" "}
                      <span className="text-blue-600">
                        {ticket.puesto_numero} - {ticket.puesto_nombre}
                      </span>
                    </div>
                    {ticket.llamado_veces > 1 && (
                      <div className="mt-3 text-sm text-orange-600 font-semibold">
                        llamado por: ({ticket.llamado_veces}ª vez)
                        <DemoSpeaker
                          key={`${ticket.id}-${ticket.llamado_veces}`}
                          number={ticket.numero}
                          text={ticket.puesto_nombre}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3 ">
                <Clock className="w-20 h-20 text-amber-600 " />
                Tickets en Espera
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ticketEspera
                  .map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className={`bg-white rounded-2xl p-8 shadow-lg border-l-8 `}
                      style={{
                        borderLeftColor: ticket.servicio_color,
                        animationDelay: `${index * 100}ms`,
                      }}>
                      <div className="text-center">
                        <div
                          className="text-6xl font-extrabold mb-4"
                          style={{ color: ticket.servicio_color }}>
                          {ticket.numero}
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          <span className="text-blue-600">
                            {ticket.servicio_nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div> */}
        </div>
      ) : (
        <div
          className="flex items-center justify-center pt-1"
          style={{ height: "calc(100vh - 130px)" }}>
          {medios.length > 0 && (
            <div className="w-full h-full mx-auto animate-fade-in ">
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
                      key={medios[mediaIndex].url} // Key para forzar remontaje
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

                {/* Contador */}
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
