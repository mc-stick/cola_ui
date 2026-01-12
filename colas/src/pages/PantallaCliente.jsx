import { useState, useEffect } from "react";
import API from "../services/api";
import { Phone, CreditCard, User, ArrowLeft, Check, X } from "lucide-react";
import Logo from "../components/Logo";
import { SendTwilioSms } from "../twilio/TwMsg";

function PantallaCliente() {
  const [paso, setPaso] = useState(1);
  const [tipoId, setTipoId] = useState(null);
  const [identificacion, setIdentificacion] = useState("");
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [ticketGenerado, setTicketGenerado] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configData] = await Promise.all([API.getConfiguracion()]);
        setConfig(configData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const data = await API.getServicios();
      setServicios(data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    }
  };

  const handleTipoId = (tipo) => {
    setTipoId(tipo);
    if (tipo === "sin_id") {
      setPaso(3);
    } else {
      setPaso(2);
    }
  };

  const PREFIJOS_RD = ["809", "829", "849"];

  const esTelefonoRDValido = (valor) => {
    if (valor.length !== 10) return false;
    return PREFIJOS_RD.some((prefijo) => valor.startsWith(prefijo));
  };

  const handleAgregarDigito = (digito) => {
     console.log("printing ide", tipoId)
    setIdentificacion((prev) => {
      // IDENTIFICACIÓN: máximo 8 dígitos
      if (tipoId === "identificacion" && prev.length >= 8) {
       
        return prev;
      }

      // TELÉFONO: máximo 10 dígitos
      if (tipoId === "telefono" && prev.length >= 10) {
        return prev;
      }

      return prev + digito;
    });
  };

  const handleBorrar = () => {
    setIdentificacion(identificacion.slice(0, -1));
  };

  const handleConfirmarId = () => {
    if (tipoId === "identificacion") {
      if (identificacion.length !== 8) {
        alert("La identificación debe tener 8 dígitos.");
        return;
      }
    }

    if (tipoId === "telefono") {
      if (!esTelefonoRDValido(identificacion)) {
        alert("Ingrese un número de teléfono válido.");
        return;
      }
    }

    setPaso(3);
  };

  const handleSeleccionarServicio = async (servicio) => {
    try {
      setServicioSeleccionado(servicio);

      const ticket = await API.createTicket({
        servicio_id: servicio.id,
        tipo_identificacion: tipoId,
        identificacion: identificacion || null,
      });

      setTicketGenerado(ticket);
      setPaso(4);

      if (tipoId === "telefono") {
        //console.log("Enviar SMS al:", identificacion);
        SendTwilioSms("mensaje a enviar",identificacion);
      } else {
        await imprimirTicket(ticket);
      }
    } catch (error) {
      console.error("Error creando ticket:", error);
      alert("Error al generar el ticket");
    }
  };

  const imprimirTicket = async (ticket) => {
    console.log("imprimir")
    // try {
    //   await fetch("http://localhost:8080/imprimir", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       ticketNumber: ticket.numero,
    //       message: servicioSeleccionado?.nombre,
    //     }),
    //   });
    // } catch (error) {
    //   console.error("Error al imprimir:", error);
    // }
  };

  const handleReiniciar = () => {
    setPaso(1);
    setTipoId(null);
    setIdentificacion("");
    setServicioSeleccionado(null);
    setTicketGenerado(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            {config?.logo_url && (
              <img
                src={config.logo_url}
                alt="Logo"
                className="w-20 h-20 drop-shadow-lg object-contain rounded-lg p-1"
              />
            )}
            Solicitar Ticket
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Paso 1: Seleccionar tipo de identificación */}
        {paso === 1 && (
          <div className="animation-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              ¿Cómo deseas identificarte?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleTipoId("telefono")}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Con Teléfono
                </h3>
                <p className="text-gray-600">Recibirás un SMS</p>
              </button>

              <button
                onClick={() => handleTipoId("identificacion")}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Con Matrícula
                </h3>
                <p className="text-gray-600">Ingresa tu matrícula</p>
              </button>

              <button
                onClick={() => handleTipoId("sin_id")}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Sin ID
                </h3>
                <p className="text-gray-600">Continuar sin identificarse</p>
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Ingresar número */}
        {paso === 2 && (
          <div className="animation-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Ingresa tu {tipoId === "telefono" ? "teléfono" : "Matrícula"}
            </h2>

            <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
              <div className="text-6xl font-bold text-center text-blue-700 mb-8 min-h-[80px] flex items-center justify-center">
                {identificacion || "---"}
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleAgregarDigito(num.toString())}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl transition-colors">
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBorrar}
                  className="bg-red-600 hover:bg-red-700 text-white text-2xl font-bold py-6 rounded-xl transition-colors flex items-center justify-center">
                  <X className="w-8 h-8" />
                </button>
                <button
                  onClick={() => handleAgregarDigito("0")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl transition-colors">
                  0
                </button>
                <button
                  onClick={handleConfirmarId}
                  disabled={
                    tipoId === "identificacion"
                      ? identificacion.length !== 8
                      : !esTelefonoRDValido(identificacion)
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-2xl font-bold py-6 rounded-xl transition-colors flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setPaso(1)}
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-lg">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        )}

        {/* Paso 3: Seleccionar servicio */}
        {paso === 3 && (
          <div className="animation-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Selecciona el servicio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {servicios.map((servicio) => (
                <button
                  key={servicio.id}
                  onClick={() => handleSeleccionarServicio(servicio)}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-left border-t-8"
                  style={{ borderTopColor: servicio.color }}>
                  <div
                    className="text-5xl font-extrabold mb-4"
                    style={{ color: servicio.color }}>
                    {servicio.codigo}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {servicio.nombre}
                  </h3>
                  <p className="text-gray-600">{servicio.descripcion}</p>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    Tiempo promedio: {servicio.tiempo_promedio} min
                  </p> */}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaso(tipoId === "sin_id" ? 1 : 2)}
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-lg">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && (
          <div className="animation-fade-in text-center">
            <div className="bg-white p-12 rounded-2xl shadow-lg max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-16 h-16 text-white" />
              </div>

              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                ¡Ticket Generado!
              </h2>

              <div className="mb-8">
                <div
                  className="text-7xl font-extrabold mb-4"
                  style={{ color: servicioSeleccionado?.color }}>
                  {ticketGenerado?.numero}
                </div>
                <div className="text-2xl text-gray-700 mb-4">
                  {servicioSeleccionado?.nombre}
                </div>

                {tipoId === "telefono" ? (
                  <p className="text-gray-600 text-lg">
                    Se ha enviado un SMS al número{" "}
                    <strong>{identificacion}</strong>
                  </p>
                ) : (
                  <p className="text-gray-600 text-lg">
                    Por favor, retira tu ticket y espera a ser llamado.
                  </p>
                )}
              </div>

              <button
                onClick={handleReiniciar}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-colors">
                {/* {tipoId === "telefono" ? "Aceptar" : "Imprimir"} */}
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PantallaCliente;
