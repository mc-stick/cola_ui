import { useState, useRef, useEffect } from "react";
import {
  BarChartHorizontalBig,
  Calendar,
  TrendingUp,
  Clock,
  X,
  ArrowRightLeftIcon,
  Users,
  Briefcase,
} from "lucide-react";
import { CardLoader,  } from "../../components/loading";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AnimatedRating, StarRating } from "../../components/common/Rating";

function EstadisticasSection({
  LoadingSpin,
  onCargarEstadisticas,
  validarFechasEstadisticas,
}) {
  const [estadisticasRango, setEstadisticasRango] = useState([]);
  const [estadisticasServicios, setEstadisticasServicios] = useState([]);
  const [estadisticasOperadores, setEstadisticasOperadores] = useState([]);
  const [estadisticasHoras, setEstadisticasHoras] = useState([]);
  const [resumenGeneral, setResumenGeneral] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );

  const cargarEstadisticas = async () => {
    if (!validarFechasEstadisticas(fechaInicio, fechaFin)) {
      return;
    }

    const datos = await onCargarEstadisticas(fechaInicio, fechaFin);
    if (datos) {
      setEstadisticasRango(datos.rango || []);
      setEstadisticasServicios(datos.servicios || []);
      setEstadisticasOperadores(datos.operadores || []);
      setEstadisticasHoras(datos.horas || []);
      setResumenGeneral(datos.resumen || null);
    }
  };

  useEffect(() => {
    cargarEstadisticas()
  }, [])



  return (
    <div className="space-y-6">
      {/* Filtros de Fecha */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <BarChartHorizontalBig className="w-8 h-8 text-orange-600" />
          Estadísticas
        </h2>
        <div className="bg-gray-50 rounded-xl p-6 mb-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-semibold text-gray-700">
                Desde:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Hasta:
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex gap-2 ">
            <button
              onClick={cargarEstadisticas}
              className={`flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors
              ${estadisticasRango && estadisticasRango?.length > 0 ? "" : "bg-green-600 animate-pulse font-black"}`}>
              <span
                className={` ${estadisticasRango && estadisticasRango?.length > 0 ? "" : "animate-bounce mt-2"}`}>
                <TrendingUp className="w-5 h-5 " />
              </span>
              Actualizar
            </button>
            {/* <button
              disabled={estadisticasRango && estadisticasRango.length > 0 ? false : true}
              onClick={() => exportarCSV([resumenGeneral])}
              className={`flex items-center gap-2  text-white px-6 py-1 rounded-lg font-semibold transition-colors
               ${estadisticasRango && estadisticasRango.length > 0 ? " bg-green-600 hover:bg-green-700 " : "bg-gray-400 hover:cursor-not-allowed"}`}>
              <span
                className={`${estadisticasRango && estadisticasRango.length > 0 ? "animate-bounce font-bold mt-1" : ""}`}>
                <Download className="w-5 h-5" />
              </span>
              Todo a CSV
            </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de Tickets por Día */}
      {LoadingSpin ? (
        <CardLoader />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Tickets por Día
            </h3>
            
            {estadisticasRango && estadisticasRango?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estadisticasRango}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()} - ${date
                        .toLocaleString("es-ES", { month: "long" })
                        .replace(/^./, (l) => l.toUpperCase())}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("es-ES");
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_tickets"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="atendidos"
                    stroke="#10B981"
                    strokeWidth={4}
                    name="Atendidos"
                  />
                  <Line
                    type="monotone"
                    dataKey="no_presentados"
                    stroke="#EF4444"
                    strokeWidth={4}
                    name="No Atendido"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hay datos para mostrar en este período</p>
              </div>
            )}
          </div>

          {/* Tickets por Servicio */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            
           
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Tickets por Servicio
            </h3>
            {estadisticasServicios && estadisticasServicios?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticasServicios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis fontWeight="bold" dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_tickets" fill="#3B82F6" name="Total" />
                  <Bar dataKey="atendidos" fill="#10B981" name="Atendidos" />
                  <Bar
                    dataKey="no_presentados"
                    fill="red"
                    name="No Atendidos"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hay datos de servicios</p>
              </div>
            )}
          </div>

          {/* Tickets por Hora */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Tickets por Hora del Día ({fechaFin})
            </h3>
            {estadisticasHoras && estadisticasHoras?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticasHoras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hora"
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Hora: ${value}:00`} />
                  <Legend />
                  <Bar dataKey="total_tickets" fill="#3B82F6" name="Total" />
                  <Bar dataKey="atendidos" fill="#10B981" name="Atendidos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hay datos de tickets en este día</p>
              </div>
            )}
          </div>

          {/* Rendimiento por Operador */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Rendimiento por Operador
            </h3>
            <div className="space-y-4">
              {estadisticasOperadores && estadisticasOperadores?.length > 0 ? (
                estadisticasOperadores.map((operador) => (
                  <div
                    key={operador.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">
                          {operador.puesto_numero || "?"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {operador.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Puesto {operador.puesto_numero || "Sin asignar"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-8 text-center">
                      <AnimatedRating value={operador.promedio_evaluacion || 0} />

                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {operador.total_tickets || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {operador.atendidos || 0}
                        </div>
                        <div className="text-xs text-gray-600">Atendidos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {(operador.total_tickets-operador.atendidos) || 0}
                        </div>
                        <div className="text-xs text-gray-600">No atendidos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round(operador.tiempo_promedio_servicio || 0)}{" "}
                          min
                        </div>
                        <div className="text-xs text-gray-600">
                          Tiempo Promedio
                          <p>de atención</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos de operadores en este período</p>
                </div>
              )}
            </div>
          </div>

          {/* Detalle de Servicios */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Detalle por Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estadisticasServicios && estadisticasServicios?.length > 0 ? (
                estadisticasServicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className={`p-6 ${
                      servicio.service_active == 0 ? "bg-red-50" : "bg-gray-50"
                    } rounded-xl border-2 hover:shadow-md transition-shadow`}
                    style={{ borderColor: servicio.color }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="text-3xl font-bold"
                        style={{ color: servicio.color }}>
                        {servicio.codigo}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">
                          {servicio.nombre}
                        </h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {servicio.total_tickets || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {servicio.atendidos || 0}
                        </div>
                        <div className="text-xs text-gray-600">Atendidos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {servicio.no_presentados || 0}
                        </div>
                        <div className="text-xs text-gray-600">No Present.</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round(servicio.tiempo_promedio_servicio || 0)}{" "}
                          min
                        </div>
                        <div className="text-xs text-gray-600">
                          Tiempo Promedio de atención
                        </div>
                      </div>
                    </div>
                    {servicio.service_active == 0 && (
                      <div className="flex-1 text-red-600 font-bold">
                        No activo
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos de servicios en este período</p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN GENERAL */}
          {resumenGeneral && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mt-8">
              <span>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Resumen General Total{" "}
                  <span className="italic font-normal text-base">
                    {"(Los filtros no aplican para este resumen)"}
                  </span>
                </h3>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br animate-pulse from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      Total Tickets
                    </h3>
                    <TrendingUp className="w-6 h-6 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {resumenGeneral.total_tickets || 0}
                  </div>
                  <p className="text-sm opacity-75">Tickets procesados</p>
                </div>

                <div style={{animationDelay:'200ms'}} className="bg-gradient-to-br animate-pulse from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      Atendidos
                    </h3>
                    <TrendingUp className="w-6 h-6 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {resumenGeneral.atendidos || 0}
                  </div>
                  <p className="text-sm opacity-75">
                    {resumenGeneral.total_tickets > 0
                      ? `${Math.round(
                          (resumenGeneral.atendidos /
                            resumenGeneral.total_tickets) *
                            100,
                        )}% del total`
                      : "0% del total"}
                  </p>
                </div>

                <div style={{animationDelay:'400ms'}} className="bg-gradient-to-br animate-pulse from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      Tiempo de Atención
                    </h3>
                    <Clock className="w-6 h-6 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {Math.round(resumenGeneral.tiempo_promedio_servicio || 0)}
                    <span className="text-xl m-4">(min)</span>
                  </div>
                  <p className="text-sm opacity-75">
                    Tiempo de atención aproximado
                  </p>
                </div>

                <div style={{animationDelay:'600ms'}} className="bg-gradient-to-br animate-pulse from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      Tiempo de Espera
                    </h3>
                    <Clock className="w-8 h-8 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {Math.round(resumenGeneral.tiempo_promedio_espera || 0)}
                    <span className="text-xl m-4">(min)</span>
                  </div>
                  <p className="text-sm opacity-75">
                    Promedio de espera aproximado
                  </p>
                </div>

                <div style={{animationDelay:'800ms'}} className="bg-gradient-to-br animate-pulse from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      No Atendido
                    </h3>
                    <X className="w-8 h-8 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {resumenGeneral.no_presentados || 0}
                  </div>
                  <p className="text-sm opacity-75">
                    {resumenGeneral.total_tickets > 0
                      ? `${Math.round(
                          (resumenGeneral.no_presentados /
                            resumenGeneral.total_tickets) *
                            100,
                        )}% del total`
                      : "0% del total"}
                  </p>
                </div>

                <div style={{animationDelay:'1000ms'}} className="bg-gradient-to-br animate-pulse from-cyan-500 to-cyan-600 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">
                      Transferidos
                    </h3>
                    <ArrowRightLeftIcon className="w-8 h-8 opacity-75" />
                  </div>
                  <div className="text-4xl font-bold mb-1 justify-self-auto">
                    {resumenGeneral.transferido || 0}
                  </div>
                  <p className="text-sm opacity-75">
                    {resumenGeneral.total_tickets > 0
                      ? `${Math.round(
                          (resumenGeneral.transferido /
                            resumenGeneral.total_tickets) *
                            100,
                        )}% del total`
                      : "0% del total"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EstadisticasSection;
