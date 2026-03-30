import { useState } from "react";
import { UserCog, Users, Briefcase, Check, X } from "lucide-react";
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
    if (!operador.activo) {
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
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)] rounded shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
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
            <h3 className="text-xl font-bold text-white pb-2 mb-4 border-b-orange-50 border-b-2">
              Operadores <span className="italic text-sm">{"("}activos{")"}</span>
            </h3>
            <div className="space-y-3">
              {operadoresServicios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay operadores registrados</p>
                </div>
              )}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {operadoresServicios
                .map((operador) => (
                  <div
                    key={operador.id}
                    onClick={() => handleSeleccionarOperador(operador)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      operadorSeleccionado?.id === operador.id
                        ? "border-4 bg-[var(--color-primary-blue)] text-white shadow-lg border-[var(--color-primary-yellow)] "
                        : " hover:bg-[var(--color-primary-blue)]"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`font-bold text-white ${
                            operador.activo
                              ? ""
                              : "line-through text-red-500"
                          }`}>
                          {operador.nombre}
                        </h4>
                        {operador.puesto_numero && (
                          <p
                            className={`text-xs mt-1 ${
                              operadorSeleccionado?.id === operador.id
                                ? "text-white"
                                : "text-white"
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
                            className={`px-2 py-1 rounded text-xs font-semibold border-1 border-white ${
                              operadorSeleccionado?.id === operador.id
                                ? "bg-white/50 "
                                : ""
                            }`}
                            style={{
                              backgroundColor: servicio.color + "20",
                              color: servicio.color,
                            }}>
                            {servicio.codigo}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Servicios Disponibles */}
          {loaditems ? (
            <div className="flex lg:col-span-2 text-center justify-center mt-40">
              <DotsLoader />
            </div>
          ) : (
            <div className="lg:col-span-2 rounded-xl">
              {operadorSeleccionado ? (
                <div className="bg-white p-4 rounded-xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      Servicios para: {operadorSeleccionado.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selecciona los servicios que este operador puede atender
                    </p>
                  </div>
                  <hr />
                  {serviciosOperador.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No hay servicios disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  p-3">
                        {serviciosOperador.map((servicio) => (
                          <div
                            title={
                              !servicio.service_active
                                ? "El servicio está deshabilitado"
                                : servicio.descripcion
                            }
                            key={servicio.id}
                            onClick={() => handleToggleServicio(servicio)}
                            className={`flex shadow-md rounded ${
                              servicio.asignado
                                ? servicio.service_active
                                  ? ""
                                  : "bg-gray-200 border-gray-200"
                                : ""
                            }`}>
                            <div className="flex gap-2">
                              <div
                                className={`w-6 h-6 rounded border-2 m-2 transition-all ${
                                  servicio.service_active
                                    ? servicio.asignado
                                      ? "bg-green-500 border-green-500"
                                      : "bg-red-400 border-red-300"
                                    : "bg-gray-500 border-gray-500"
                                }`}>
                                {servicio.asignado ? (
                                  <Check className="w-5 h-5 text-white" />
                                ) : (
                                  <X className="w-5 h-5 text-white" />
                                )}
                              </div>

                              <div className=" hover:cursor-pointer">
                                <div
                                  className={`flex items-center gap-3 mb-2 ${!servicio.service_active ? " text-gray-400" : ""}`}>
                                  <div
                                    className="text-3xl font-extrabold"
                                    style={{
                                      color: servicio.service_active
                                        ? servicio.color
                                        : "rgb(78, 78, 78, 0.2)",
                                    }}>
                                    {servicio.codigo}
                                  </div>
                                  <h4
                                    className={`flex  text-lg font-bold  ${!servicio.service_active ? " text-gray-400" : "text-gray-800"}`}>
                                    {servicio.nombre}
                                  </h4>
                                  <br />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
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
