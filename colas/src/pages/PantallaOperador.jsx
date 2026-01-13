import { useState, useEffect } from "react";
import API from "../services/api";
import { LogOut, PhoneCall, Check, X, UserCircle, Bell } from "lucide-react";

function PantallaOperador() {
  const [usuario, setUsuario] = useState(null);
  const [ticketsEspera, setTicketsEspera] = useState([]);
  const [ticketActual, setTicketActual] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attend, setAttend] = useState(false);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await API.login(username, password);
      if (result.success) {
        
        const servicios = await API.getOperadorServicios(result.user.id);
        const asignados = servicios
          .filter((s) => s.asignado)
          .map((s) => s.id);

        setServiciosAsignados(asignados);
        setUsuario(result.user);
      } else {
        alert("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al iniciar sesión");
    }
    setLoading(false);
  };


  useEffect(() => {
    if (!usuario || serviciosAsignados.length === 0) return;
    
    cargarTickets();
    const interval = setInterval(cargarTickets, 3000);
    return () => clearInterval(interval);
  }, [usuario, serviciosAsignados]); 

  const cargarTickets = async () => {
    try {
      
      const todosTickets = await API.getTicketsEspera();
      const ticketsFiltrados = todosTickets.filter((ticket) => {
        const incluido = serviciosAsignados.includes(ticket.servicio_id);
        return incluido;
      });


      setTicketsEspera(ticketsFiltrados);

      const miTicket = await API.getTicketsByOperador(usuario.id);
      const ticketEnAtencion = miTicket.find(
        (t) => t.estado === "llamado" || t.estado === "en_atencion"
      );

      setTicketActual(ticketEnAtencion || null);

     
    } catch (error) {
      console.error("Error cargando tickets:", error);
    }
  };

  const handleLlamarSiguiente = async () => {
    if (ticketsEspera.length === 0) {
      alert("No hay tickets en espera para tus servicios asignados");
      return;
    }

    if (attend) {
      alert("Ya tienes un ticket en atención");
      return;
    }

    try {
      const siguiente = ticketsEspera[0];
      if (!serviciosAsignados.includes(siguiente.servicio_id)) {
        alert("No tienes permiso para atender este servicio");
        return;
      }

      await API.llamarTicket(siguiente.id, usuario.id, usuario.puesto_id);
      setAttend(true);
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

    //if (!confirm("¿Confirmar que el ticket fue atendido?")) return;

    try {
      await API.finalizarTicket(ticketActual.id, usuario.id, "atendido");
      setTicketActual(null);
      setAttend(false);
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
      await API.finalizarTicket(ticketActual.id, usuario.id, "no_presentado");
      setTicketActual(null);
      setAttend(false);
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al finalizar ticket");
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Acceso Operador
            </h2>
            <p className="text-gray-600 mt-2">Ingresa tus credenciales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Ayuda para pruebas */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center mb-2">
              <strong>Usuarios de prueba:</strong>
            </p>
            <p className="text-xs text-gray-500 text-center">
              juan / operador123
              <br />
              maria / operador123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Operador: {usuario.nombre}</h2>
            <p className="text-blue-200 text-lg">
              Puesto: {usuario.puesto_numero || "Sin asignar"}
            </p>
            {serviciosAsignados.length > 0 && (
              <p className="text-blue-200 text-sm mt-1">
                {serviciosAsignados.length} servicio(s) asignado(s)
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setUsuario(null);
              setTicketActual(null);
              setTicketsEspera([]);
              setServiciosAsignados([]);
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket actual */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Ticket Actual
            </h3>

            {ticketActual ? (
              <div className="text-center">
                <div
                  className="text-7xl font-extrabold mb-4 animate-pulse"
                  style={{ color: ticketActual.servicio_color || "#1E40AF" }}
                >
                  {ticketActual.numero}
                </div>
                <div className="text-2xl text-gray-700 mb-2 font-semibold">
                  {ticketActual.servicio_nombre}
                </div>
                {ticketActual.identificacion && (
                  <div className="text-gray-600 mb-2">
                    ID: {ticketActual.identificacion}
                  </div>
                )}
                <div className="text-sm text-gray-500 mb-6">
                  Llamado {ticketActual.llamado_veces || 1}{" "}
                  {ticketActual.llamado_veces === 1 ? "vez" : "veces"}
                </div>

                <div className="grid grid-cols-1 gap-3 mt-8">
                  <button
                    onClick={handleReLlamar}
                    className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <PhoneCall className="w-6 h-6" />
                    Llamar de Nuevo
                  </button>
                  <button
                    onClick={handleAtendido}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <Check className="w-6 h-6" />
                    Atendido
                  </button>
                  <button
                    onClick={handleNoPresento}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <X className="w-6 h-6" />
                    No se Presentó
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <UserCircle className="w-24 h-24 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">
                  No hay ticket en atención
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Llama al siguiente cliente de la cola
                </p>
              </div>
            )}
          </div>

          {/* Cola de espera */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Tickets en Espera
              </h3>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                {ticketsEspera.length}
              </div>
            </div>

            {serviciosAsignados.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No tienes servicios asignados. Contacta al administrador.
                </p>
              </div>
            )}

            <button
              onClick={handleLlamarSiguiente}
              disabled={
                ticketsEspera.length === 0 ||
                attend === true ||
                serviciosAsignados.length === 0
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-xl mb-6 transition-all transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg"
            >
              {serviciosAsignados.length === 0
                ? "Sin servicios asignados"
                : ticketsEspera.length === 0
                ? "No hay tickets en espera"
                : attend
                ? "Atendiendo un ticket"
                : "Llamar Siguiente"}
            </button>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {ticketsEspera.slice(0, 10).map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border-l-4"
                  style={{
                    borderLeftColor: ticket.servicio_color || "#1E40AF",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: ticket.servicio_color || "#1E40AF" }}
                    >
                      {ticket.numero}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-700 font-semibold">
                      {ticket.servicio_nombre}
                    </div>
                    <div className="text-sm text-indigo-600">
                      {Math.floor(
                        (Date.now() - new Date(ticket.created_at)) / 60000
                      ) < 1
                        ? "justo ahora"
                        : `hace ${Math.floor(
                            (Date.now() - new Date(ticket.created_at)) / 60000
                          )} min`}
                    </div>
                  </div>
                </div>
              ))}

              {ticketsEspera.length === 0 && serviciosAsignados.length > 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No hay tickets en espera</p>
                  <p className="text-sm mt-2">para tus servicios asignados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaOperador;