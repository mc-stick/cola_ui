import { useState } from "react";
import { UserCog, Users, Briefcase } from "lucide-react";
import { toast } from "react-toastify";
import { DotsLoader, TabSpinner } from "../../components/loading";

function AsignarServiciosSection({
  operadoresServicios,
  LoadingSpin,
  onSeleccionarOperador,
  onToggleServicio,
  API,
}) {
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  const [serviciosOperador, setServiciosOperador] = useState([]);
  const [loaditems, setLoaditems] = useState(false);

  const handleSeleccionarOperador = async (operador) => {
    if (!operador.user_active) {
      toast.error("Usuario inactivo.");
      return;
    }

    setOperadorSeleccionado(operador);
    setLoaditems(true);

    try {
      const servicios = await API.getOperadorServicios(operador.id);
      setServiciosOperador(servicios);
    } catch (error) {
      toast.error("Error al cargar servicios del operador");
    } finally {
      setTimeout(() => {
        setLoaditems(false);
      }, 1000);
    }
  };

  const handleToggleServicio = async (servicio) => {
    if (!operadorSeleccionado) return;

    try {
      if (servicio.asignado) {
        await API.desasignarServicioOperador(
          operadorSeleccionado.id,
          servicio.id,
        );
        toast.error("Servicio No asignado.");
      } else {
        await API.asignarServicioOperador(operadorSeleccionado.id, servicio.id);
        toast.success("Servicio asignado.");
      }

      // Recargar servicios del operador
      const serviciosActualizados = await API.getOperadorServicios(
        operadorSeleccionado.id,
      );
      setServiciosOperador(serviciosActualizados);

      // Notificar al padre para actualizar la lista
      if (onToggleServicio) {
        await onToggleServicio();
      }
    } catch (error) {
      toast.error("Error al actualizar servicio");
    }
  };

  return (
    <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary-yellow)]" />
           Asignación de Servicios a Operadores
        </h2>
      </div>
<div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5"></div>
      {LoadingSpin ? (
        <div className="flex justify-center mt-20">
          <TabSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Operadores */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Operadores</h3>
            <div className="space-y-3">
              {operadoresServicios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay operadores registrados</p>
                </div>
              )}
              {operadoresServicios.map((operador) => (
                <div
                  key={operador.id}
                  onClick={() => handleSeleccionarOperador(operador)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    operadorSeleccionado?.id === operador.id
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-bold ${
                          operadorSeleccionado?.id === operador.id
                            ? "text-white"
                            : "text-gray-800"
                        } ${
                          operador.user_active
                            ? ""
                            : "line-through text-red-500"
                        }`}>
                        {operador.nombre}
                      </h4>
                      {operador.puesto_numero && (
                        <p
                          className={`text-xs mt-1 ${
                            operadorSeleccionado?.id === operador.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}>
                          Puesto: {operador.puesto_nombre}
                        </p>
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        operadorSeleccionado?.id === operador.id
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                      {operador.servicios?.length || 0}
                    </div>
                  </div>

                  {operador.servicios && operador.servicios.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {operador.servicios.map((servicio) => (
                        <span
                          key={servicio.id}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            operadorSeleccionado?.id === operador.id
                              ? "bg-white/20 text-white"
                              : ""
                          }`}
                          style={
                            operadorSeleccionado?.id !== operador.id
                              ? {
                                  backgroundColor: servicio.color + "20",
                                  color: servicio.color,
                                }
                              : {}
                          }>
                          {servicio.codigo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Servicios Disponibles */}
          {loaditems ? (
            <div className="flex justify-center mt-20">
              <DotsLoader />
            </div>
          ) : (
            <div className="lg:col-span-2">
              {operadorSeleccionado ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      Servicios para: {operadorSeleccionado.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selecciona los servicios que este operador puede atender
                    </p>
                  </div>

                  {serviciosOperador.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No hay servicios disponibles</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 rounded-xl border-blue-200 p-3">
                      {serviciosOperador.map((servicio) => (
                        <div
                          key={servicio.id}
                          onClick={() => handleToggleServicio(servicio)}
                          className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            servicio.asignado
                              ? servicio.service_active
                                ? "border-green-500 bg-green-50 shadow-md"
                                : "border-gray-500 bg-gray-50 shadow-md"
                              : "border-red-200 bg-red-50 hover:border-gray-300"
                          }`}>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 pt-1">
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  servicio.asignado
                                    ? servicio.service_active
                                      ? "bg-green-500 border-green-500"
                                      : "bg-gray-500 border-gray-500"
                                    : "bg-red-500 border-red-300"
                                }`}>
                                {servicio.asignado ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="text-3xl font-extrabold"
                                  style={{ color: servicio.color }}>
                                  {servicio.codigo}
                                </div>
                                <h4 className="text-lg font-bold text-gray-800">
                                  {servicio.nombre}
                                </h4>
                              </div>

                              {!servicio.service_active && (
                                <p className="text-sm text-red-500 font-bold mt-2">
                                  Servicio inhabilitado.
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {servicio.descripcion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <UserCog className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg">
                      Selecciona un operador para asignar servicios
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AsignarServiciosSection;
