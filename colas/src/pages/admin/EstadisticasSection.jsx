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
  Filter,
  CheckCircle,
  ArrowRightLeft,
} from "lucide-react";
import { CardLoader } from "../../components/loading";
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
import api from "../../services/api";

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
    const dataLimpia = datos?.map(item => ({
  ...item,
  // Convertimos a número y unificamos nombres de claves
  total_tickets: Number(item.total_tickets),
  atendidos: Number(item.atendidos),
  en_espera: Number(item.en_espera),
  total_tickets: Number(item.total_tickets)
}));
    const dataop = await api.getEstadisticasOperadores(fechaInicio, fechaFin);
    const dataser = await api.getEstadisticasServicios(fechaInicio, fechaFin);
    console.log(dataop, "data estadistiopca");
    if (datos) {
      setEstadisticasRango(dataLimpia || []);
      setEstadisticasServicios(dataser || []);
      setEstadisticasOperadores(dataop || []);
      setEstadisticasHoras(datos.horas || []);
      setResumenGeneral(datos[0] || null);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // --- Componentes Auxiliares para Limpieza Visual ---
  const KPICard = ({ title, value, icon, color, unit = "", percentage }) => (
    <div
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-xl transform hover:-translate-y-1 transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold opacity-80 uppercase tracking-wider">
          {title}
        </h3>
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-black">
        {value}
        {unit && <span className="text-lg ml-1 opacity-80">{unit}</span>}
      </div>
      {percentage !== undefined && (
        <p className="text-xs mt-2 font-medium opacity-90 bg-black/10 w-fit px-2 py-0.5 rounded-full">
          {percentage}% del volumen total
        </p>
      )}
    </div>
  );

  const Stat = ({ label, value, color, Mini }) => (
    <div className="text-center px-2">
      <div className={`font-black ${Mini ? "text-xl" : "text-2xl"} ${color}`}>
        {value || 0}
      </div>
      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">
        {label}
      </div>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <BarChartHorizontalBig className="w-12 h-12 mb-2 opacity-20" />
      <p className="text-sm italic">{message}</p>
    </div>
  );

console.log(resumenGeneral, 'estadisticas')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 relative overflow-hidden">
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 w-full h-3 bg-orange-500"></div>

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase text-gray-800">
              Estadísticas de Atención
            </h2>
            <p className="text-lg font-medium opacity-50 uppercase tracking-widest">
              Análisis de rendimiento y flujo de turnos
            </p>
          </div>
          <BarChartHorizontalBig className="w-20 h-20 opacity-10 text-orange-600 -rotate-12" />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Panel Lateral de Filtros */}
          <div className="space-y-6">
            <div className="h-2 w-24 rounded-full bg-orange-400"></div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-dashed border-gray-300">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="font-bold uppercase tracking-wider text-sm opacity-70">
                  Filtros de Reporte
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase mb-1 block opacity-60">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                <button
                  onClick={cargarEstadisticas}
                  disabled={LoadingSpin}
                  className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95
                    ${LoadingSpin ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {LoadingSpin ? "CARGANDO..." : "ACTUALIZAR VISTA"}
                </button>
              </div>
            </div>
          </div>

          {/* Contenido Principal (Gráficas) */}
          <div className="lg:col-span-2 h-[550px] overflow-y-auto pr-4 custom-scrollbar">
            {LoadingSpin ? (
              <CardLoader />
            ) : (
              <div className="space-y-8">
                {/* Gráficas Principales */}
                <div className="grid grid-cols-1 gap-6">
                  {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold mb-4">Tickets por Día</h3>
                    <div className="h-[300px] w-full">
                      {estadisticasRango?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={estadisticasRango}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="total_tickets"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "#6b7280" }}
                            />
                            <Tooltip />
                            <Legend iconType="circle" />
                            <Line
                              type="monotone"
                              dataKey="total_tickets"
                              stroke="#3B82F6"
                              strokeWidth={3}
                            />
                            <Line
                              type="monotone"
                              dataKey="atendidos"
                              stroke="#10B981"
                              strokeWidth={3}
                            />
                            <Line
                              type="monotone"
                              dataKey="no_presentados"
                              stroke="#EF4444"
                              strokeWidth={3}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState message="No hay datos para este período" />
                      )}
                    </div>
                  </div> */}

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold mb-4">Tickets por Servicio</h3>
                    <div className="h-[300px] w-full">
                      {estadisticasServicios?.length > 0 && (estadisticasServicios[0].atendidos > 0 || estadisticasServicios[0].no_presentados > 0)  ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={estadisticasServicios}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="nombre"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar
                              dataKey="atendidos"
                              fill="#10B981"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="no_presentados"
                              fill="#ff0000"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState message="No hay datos de servicios" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Rendimiento por Operador */}
                <section className="pb-8">
                  <h3 className="text-xl font-bold mb-4">
                    Rendimiento por Operador
                  </h3>
                  <div className="space-y-3">
                    {/* Aquí el mapeo de operadores se verá afectado por el scroll del padre */}
                    {estadisticasOperadores?.length > 0 ? (
                      estadisticasOperadores.map((operador) => (
                        <div
                          key={operador.id}
                          className="group flex flex-wrap items-center justify-between p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all"
                        >
                          <div className="flex items-center gap-5">
                            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                              <span className="text-white font-bold text-xl">
                                {operador.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                                {operador.nombre}
                              </h4>
                              <p className="text-sm text-gray-500 font-medium">
                                Puesto:{" "}
                                <span className="text-blue-600">
                                  {operador.puesto_numero || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-8 items-center mt-4 lg:mt-0">
                            <AnimatedRating
                              value={operador.promedio_evaluacion || 0}
                            />
                            <Stat
                              Mini
                              label="Total"
                              value={operador.total_tickets}
                              color="text-blue-600"
                            />
                            <Stat
                              Mini
                              label="Atendidos"
                              value={operador.atendidos}
                              color="text-green-600"
                            />
                            <Stat
                              Mini
                              label="No Atendidos"
                              value={
                                operador.total_tickets - operador.atendidos
                              }
                              color="text-red-600"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">
                          No se encontraron operadores
                        </p>
                      </div>
                    )}
                  </div>
                </section>
                {/* Resumen General (KPIs) */}
                {resumenGeneral && (
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <KPICard
                      title="Total"
                      value={resumenGeneral.total_tickets || 0}
                      icon={<TrendingUp />}
                      color="from-blue-500 to-blue-700"
                    />
                    <KPICard
                      title="Atendidos"
                      value={resumenGeneral.atendidos || 0}
                      icon={<CheckCircle />}
                      color="from-green-500 to-green-700"
                    />
                    <KPICard
                      title="En Espera"
                      value={resumenGeneral.en_espera || 0}
                      icon={<CheckCircle />}
                      color="from-amber-300 to-amber-900"
                    />
                    <KPICard
                      title="T. Atención"
                      value={Math.round(
                        resumenGeneral.tiempo_promedio_servicio /
                          resumenGeneral.total_tickets || 0,
                      )}
                      unit="Min Aprox."
                      icon={<Clock />}
                      color="from-yellow-500 to-orange-600"
                    />
                    <KPICard
                      title="No Atendidos"
                      value={resumenGeneral.no_presentados || 0}
                      icon={<X />}
                      color="from-red-500 to-red-700"
                    />
                    <KPICard
                      title="Transferidos"
                      value={resumenGeneral.tickets_transferidos || 0}
                      icon={<ArrowRightLeft />}
                      color="from-cyan-500 to-blue-600"
                    />
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasSection;
