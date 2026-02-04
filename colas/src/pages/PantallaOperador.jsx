import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import {
  LogOut,
  PhoneCall,
  Check,
  X,
  Bell,
  FileWarningIcon,
  TicketIcon,
  CircleUser,
  TagsIcon,
  ArrowRightLeftIcon,
  Settings2Icon,
  ChevronDown,
  Save,
  MapPinIcon,
  ClockIcon,
} from "lucide-react";
import LoginComponent from "./Login";

function PantallaOperador() {
  const [formulario, setFormulario] = useState({});
  const [value, setValue] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [EditOpen, setEditOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [ticketsEspera, setTicketsEspera] = useState([]);
  const [ticketActual, setTicketActual] = useState(null);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const menuRef = useRef(null);

  const [activo, setActivo] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [todosServicios, setTodosServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setActivo(false)
      }
    };

    if (menuOpen || activo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen,activo]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const allowedPrefixes = ["809", "829", "849"];
    setValue(false);
    if (inputValue.length <= 10) {
      if (inputValue.length >= 3) {
        const prefix = inputValue.slice(0, 3);

        if (allowedPrefixes.includes(prefix)) {
          setFormulario({
            ...formulario,
            tel: inputValue,
          });
        } else {
          setValue(true);
        }
      } else {
        setFormulario({
          ...formulario,
          tel: inputValue,
        });
      }
    }
  };

  const handleGuardarUsuario = async () => {
    if (formulario.tel?.length < 10) {
      setValue(true);
      return;
    }
    if (formulario.pass?.length < 5) {
      return;
    }
    try {
      await API.updateUsuarioOperator(usuario.id, formulario);

      setFormulario({});
      setEditOpen(false);
      restaurarSesion();
    } catch (error) {}
  };

  const restaurarSesion = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const result = await API.getCurrentUser();

        if (result.success && result.user.rol === "operador") {
          setUsuario(result.user);

          const servicios = await API.getOperadorServicios(result.user.id);
          const asignados = servicios.filter((s) => s.asignado);
          setServiciosAsignados(asignados);

          cargarTodosServicios();
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error restaurando sesión:", error);
        localStorage.removeItem("token");
      }
    }
  };

  useEffect(() => {
    restaurarSesion();
  }, []);

  const cargarTodosServicios = async () => {
    try {
      const servicios = await API.getServicios();
      setTodosServicios(servicios);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const handleLoginSuccess = (user, servicios) => {
    setUsuario(user);
    setServiciosAsignados(servicios);
    cargarTodosServicios();
    restaurarSesion();
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
        return serviciosAsignados.some(
          (servicio) => servicio.id === ticket.servicio_id,
        );
      });

      setTicketsEspera(ticketsFiltrados);

      const miTicket = await API.getTicketsByOperador(usuario.id);
      const ticketEnAtencion = miTicket.find(
        (t) => t.estado === "llamado" || t.estado === "en_atencion",
      );

      setTicketActual(ticketEnAtencion || null);
      comentario === null || comentario === ""
        ? setComentario(ticketEnAtencion?.notes || "")
        : "";
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
          (servicio) => servicio.id === siguiente.servicio_id,
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
        comentario,
      );
      setTicketActual(null);
      setComentario(null);
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
        comentario,
      );
      setTicketActual(null);
      setComentario(null);
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
        comentario,
      );
      setTicketActual(null);
      setComentario(null);
      setTimeout(() => cargarTickets(), 500);
    } catch (error) {
      alert("Error al finalizar ticket");
    }
  };

  const abrirModalTransferir = () => {
    setShowTransferModal(true);
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
      await API.transferirTicket(
        ticketActual.id,
        servicioSeleccionado,
        comentario,
      );
      setTicketActual(null);
      setComentario(null);
      cerrarModalTransferir();
      setTimeout(() => cargarTickets(), 500);
      alert("Ticket transferido exitosamente");
    } catch (error) {
      console.error("Error al transferir ticket:", error);
      alert("Error al transferir ticket");
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    setUsuario(null);
    setTicketActual(null);
    setTicketsEspera([]);
    setServiciosAsignados([]);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    setEditOpen(true);
  };

  function tiempoTranscurrido(fecha) {
    const diffMs = Date.now() - new Date(fecha).getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "justo ahora";
    if (diffMin < 60) return `hace ${diffMin} min`;

    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `hace ${diffHoras} h`;

    const diffDias = Math.floor(diffHoras / 24);
    return `hace ${diffDias} días`;
  }

  if (!usuario) {
    return (
      <LoginComponent
        onLoginSuccess={handleLoginSuccess}
        tipoUsuario="operador"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* INFO USUARIO */}
          <div
            className="mt-1 ml-10 p-2 flex items-center justify-between gap-16
                rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            {/* PUESTO */}
            <div className="flex ml-20 items-center gap-3">
              <div className="p-2 rounded-full bg-amber-400/20 animate-pulse">
                <MapPinIcon className="w-6 h-6 text-amber-300" />
              </div>

              <span
                className="px-4 py-1 rounded-lg text-lg font-extrabold uppercase tracking-wide
                     bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md">
                {usuario.puesto_nombre}
              </span>
            </div>

            {/* SERVICIOS */}
            {serviciosAsignados.length > 0 && (
              <div className="flex ml-20 mr-10 flex-col gap-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <TagsIcon className="w-5 h-5 text-cyan-300 animate-pulse" />
                  <span className="tracking-wide">Servicios asignados</span>
                </div>

                <div  className="flex flex-wrap gap-2 relative">
                  {serviciosAsignados.map((servicio) => (
                    <div key={servicio.id} className="relative">
                      <span
                        onClick={() =>
                          setActivo(activo === servicio.id ? null : servicio.id)
                        }
                        className={`relative px-3 py-1 rounded-lg text-xs font-bold border border-white/30
              shadow-md transition-all duration-300 cursor-pointer
              hover:scale-110 hover:shadow-xl hover:brightness-110 ${activo !== servicio.id ? null : servicio.id ? "animate-pulse":""}`}
                        style={{ backgroundColor: servicio.color }}>
                        {servicio.codigo}

                        <span
                          className="absolute inset-0 blur-md opacity-40 -z-10 rounded-lg"
                          style={{ backgroundColor: servicio.color }}
                        />
                      </span>

                      {/* Tooltip */}
                      {activo === servicio.id && (
                        <div
                        ref={menuRef}
                          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2
              bg-gray-900 text-white text-xs font-bold
              px-3 py-2 rounded-lg shadow-xl whitespace-nowrap
              animate-fade-in">
                          {servicio.nombre}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NOMBRE + MENÚ */}
          <div className="relative mt-10 text-right">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-3xl font-bold p-2 hover:bg-blue-800/40 rounded-lg transition">
              <CircleUser className="w-8 h-6 text-blue-300" />
              {usuario.nombre}
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition">
                  <Settings2Icon className="w-5 h-5 text-cyan-600" />
                  Configuración
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition">
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
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
                  style={{ color: ticketActual.servicio_color || "#1E40AF" }}>
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
                    className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <PhoneCall className="w-6 h-6" />
                    Llamar de Nuevo
                  </button>
                  <button
                    onClick={handleAtendido}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <Check className="w-6 h-6" />
                    Atendido
                  </button>
                  <button
                    onClick={handleNoPresento}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <X className="w-6 h-6" />
                    No se Presentó
                  </button>
                  <button
                    onClick={handleMasTarde}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <ClockIcon className="w-6 h-6" />
                    Volver mas tarde.
                  </button>
                  <button
                    onClick={abrirModalTransferir}
                    className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    <ArrowRightLeftIcon className="w-6 h-6" />
                    Transferir
                  </button>

                  <textarea
                    id="message"
                    rows="3"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
                    placeholder="Agrega un comentario aqui..."></textarea>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TicketIcon className="w-24 h-24 mx-auto" />
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
                <p className="text-yellow-800 text-sm flex">
                  <FileWarningIcon />{" "}
                  <span className="ml-2">
                    No tienes servicios asignados. Contacta al administrador.
                  </span>
                </p>
              </div>
            )}

            <button
              onClick={handleLlamarSiguiente}
              disabled={
                ticketsEspera.length === 0 ||
                ticketActual !== null ||
                serviciosAsignados.length === 0 ||
                usuario.puesto_numero === null
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-xl mb-6 transition-all transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg">
              {serviciosAsignados.length === 0
                ? "Sin servicios asignados"
                : usuario.puesto_numero === null
                  ? "No tienes un puesto asignado"
                  : ticketsEspera.length === 0
                    ? "No hay tickets en espera"
                    : ticketActual !== null
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
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: ticket.servicio_color || "#1E40AF" }}>
                      {ticket.numero}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-700 font-semibold">
                      {ticket.servicio_nombre}
                    </div>
                    {ticket.transferido === 1 && (
                      <div className="text-red-700 font-semibold text-xs">
                        Transferido (Prioridad)
                      </div>
                    )}
                    <div className="text-sm text-indigo-600">
                      {tiempoTranscurrido(ticket.created_at)}
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

      {EditOpen && (
        <EditModal
          usuario={usuario}
          formulario={formulario}
          setFormulario={setFormulario}
          value={value}
          setvalue={setValue}
          handleChange={handleChange}
          handleGuardarUsuario={handleGuardarUsuario}
          setEditOpen={setEditOpen}
        />
      )}

      {/* Modal de Transferencia */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeftIcon className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Transferir Ticket
              </h3>
              <p className="text-gray-600">
                Ticket:{" "}
                <span className="font-bold text-cyan-600">
                  {ticketActual?.numero}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Seleccionar Servicio de Destino
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {todosServicios.map((servicio) => (
                  <label
                    key={servicio.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      servicioSeleccionado === servicio.id
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}>
                    <input
                      type="radio"
                      name="servicio"
                      value={servicio.id}
                      checked={servicioSeleccionado === servicio.id}
                      onChange={() => setServicioSeleccionado(servicio.id)}
                      className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="ml-3 flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: servicio.color }}></div>
                      <span className="font-semibold text-gray-800">
                        {servicio.nombre}
                      </span>
                      <span
                        className="ml-auto text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: servicio.color,
                          color: "white",
                        }}>
                        {servicio.codigo}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cerrarModalTransferir}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-bold transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirmarTransferencia}
                disabled={!servicioSeleccionado}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-bold transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallaOperador;

const EditModal = ({
  usuario,
  formulario,
  setFormulario,
  value,
  handleChange,
  handleGuardarUsuario,
  setEditOpen,
}) => {
  const passLength = formulario.pass?.length || 0;
  const telLength = formulario.tel?.length || 0;

  return (
    <div className="fixed inset-0 bg-gray-800/90  flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full mx-4 shadow-xl animate-bounce-in">
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">Configuración</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                disabled
                value={usuario.nombre || ""}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                disabled
                value={usuario.username || ""}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={formulario?.pass || ""}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    pass: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border-2 ${formulario.pass?.length < 5 || 0 ? "border-red-400" : "border-gray-300"}  rounded-lg focus:outline-none focus:border-blue-600`}
                placeholder={"dejar vacío no cambia"}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-semibold ${value ? "text-red-600" : "text-gray-700"}  mb-2`}>
                Número de teléfono {value ? "(incorrecto)" : ""}
              </label>
              <input
                type="text"
                value={formulario.tel || ""}
                onChange={handleChange}
                placeholder={usuario.tel || "Ingresa un número de teléfono"}
                className={`w-full px-4 py-2 border-2 ${value ? "border-red-600 focus:border-red-600" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-600`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGuardarUsuario}
              disabled={passLength < 5 && telLength < 10}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors 
    ${
      passLength < 5 && telLength < 10
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700 text-white"
    }`}>
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditOpen(false);
                setFormulario({});
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
