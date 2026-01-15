import { useState, useEffect } from "react";
import API from "../services/api";
import {
  Settings,
  Briefcase,
  MapPin,
  Users,
  Image,
  History,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building2,
  UserCog,
  ImageIcon,
  Filter,
  Search,
  CheckCircle,
  PhoneCall,
  Clock,
  TrendingUp,
  Calendar,
  XCircle,
  AlertCircle,
  User,
  File,
  FileSpreadsheet,
  Check,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PantallaAdmin() {
  const [seccion, setSeccion] = useState("configuracion");
  const [servicios, setServicios] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [medios, setMedios] = useState([]);
  // const [estadisticas, setEstadisticas] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [operadoresServicios, setOperadoresServicios] = useState([]);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  const [serviciosOperador, setServiciosOperador] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});

  const [estadisticas, setEstadisticas] = useState(null);
  const [estadisticasRango, setEstadisticasRango] = useState([]);
  const [estadisticasServicios, setEstadisticasServicios] = useState([]);
  const [estadisticasOperadores, setEstadisticasOperadores] = useState([]);
  const [estadisticasHoras, setEstadisticasHoras] = useState([]);
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [historial, setHistorial] = useState([]);
  const [filtrosHistorial, setFiltrosHistorial] = useState({
    fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    fecha_fin: new Date().toISOString().split("T")[0],
    servicio_id: "",
    estado: "",
    busqueda: "",
  });

  useEffect(() => {
    cargarDatos();
    console.log(fechaInicio, fechaFin);
  }, [seccion]);

  const cargarDatos = async () => {
    try {
      switch (seccion) {
        case "configuracion":
          const config = await API.getConfiguracion();
          setConfiguracion(config);
          break;
        case "servicios":
          setServicios(await API.getServicios());
          break;
        case "puestos":
          setPuestos(await API.getPuestos());
          break;
        case "usuarios":
          setUsuarios(await API.getUsuarios());
          const puestosData = await API.getPuestos();
          setPuestos(puestosData);
          break;
        case "medios":
          setMedios(await API.getMedios());
          break;
        case "operadores-servicios":
          const operadores = await API.getOperadoresConServicios();
          setOperadoresServicios(operadores);
          break;
        case "estadisticas":
          await cargarEstadisticasCompletas();
          break;
        case "historial":
          await cargarHistorial();
          break;
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const cargarHistorial = async () => {
    try {
      const params = {
        fecha_inicio: filtrosHistorial.fecha_inicio,
        fecha_fin: filtrosHistorial.fecha_fin,
      };

      if (filtrosHistorial.servicio_id) {
        params.servicio_id = filtrosHistorial.servicio_id;
      }

      if (filtrosHistorial.estado) {
        params.estado = filtrosHistorial.estado;
      }

      const data = await API.getHistorial(params);

      // Filtrar por búsqueda local
      let dataFiltrada = data;
      if (filtrosHistorial.busqueda) {
        const busqueda = filtrosHistorial.busqueda.toLowerCase();
        dataFiltrada = data.filter(
          (ticket) =>
            ticket.numero?.toLowerCase().includes(busqueda) ||
            ticket.identificacion?.toLowerCase().includes(busqueda) ||
            ticket.operador_nombre?.toLowerCase().includes(busqueda)
        );
      }
      setServicios(await API.getServicios());

      //setHistorial(dataFiltrada);

      const historialFiltrado = Object.values(
        dataFiltrada.reduce((acc, item) => {
          if (!acc[item.ticket_id]) {
            acc[item.ticket_id] = item;
          }
          return acc;
        }, {})
      ).reverse();

      setHistorial(historialFiltrado);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      atendido: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Atendido",
      },
      no_presentado: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "No Atendido",
      },
      espera: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "En Espera",
      },
      llamado: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: PhoneCall,
        label: "Llamado",
      },
      en_atencion: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: AlertCircle,
        label: "En Atención",
      },
      cancelado: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: XCircle,
        label: "Cancelado",
      },
    };

    return estados[estado] || estados.espera;
  };

  const formatearTiempo = (minutos) => {
    if (!minutos || minutos < 0) return "N/A";

    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }

    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  const cargarEstadisticasCompletas = async () => {
    try {
      const [rango, servicios, operadores, horas, resumen] = await Promise.all([
        API.getEstadisticasRango(fechaInicio, fechaFin),
        API.getEstadisticasServicios(fechaInicio, fechaFin),
        API.getEstadisticasOperadores(fechaInicio, fechaFin),
        API.getEstadisticasHoras(fechaFin),
        API.getEstadisticasResumen(fechaInicio, fechaFin),
      ]);

      setEstadisticasRango(rango);
      setEstadisticasServicios(servicios);
      setEstadisticasOperadores(operadores);
      setEstadisticasHoras(horas);
      setResumenGeneral(resumen);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  const handleGuardarConfiguracion = async () => {
    try {
      await API.updateConfiguracion(configuracion.id, configuracion);
      alert("Configuración guardada correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    }
  };

  const handleSeleccionarOperador = async (operador) => {
    setOperadorSeleccionado(operador);
    try {
      const servicios = await API.getOperadorServicios(operador.id);
      setServiciosOperador(servicios);
    } catch (error) {
      console.error("Error cargando servicios del operador:", error);
    }
  };

  const handleToggleServicio = async (servicio) => {
    if (!operadorSeleccionado) return;

    try {
      if (servicio.asignado) {
        await API.desasignarServicioOperador(
          operadorSeleccionado.id,
          servicio.id
        );
      } else {
        await API.asignarServicioOperador(operadorSeleccionado.id, servicio.id);
      }

      const servicios = await API.getOperadorServicios(operadorSeleccionado.id);
      setServiciosOperador(servicios);

      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      alert("Error al actualizar servicio");
    }
  };

  const handleCrearServicio = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      descripcion: "",
      codigo: "",
      color: "#1E40AF",
      tiempo_promedio: 15,
    });
  };

  const handleGuardarServicio = async () => {
    try {
      if (editando === "nuevo") {
        await API.createServicio(formulario);
      } else {
        await API.updateServicio(editando, formulario);
      }
      setEditando(null);
      setFormulario({});
      cargarDatos();
    } catch (error) {
      console.error("Error guardando servicio:", error);
      alert("Error al guardar el servicio");
    }
  };

  const handleEliminarServicio = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;
    try {
      await API.deleteServicio(id);
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando servicio:", error);
    }
  };

  const handleSwitchServicio = async (id) => {
    try {
      await API.switchServicio(id);
      cargarDatos();
    } catch (error) {
      console.error("Error activar/desactivar servicio:", error);
    }
  };

  const handleCrearPuesto = () => {
    setEditando("nuevo");
    setFormulario({
      numero: "",
      nombre: "",
    });
  };

  const handleGuardarPuesto = async () => {
    try {
      if (editando === "nuevo") {
        await API.createPuesto(formulario);
      } else {
        await API.updatePuesto(editando, formulario);
      }
      setEditando(null);
      setFormulario({});
      cargarDatos();
    } catch (error) {
      console.error("Error guardando puesto:", error);
      alert("Error al guardar el puesto");
    }
  };

  const handleCrearUsuario = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      username: "",
      password: "",
      rol: "operador",
      puesto_id: "",
    });
  };

  const handleGuardarUsuario = async () => {
    try {
      if (editando === "nuevo") {
        await API.createUsuario(formulario);
      } else {
        await API.updateUsuario(editando, formulario);
      }
      setEditando(null);
      setFormulario({});
      cargarDatos();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      alert("Error al guardar el usuario");
    }
  };

  const handleCrearMedio = () => {
    setEditando("nuevo");
    setFormulario({
      tipo: "imagen",
      url: "",
      nombre: "",
      orden: 0,
      metodo: "archivo",
    });
  };

  const handleGuardarMedio = async () => {
    try {
      if (!formulario.url || !formulario.nombre) {
        alert("Por favor completa todos los campos");
        return;
      }

      const isBase64 = formulario.url.startsWith("data:");
      const tamanoKb = Math.round(formulario.url.length / 1024);

      const medioData = {
        tipo: formulario.tipo,
        url: formulario.url,
        nombre: formulario.nombre,
        orden: formulario.orden || 0,
        es_local: isBase64,
        tamano_kb: tamanoKb,
      };
      await API.createMedio(medioData);
      alert("Medio guardado correctamente");

      setEditando(null);
      setFormulario({});
      cargarDatos();
    } catch (error) {
      console.error("Error guardando medio:", error);
      alert("Error: " + error.message);
    }
  };

  const handleEliminarMedio = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este medio?")) return;
    try {
      await API.deleteMedio(id);
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando medio:", error);
    }
  };

  const MenuLateral = () => (
    <div className="w-64 bg-white shadow-lg rounded-2xl p-6 h-fit sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-blue-600" />
        Admin Panel
      </h2>
      <nav className="space-y-2">
        {[
          { id: "configuracion", icon: Building2, label: "Configuración" },
          { id: "servicios", icon: Briefcase, label: "Servicios" },
          { id: "puestos", icon: MapPin, label: "Puestos" },
          { id: "usuarios", icon: Users, label: "Usuarios" },
          {
            id: "operadores-servicios",
            icon: UserCog,
            label: "Asignar Servicios",
          },
          { id: "medios", icon: Image, label: "Medios" },
          { id: "historial", icon: History, label: "Historial" },
          { id: "estadisticas", icon: BarChart3, label: "Estadísticas" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSeccion(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                seccion === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Settings className="w-10 h-10" />
            Panel de Administración
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-8">
          <MenuLateral />

          <div className="flex-1">
            {/* SECCIÓN CONFIGURACIÓN */}
            {seccion === "configuracion" && configuracion && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Configuración General
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={configuracion.nombre_empresa || ""}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          nombre_empresa: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg"
                      placeholder="MI EMPRESA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL del Logo
                    </label>
                    <input
                      type="url"
                      value={configuracion.logo_url || ""}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          logo_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      placeholder="https://ejemplo.com/logo.png o /logo.png"
                    />
                    {configuracion.logo_url && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Vista previa:
                        </p>
                        <img
                          src={configuracion.logo_url}
                          alt="Logo preview"
                          className="w-24 h-24 object-contain bg-white rounded-lg p-2 border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                        <p
                          className="text-red-600 text-sm mt-2"
                          style={{ display: "none" }}>
                          No se pudo cargar la imagen
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiempo de Rotación de Medios (milisegundos)
                    </label>
                    <input
                      type="number"
                      value={configuracion.tiempo_rotacion || 5000}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          tiempo_rotacion: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      min="1000"
                      step="1000"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Recomendado: 5000ms (5 segundos)
                    </p>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Opciones de Visualización
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="mostrar_imagenes"
                          checked={configuracion.mostrar_imagenes || false}
                          onChange={(e) =>
                            setConfiguracion({
                              ...configuracion,
                              mostrar_imagenes: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                        />
                        <label
                          htmlFor="mostrar_imagenes"
                          className="text-gray-700 font-semibold cursor-pointer">
                          Mostrar imágenes en pantalla de anuncios
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="mostrar_videos"
                          checked={configuracion.mostrar_videos || false}
                          onChange={(e) =>
                            setConfiguracion({
                              ...configuracion,
                              mostrar_videos: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                        />
                        <label
                          htmlFor="mostrar_videos"
                          className="text-gray-700 font-semibold cursor-pointer">
                          Mostrar videos en pantalla de anuncios
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button
                      onClick={handleGuardarConfiguracion}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                      <Save className="w-6 h-6" />
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN SERVICIOS */}
            {seccion === "servicios" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Servicios
                  </h2>
                  <button
                    onClick={handleCrearServicio}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Plus className="w-5 h-5" />
                    Nuevo Servicio
                  </button>
                </div>

                {editando && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-4">
                      {editando === "nuevo"
                        ? "Crear Servicio"
                        : "Editar Servicio"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={formulario.nombre || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              nombre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Código
                        </label>
                        <input
                          type="text"
                          value={formulario.codigo || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              codigo: e.target.value,
                            })
                          }
                          disabled={editando !== "nuevo"}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Color
                        </label>
                        <input
                          type="color"
                          value={formulario.color || "#1E40AF"}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              color: e.target.value,
                            })
                          }
                          className="w-full h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tiempo Promedio (min)
                        </label>
                        <input
                          type="number"
                          value={formulario.tiempo_promedio || 15}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              tiempo_promedio: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formulario.descripcion || ""}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            descripcion: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGuardarServicio}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <X className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-l-4"
                      style={{ borderLeftColor: servicio.color }}>
                      <div className="flex items-center gap-4">
                        <div
                          className="text-3xl font-bold"
                          style={{ color: servicio.color }}>
                          {servicio.codigo}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {servicio.nombre}
                          </h3>
                          <p className="text-gray-600">
                            {servicio.descripcion}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tiempo promedio: {servicio.tiempo_promedio} min
                          </p>
                        </div>
                        <span
                          class={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                            servicio.service_active
                              ? " bg-green-600 "
                              : "bg-red-600"
                          }`}>
                          {servicio.service_active ? "Activo" : "Desactivado"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSwitchServicio(servicio.id)}
                          className={`p-2 ${
                            servicio.service_active
                              ? " bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } text-white rounded-lg transition-colors`}>
                          {servicio.service_active ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditando(servicio.id);
                            setFormulario(servicio);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminarServicio(servicio.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN PUESTOS */}
            {seccion === "puestos" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Puestos</h2>
                  <button
                    onClick={handleCrearPuesto}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Plus className="w-5 h-5" />
                    Nuevo Puesto
                  </button>
                </div>

                {editando && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-4">
                      {editando === "nuevo" ? "Crear Puesto" : "Editar Puesto"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Número
                        </label>
                        <input
                          type="text"
                          value={formulario.numero || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              numero: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={formulario.nombre || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              nombre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGuardarPuesto}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <X className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {puestos.map((puesto) => (
                    <div
                      key={puesto.id}
                      className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {puesto.numero}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {puesto.nombre}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setEditando(puesto.id);
                            setFormulario(puesto);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN USUARIOS */}
            {seccion === "usuarios" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Usuarios</h2>
                  <button
                    onClick={handleCrearUsuario}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                  </button>
                </div>

                {editando && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-4">
                      {editando === "nuevo"
                        ? "Crear Usuario"
                        : "Editar Usuario"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={formulario.nombre || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              nombre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Usuario
                        </label>
                        <input
                          type="text"
                          value={formulario.username || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              username: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          value={formulario.password || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          placeholder={
                            editando !== "nuevo"
                              ? "(dejar vacío para no cambiar)"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rol
                        </label>
                        <select
                          value={formulario.rol || "operador"}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              rol: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                          <option value="admin">Administrador</option>
                          <option value="operador">Operador</option>
                        </select>
                      </div>
                      {formulario.rol === "operador" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Puesto Asignado
                          </label>
                          <select
                            value={formulario.puesto_id || ""}
                            onChange={(e) =>
                              setFormulario({
                                ...formulario,
                                puesto_id: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                            <option value="">Sin puesto</option>
                            {puestos.map((puesto) => (
                              <option key={puesto.id} value={puesto.id}>
                                {puesto.numero} - {puesto.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGuardarUsuario}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <X className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {usuario.nombre}
                        </h3>
                        <p className="text-gray-600">
                          Usuario: {usuario.username}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              usuario.rol === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                            {usuario.rol === "admin"
                              ? "Administrador"
                              : "Operador"}
                          </span>
                          {usuario.puesto_numero && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                              Puesto: {usuario.puesto_numero}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditando(usuario.id);
                          setFormulario({ ...usuario, password: "" });
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN OPERADORES-SERVICIOS */}
            {seccion === "operadores-servicios" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <UserCog className="w-8 h-8 text-blue-600" />
                  Asignación de Servicios a Operadores
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Lista de Operadores */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Operadores
                    </h3>
                    <div className="space-y-3">
                      {operadoresServicios.map((operador) => (
                        <div
                          key={operador.id}
                          onClick={() => handleSeleccionarOperador(operador)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            operadorSeleccionado?.id === operador.id
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4
                                className={`font-bold ${
                                  operadorSeleccionado?.id === operador.id
                                    ? "text-white"
                                    : "text-gray-800"
                                }`}>
                                {operador.nombre}
                              </h4>
                              {/* <p
                                className={`text-sm ${
                                  operadorSeleccionado?.id === operador.id
                                    ? "text-blue-100"
                                    : "text-gray-600"
                                }`}>
                                {operador.username}
                              </p> */}
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

                          {operador.servicios &&
                            operador.servicios.length > 0 && (
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
                                            backgroundColor:
                                              servicio.color + "20",
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

                      {operadoresServicios.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No hay operadores registrados</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Servicios Disponibles */}
                  <div className="lg:col-span-2">
                    {operadorSeleccionado ? (
                      <>
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-800">
                            Servicios para: {operadorSeleccionado.nombre}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Selecciona los servicios que este operador puede
                            atender
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 rounded-xl border-blue-200 p-3">
                          {serviciosOperador.map((servicio) => (
                            <div
                              key={servicio.id}
                              onClick={() => handleToggleServicio(servicio)}
                              className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
                                servicio.asignado
                                  ?  servicio.service_active ? "border-green-500 bg-green-50 shadow-md" :"border-gray-500 bg-gray-50 shadow-md"
                                  : "border-red-200 bg-red-50 hover:border-gray-300"
                              }`}>
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 pt-1">
                                  <div
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                      servicio.asignado
                                        ? servicio.service_active ? "bg-green-500 border-green-500" :"bg-gray-500 border-gray-500"
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
                                  <p className="text-sm text-gray-600">
                                    {servicio.descripcion}
                                  </p>
                                  {!servicio.service_active && (
                                    <p className="text-ls text-red-500 font-bold mt-2">
                                       Servicio inhabilitado.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {serviciosOperador.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">
                              No hay servicios disponibles
                            </p>
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
                </div>
              </div>
            )}

            {/* SECCIÓN MEDIOS */}
            {seccion === "medios" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Medios (Imágenes/Videos)
                  </h2>
                  <button
                    onClick={handleCrearMedio}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Plus className="w-5 h-5" />
                    Nuevo Medio
                  </button>
                </div>

                {editando && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-4">Agregar Medio</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo
                        </label>
                        <select
                          value={formulario.tipo || "imagen"}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              tipo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                          <option value="imagen">Imagen</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={formulario.nombre || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              nombre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          placeholder="Nombre descriptivo"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seleccionar Archivo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept={
                            formulario.tipo === "imagen" ? "image/*" : "video/*"
                          }
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const maxSize =
                              formulario.tipo === "imagen"
                                ? 5 * 1024 * 1024
                                : 20 * 1024 * 1024;
                            if (file.size > maxSize) {
                              alert(
                                `El archivo es demasiado grande. Máximo: ${
                                  formulario.tipo === "imagen" ? "5MB" : "20MB"
                                }`
                              );
                              e.target.value = "";
                              return;
                            }

                            const validImageTypes = [
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                              "image/gif",
                              "image/webp",
                            ];
                            const validVideoTypes = [
                              "video/mp4",
                              "video/webm",
                              "video/ogg",
                            ];

                            if (
                              formulario.tipo === "imagen" &&
                              !validImageTypes.includes(file.type)
                            ) {
                              alert(
                                "Tipo de archivo no válido. Solo: JPG, PNG, GIF, WebP"
                              );
                              e.target.value = "";
                              return;
                            }

                            if (
                              formulario.tipo === "video" &&
                              !validVideoTypes.includes(file.type)
                            ) {
                              alert(
                                "Tipo de archivo no válido. Solo: MP4, WebM, OGG"
                              );
                              e.target.value = "";
                              return;
                            }

                            const reader = new FileReader();

                            reader.onload = (event) => {
                              const base64 = event.target.result;

                              if (!base64 || !base64.startsWith("data:")) {
                                alert("Error al procesar el archivo");
                                return;
                              }

                              setFormulario({
                                ...formulario,
                                url: base64,
                                nombre:
                                  formulario.nombre || file.name.split(".")[0],
                              });
                            };
                            reader.onerror = () => {
                              console.error("Error al leer el archivo");
                              alert("Error al leer el archivo");
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-semibold">
                            Click para seleccionar archivo
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {formulario.tipo === "imagen"
                              ? "PNG, JPG, GIF hasta 5MB"
                              : "MP4, WebM hasta 20MB"}
                          </span>
                        </label>
                      </div>

                      {formulario.url && (
                        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Vista previa:
                          </p>
                          {formulario.tipo === "imagen" ? (
                            <img
                              src={formulario.url}
                              alt="Preview"
                              className="max-w-full h-48 object-contain mx-auto rounded-lg"
                            />
                          ) : (
                            <video
                              src={formulario.url}
                              controls
                              className="max-w-full h-48 mx-auto rounded-lg"
                            />
                          )}
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Tamaño: {(formulario.url.length / 1024).toFixed(2)}{" "}
                            KB
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleGuardarMedio}
                        disabled={!formulario.url || !formulario.nombre}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                        <X className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medios.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No hay medios agregados</p>
                      <p className="text-sm mt-2">
                        Haz clic en "Nuevo Medio" para agregar uno
                      </p>
                    </div>
                  ) : (
                    medios.map((medio) => (
                      <div
                        key={medio.id}
                        className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                          {medio.tipo === "imagen" ? (
                            <img
                              src={medio.url}
                              alt={medio.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Error cargando imagen:",
                                  medio.nombre
                                );
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+";
                              }}
                            />
                          ) : (
                            <video
                              src={medio.url}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              onError={(e) => {
                                console.error(
                                  "Error cargando video:",
                                  medio.nombre
                                );
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                            {medio.tipo}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3
                            className="font-bold text-gray-800 truncate"
                            title={medio.nombre}>
                            {medio.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize mb-3">
                            {medio.tipo}{" "}
                            {medio.url.startsWith("data:") && "(Local)"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const modal = window.open(
                                  "",
                                  "_blank",
                                  "width=800,height=600"
                                );
                                if (medio.tipo === "imagen") {
                                  modal.document.write(
                                    `<img src="${medio.url}" style="max-width:100%; height:auto;">`
                                  );
                                } else {
                                  modal.document.write(
                                    `<video src="${medio.url}" controls autoplay style="max-width:100%;"></video>`
                                  );
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                              <ImageIcon className="w-4 h-4" />
                              Ver
                            </button>
                            <button
                              onClick={() => handleEliminarMedio(medio.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {/* SECCIÓN ESTADÍSTICAS - CORREGIDA */}
            {seccion === "estadisticas" && (
              <div className="space-y-6">
                {/* Filtros de Fecha */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
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
                    <button
                      onClick={cargarEstadisticasCompletas}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      <TrendingUp className="w-5 h-5" />
                      Actualizar
                    </button>
                  </div>
                </div>

                {/* Resumen General */}
                {resumenGeneral && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">
                          Total Tickets
                        </h3>
                        <BarChart3 className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="text-4xl font-bold mb-1 justify-self-auto">
                        {resumenGeneral.total_tickets || 0}
                      </div>
                      <p className="text-sm opacity-75">Tickets procesados</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">
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
                                100
                            )}% del total`
                          : "0% del total"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">
                          Tiempo aprox.
                        </h3>
                        <Clock className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="text-4xl font-bold mb-1 justify-self-auto">
                        {Math.round(
                          resumenGeneral.tiempo_promedio_servicio || 0
                        )}
                        <span className="text-xl m-4">(min)</span>
                      </div>
                      <p className="text-sm opacity-75">
                        Tiempo de atención aprox.
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">
                          Tiempo aprox.
                        </h3>
                        <Clock className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="text-4xl font-bold mb-1 justify-self-auto">
                        {Math.round(resumenGeneral.tiempo_promedio_espera || 0)}
                        <span className="text-xl m-4">(min)</span>
                      </div>
                      <p className="text-sm opacity-75">
                        Promedio de espera aprox.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">
                          No Atendido
                        </h3>
                        <X className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="text-4xl font-bold mb-1 justify-self-auto">
                        {resumenGeneral.no_presentados || 0}
                      </div>
                      <p className="text-sm opacity-75">
                        {resumenGeneral.total_tickets > 0
                          ? `${Math.round(
                              (resumenGeneral.no_presentados /
                                resumenGeneral.total_tickets) *
                                100
                            )}% del total`
                          : "0% del total"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gráfica de Tickets por Día */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Tickets por Día
                  </h3>
                  {estadisticasRango && estadisticasRango.length > 0 ? (
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
                          strokeWidth={2}
                          name="Total"
                        />
                        <Line
                          type="monotone"
                          dataKey="atendidos"
                          stroke="#10B981"
                          strokeWidth={2}
                          name="Atendidos"
                        />
                        <Line
                          type="monotone"
                          dataKey="no_presentados"
                          stroke="#EF4444"
                          strokeWidth={2}
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

                {/* Gráficas de Servicios y Operadores */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* Tickets por Servicio */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      Tickets por Servicio
                    </h3>
                    {estadisticasServicios &&
                    estadisticasServicios.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticasServicios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="codigo" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="total_tickets"
                            fill="#3B82F6"
                            name="Total"
                          />
                          <Bar
                            dataKey="atendidos"
                            fill="#10B981"
                            name="Atendidos"
                          />
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

                  {/* Distribución de Estados */}
                  {/* <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      Distribución de Estados
                    </h3>
                    {resumenGeneral && resumenGeneral.total_tickets > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Atendidos",
                                value: resumenGeneral?.atendidos || 0,
                              },
                              {
                                name: "No Presentados",
                                value: resumenGeneral?.no_presentados || 0,
                              },
                              {
                                name: "En Espera",
                                value: resumenGeneral?.en_espera || 0,
                              },
                              {
                                name: "En Proceso",
                                value: resumenGeneral?.en_proceso || 0,
                              },
                            ].filter((item) => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value">
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>No hay datos para mostrar</p>
                      </div>
                    )}
                  </div> */}
                </div>

                {/* Tickets por Hora */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Tickets por Hora del Día ({fechaFin})
                  </h3>
                  {estadisticasHoras && estadisticasHoras.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={estadisticasHoras}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="hora"
                          tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => `Hora: ${value}:00`}
                        />
                        <Legend />
                        <Bar
                          dataKey="total_tickets"
                          fill="#3B82F6"
                          name="Total"
                        />
                        <Bar
                          dataKey="atendidos"
                          fill="#10B981"
                          name="Atendidos"
                        />
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
                    {estadisticasOperadores &&
                    estadisticasOperadores.length > 0 ? (
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
                              <div className="text-xs text-gray-600">
                                Atendidos
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">
                                {Math.round(
                                  operador.tiempo_promedio_servicio || 0
                                )}{" "}
                                min
                              </div>
                              <div className="text-xs text-gray-600">
                                Tiempo Promedio
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
                    {estadisticasServicios &&
                    estadisticasServicios.length > 0 ? (
                      estadisticasServicios.map((servicio) => (
                        <div
                          key={servicio.id}
                          className="p-6 bg-gray-50 rounded-xl border-2 hover:shadow-md transition-shadow"
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
                              <div className="text-xs text-gray-600">
                                Atendidos
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {servicio.no_presentados || 0}
                              </div>
                              <div className="text-xs text-gray-600">
                                No Present.
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">
                                {Math.round(
                                  servicio.tiempo_promedio_servicio || 0
                                )}{" "}
                                min
                              </div>
                              <div className="text-xs text-gray-600">
                                Tiempo Promedio
                              </div>
                            </div>
                          </div>
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
              </div>
            )}

            {seccion === "historial" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <History className="w-8 h-8 text-purple-600" />
                  Historial de Tickets
                </h2>

                {/* Filtros */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Fecha Inicio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={filtrosHistorial.fecha_inicio}
                        onChange={(e) =>
                          setFiltrosHistorial({
                            ...filtrosHistorial,
                            fecha_inicio: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Fecha Fin */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={filtrosHistorial.fecha_fin}
                        onChange={(e) =>
                          setFiltrosHistorial({
                            ...filtrosHistorial,
                            fecha_fin: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Servicio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Servicio
                      </label>
                      <select
                        value={filtrosHistorial.servicio_id}
                        onChange={(e) =>
                          setFiltrosHistorial({
                            ...filtrosHistorial,
                            servicio_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                        <option value="">Todos</option>
                        {servicios.map((servicio) => (
                          <option key={servicio.id} value={servicio.id}>
                            {servicio.codigo} - {servicio.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={filtrosHistorial.estado}
                        onChange={(e) =>
                          setFiltrosHistorial({
                            ...filtrosHistorial,
                            estado: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                        <option value="">Todos</option>
                        <option value="atendido">Atendido</option>
                        <option value="no_presentado">No Atendido</option>
                        <option value="en_atencion">En Atención</option>
                        <option value="llamado">Llamado</option>
                        <option value="espera">En Espera</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* Buscar */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Buscar
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={filtrosHistorial.busqueda}
                          onChange={(e) =>
                            setFiltrosHistorial({
                              ...filtrosHistorial,
                              busqueda: e.target.value,
                            })
                          }
                          placeholder="Ticket, ID, Operador..."
                          className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={cargarHistorial}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      <Search className="w-5 h-5" />
                      Buscar
                    </button>
                    <button
                      onClick={() => {
                        setFiltrosHistorial({
                          fecha_inicio: new Date(
                            Date.now() - 7 * 24 * 60 * 60 * 1000
                          )
                            .toISOString()
                            .split("T")[0],
                          fecha_fin: new Date().toISOString().split("T")[0],
                          servicio_id: "",
                          estado: "",
                          busqueda: "",
                        });
                      }}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      <X className="w-5 h-5" />
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Contador */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">
                    Mostrando{" "}
                    <span className="font-bold text-gray-800">
                      {historial.length}
                    </span>{" "}
                    tickets
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const csv = [
                          [
                            "Número",
                            "Servicio",
                            "Estado",
                            "Operador",
                            "Puesto",
                            "ID Cliente",
                            "Tiempo Total",
                            "Fecha Creación",
                            "Fecha Atención",
                          ].join(","),
                          ...historial.map((t) =>
                            [
                              t.numero,
                              t.servicio_nombre,
                              getEstadoBadge(t.accion).label,
                              t.operador_nombre || "N/A",
                              t.puesto_numero || "N/A",
                              t.identificacion || "N/A",
                              formatearTiempo(t.tiempo_total_minutos),
                              new Date(t.created_at).toLocaleString("es-ES"),
                              t.atendido_at
                                ? new Date(t.atendido_at).toLocaleString(
                                    "es-ES"
                                  )
                                : "N/A",
                            ].join(",")
                          ),
                        ].join("\n");

                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `historial-${Date.now()}.csv`;
                        a.click();
                      }}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                      <FileSpreadsheet className="text-green-200" /> Exportar
                      CSV
                    </button>
                  </div>
                </div>

                {/* Lista de Tickets */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {historial.map((ticket) => {
                    const estadoInfo = getEstadoBadge(ticket.accion);
                    const IconoEstado = estadoInfo.icon;

                    return (
                      <div
                        key={ticket.id}
                        className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all border-l-4"
                        style={{
                          borderLeftColor: ticket.servicio_color || "#6B7280",
                        }}>
                        <div className="flex items-start justify-between gap-4">
                          {/* Columna Izquierda: Info Principal */}
                          <div className="flex items-start gap-4 flex-1">
                            {/* Número de Ticket */}
                            <div className="flex-shrink-0">
                              <div
                                className="text-4xl font-extrabold"
                                style={{
                                  color: ticket.servicio_color, //|| hservicios.map(t=>t.color),
                                }}>
                                {ticket.numero}
                              </div>
                              <div className="text-xs text-gray-500 text-center font-bold mt-2 underline">
                                Ticket #{ticket.id}
                              </div>
                            </div>

                            {/* Info del Ticket */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                  {ticket.servicio_nombre}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${estadoInfo.bg} ${estadoInfo.text} flex items-center gap-1`}>
                                  <IconoEstado className="w-3 h-3" />
                                  {estadoInfo.label}
                                </span>
                              </div>

                              {/* Información del Cliente */}
                              {ticket.identificacion && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="font-semibold">
                                    Cliente:
                                  </span>
                                  <span>
                                    {ticket.tipo_identificacion}:{" "}
                                    {ticket.identificacion}
                                  </span>
                                </div>
                              )}

                              {/* Información del Operador */}
                              {ticket.operador_nombre && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Users className="w-4 h-4" />
                                  <span className="font-semibold">
                                    Atendido por:
                                  </span>
                                  <span>{ticket.operador_nombre}</span>
                                  {ticket.puesto_numero && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                      Puesto {ticket.puesto_numero}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Llamadas */}
                              {ticket.detalles && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <PhoneCall className="w-4 h-4" />
                                  <span>{ticket.detalles}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Columna Derecha: Tiempos y Fechas */}
                          <div className="flex-shrink-0 text-right space-y-2">
                            {/* Tiempos */}
                            {ticket.accion === "llamado" && (
                              <div className="space-y-1">
                                {ticket.tiempo_espera_minutos !== null && (
                                  <div className="flex items-center gap-2 justify-end text-sm">
                                    <span className="text-gray-600">
                                      Espera:
                                    </span>
                                    <span className="font-bold text-yellow-600">
                                      {formatearTiempo(
                                        ticket.tiempo_espera_minutos
                                      )}
                                    </span>
                                  </div>
                                )}
                                {ticket.tiempo_atencion_minutos !== null && (
                                  <div className="flex items-center gap-2 justify-end text-sm">
                                    <span className="text-gray-600">
                                      Atención:
                                    </span>
                                    <span className="font-bold text-blue-600">
                                      {formatearTiempo(
                                        ticket.tiempo_atencion_minutos
                                      )}
                                    </span>
                                  </div>
                                )}
                                {ticket.tiempo_total_minutos !== null && (
                                  <div className="flex items-center gap-2 justify-end text-sm">
                                    <span className="text-gray-600">
                                      Total:
                                    </span>
                                    <span className="font-bold text-green-600">
                                      {formatearTiempo(
                                        ticket.tiempo_total_minutos
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Fechas */}
                            <div className="space-y-1 text-xs text-gray-500 border-t pt-2 mt-2">
                              {ticket.accion !== "creado" ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <User className="w-3 h-3" />
                                  <span>Atendido por:</span>
                                  <span className="font-bold text-violet-600">
                                    {ticket.usuario_nombre}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-end">
                                  <Clock className="w-5 h-5 text-amber-500" />
                                  <span className="font-bold text-amber-500">
                                    En espera
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 justify-end">
                                <Clock className="w-3 h-3" />
                                <span>Creado:</span>
                                <span className="font-semibold">
                                  {new Date(ticket.created_at).toLocaleString(
                                    "es-ES",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                              {ticket.llamado_at && (
                                <div className="flex items-center gap-2 justify-end">
                                  <PhoneCall className="w-3 h-3" />
                                  <span>Llamado:</span>
                                  <span className="font-semibold">
                                    {new Date(
                                      ticket.llamado_at
                                    ).toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              )}
                              {ticket.atendido_at && (
                                <div className="flex items-center gap-2 justify-end">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Atendido:</span>
                                  <span className="font-semibold">
                                    {new Date(
                                      ticket.atendido_at
                                    ).toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {historial.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <History className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-semibold">
                        No hay tickets en el historial
                      </p>
                      <p className="text-sm mt-2">
                        Ajusta los filtros para ver más resultados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaAdmin;
