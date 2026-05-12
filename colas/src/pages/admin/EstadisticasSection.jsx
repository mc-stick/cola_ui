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
  BarChart2Icon,
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
    const dataLimpia = datos?.map((item) => ({
      ...item,
      // Convertimos a número y unificamos nombres de claves
      total_tickets: Number(item.total_tickets),
      atendidos: Number(item.atendidos),
      en_espera: Number(item.en_espera),
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
      className={`bg-gradient-to-br ${color} p-3 rounded-lg text-white shadow-md transform hover:-translate-y-0.5 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold opacity-80 uppercase tracking-wider">
          {title}
        </h3>
        <div className="p-1 bg-white/20 rounded-md text-xs">{icon}</div>
      </div>
      <div className="text-2xl font-black">
        {value}
        {unit && <span className="text-sm ml-1 opacity-80">{unit}</span>}
      </div>
      {percentage !== undefined && (
        <p className="text-8px mt-1 font-medium opacity-90 bg-black/10 w-fit px-1.5 py-0.5 rounded-full">
          {percentage}% del volumen total
        </p>
      )}
    </div>
  );

  const Stat = ({ label, value, color, Mini }) => (
    <div className="text-center px-1 gap-4 ml-4">
      <div className={`font-black ${Mini ? "text-sm" : "text-base"} ${color}`}>
        {value || 0}
      </div>
      <div className="text-xs  font-bold text-gray-500 tracking-tighter">
        {label}
      </div>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <BarChartHorizontalBig className="w-8 h-8 mb-2 opacity-20" />
      <p className="text-xs italic">{message}</p>
    </div>
  );

  console.log(resumenGeneral, "estadisticas");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4  relative overflow-hidden">
        {/* Línea decorativa superior */}
        

        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <BarChart2Icon className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
               <span className="text-[#1e2a4f]">Estadísticas</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Panel de estadísticas
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Panel Lateral de Filtros */}
          <div className="space-y-3">
            

            <div className="bg-gray-50 rounded-2xl p-3 mt-3 border border-dashed border-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="font-bold uppercase tracking-wider text-xs opacity-70">
                  Filtros de Reporte
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-9px font-black uppercase mb-1 block opacity-60">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="text-9px font-black uppercase mb-1 block opacity-60">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                  />
                </div>

                <button
                  onClick={cargarEstadisticas}
                  disabled={LoadingSpin}
                  className={`w-full flex items-center justify-center gap-2 text-white py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 text-xs
                    ${LoadingSpin ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                  <TrendingUp className="w-3 h-3" />
                  {LoadingSpin ? "CARGANDO..." : "ACTUALIZAR VISTA"}
                </button>
              </div>
            </div>
          </div>

          {/* Contenido Principal (Gráficas) */}
         <div className="lg:col-span-2 h-[500px] overflow-y-auto pr-1 custom-scrollbar">
  {LoadingSpin ? (
    <CardLoader />
  ) : (
    <div className="space-y-2">
      {/* Gráficas */}
      <div className="grid grid-cols-1 gap-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2.5">
          <h3 className="font-black mb-1.5 text-[10px] uppercase tracking-wide text-slate-600">
            Tickets por Servicio
          </h3>

          <div className="h-[170px] w-full">
            {estadisticasServicios?.length > 0 &&
            (estadisticasServicios[0].atendidos > 0 ||
              estadisticasServicios[0].no_presentados > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadisticasServicios}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="nombre"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="atendidos"
                    fill="#10B981"
                    radius={[3, 3, 0, 0]}
                  />

                  <Bar
                    dataKey="no_presentados"
                    fill="#ef4444"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No hay datos de servicios" />
            )}
          </div>
        </div>
      </div>

      {/* Rendimiento */}
      <section className="pb-1">
        <h3 className="text-[11px] font-black uppercase tracking-wide mb-1.5 text-slate-700">
          Rendimiento por Operador
        </h3>

        <div className="space-y-1">
          {estadisticasOperadores?.length > 0 ? (
            estadisticasOperadores.map((operador) => (
              <div
                key={operador.id}
                className="group flex flex-wrap items-center justify-between p-2 bg-gray-50 rounded-lg border border-transparent hover:border-blue-100 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-blue-600 w-6 h-6 rounded-md flex items-center justify-center shadow shrink-0">
                    <span className="text-white font-black text-[9px]">
                      {operador.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-[10px] uppercase truncate">
                      {operador.nombre}
                    </h4>

                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">
                      Puesto:
                      <span className="text-blue-600 ml-1">
                        {operador.puesto_numero || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 items-center mt-1 lg:mt-0">
                  <AnimatedRating
                    value={operador.promedio_evaluacion || 0}
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
                  /><Stat
                    Mini
                    label="Total"
                    value={operador.total_tickets}
                    color="text-blue-600"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Users className="w-6 h-6 mx-auto mb-1 text-gray-300" />

              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                No se encontraron operadores
              </p>
            </div>
          )}
        </div>
      </section>

      {/* KPIs */}
      {resumenGeneral && (
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
          <KPICard
            title="Total"
            value={resumenGeneral.total_tickets || 0}
            icon={<TrendingUp />}
            color="from-blue-500 to-blue-700"
            compact
          />

          <KPICard
            title="Atendidos"
            value={resumenGeneral.atendidos || 0}
            icon={<CheckCircle />}
            color="from-green-500 to-green-700"
            compact
          />

          <KPICard
            title="En Espera"
            value={resumenGeneral.en_espera || 0}
            icon={<CheckCircle />}
            color="from-amber-300 to-amber-900"
            compact
          />

          <KPICard
            title="T. Atención"
            value={Math.round(
              resumenGeneral.tiempo_promedio_servicio /
                resumenGeneral.total_tickets || 0
            )}
            unit="Min"
            icon={<Clock />}
            color="from-yellow-500 to-orange-600"
            compact
          />

          <KPICard
            title="No Atendidos"
            value={resumenGeneral.no_presentados || 0}
            icon={<X />}
            color="from-red-500 to-red-700"
            compact
          />

          <KPICard
            title="Transferidos"
            value={resumenGeneral.tickets_transferidos || 0}
            icon={<ArrowRightLeft />}
            color="from-cyan-500 to-blue-600"
            compact
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
