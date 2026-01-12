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
} from "lucide-react";

function PantallaAdmin() {
  const [seccion, setSeccion] = useState("configuracion");
  const [servicios, setServicios] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [medios, setMedios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});

  useEffect(() => {
    cargarDatos();
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
        case "estadisticas":
          setEstadisticas(await API.getEstadisticas());
          break;
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const handleGuardarConfiguracion = async () => {
    try {
      await API.updateConfiguracion(configuracion.id, configuracion);
      alert("Configuración guardada.");
      cargarDatos();
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
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
      await API.createMedio(formulario);
      setEditando(null);
      setFormulario({});
      cargarDatos();
    } catch (error) {
      console.error("Error guardando medio:", error);
      alert("Error al guardar el medio");
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
              }`}
            >
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
                          style={{ display: "none" }}
                        >
                        No se pudo cargar la imagen
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tiempo de Rotación */}
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

                  {/* Opciones de Visualización */}
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
                          className="text-gray-700 font-semibold cursor-pointer"
                        >
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
                          className="text-gray-700 font-semibold cursor-pointer"
                        >
                          Mostrar videos en pantalla de anuncios
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Información del Sistema */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Información del Sistema
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>ID de Configuración:</strong> {configuracion.id}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Creado:</strong>{" "}
                        {new Date(configuracion.created_at).toLocaleString(
                          "es-ES"
                        )}
                      </p>
                      {configuracion.updated_at && (
                        <p className="text-sm text-gray-700">
                          <strong>Última actualización:</strong>{" "}
                          {new Date(configuracion.updated_at).toLocaleString(
                            "es-ES"
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botón Guardar */}
                  <div className="flex gap-3 pt-6">
                    <button
                      onClick={handleGuardarConfiguracion}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                    >
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
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
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
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
                      style={{ borderLeftColor: servicio.color }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="text-3xl font-bold"
                          style={{ color: servicio.color }}
                        >
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
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditando(servicio.id);
                            setFormulario(servicio);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminarServicio(servicio.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
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
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {puestos.map((puesto) => (
                    <div key={puesto.id} className="p-6 bg-gray-50 rounded-xl">
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
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
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
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        >
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
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          >
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
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
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
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-xl"
                    >
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
                            }`}
                          >
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
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Medio
                  </button>
                </div>

                {editando && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-4">Agregar Medio</h3>

                    {/* Selector de método */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Método de carga
                      </label>
                      <div className="flex gap-4">
                        {/* <button
                          type="button"
                          onClick={() =>
                            setFormulario({ ...formulario, metodo: "url" })
                          }
                          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            (formulario.metodo || "url") === "url"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          URL Externa
                        </button> */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormulario({ ...formulario, metodo: "archivo" })
                          }
                          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            formulario.metodo === "archivo"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Archivo Local
                        </button>
                      </div>
                    </div>

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
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        >
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

                    {/* Método URL */}
                    {(formulario.metodo || "url") === "url" && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          URL
                        </label>
                        <input
                          type="url"
                          value={formulario.url || ""}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              url: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    )}

                    {/* Método Archivo Local */}
                    {formulario.metodo === "archivo" && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Seleccionar Archivo
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept={
                              formulario.tipo === "imagen"
                                ? "image/*"
                                : "video/*"
                            }
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              // Validar tamaño (máximo 5MB para imágenes, 20MB para videos)
                              const maxSize =
                                formulario.tipo === "imagen"
                                  ? 5 * 1024 * 1024
                                  : 20 * 1024 * 1024;
                              if (file.size > maxSize) {
                                alert(
                                  `El archivo es demasiado grande. Máximo: ${
                                    formulario.tipo === "imagen"
                                      ? "5MB"
                                      : "20MB"
                                  }`
                                );
                                return;
                              }

                              // Convertir a base64
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target.result;
                                setFormulario({
                                  ...formulario,
                                  url: base64,
                                  nombre: formulario.nombre || file.name,
                                });
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex flex-col items-center"
                          >
                            <svg
                              className="w-12 h-12 text-gray-400 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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

                        {/* Vista previa */}
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
                              Tamaño:{" "}
                              {(formulario.url.length / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleGuardarMedio}
                        disabled={!formulario.url || !formulario.nombre}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditando(null);
                          setFormulario({});
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
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
                        className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                      >
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
                                e.target.onerror = null; // Prevenir loop infinito
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
                                e.target.parentElement.innerHTML +=
                                  '<div class="text-red-600 text-sm">Error al cargar video</div>';
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
                            title={medio.nombre}
                          >
                            {medio.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize mb-3">
                            {medio.tipo}{" "}
                            {medio.url.startsWith("data:") && "(Local)"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Vista previa en modal
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
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEliminarMedio(medio.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                            >
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

            {/* SECCIÓN ESTADÍSTICAS */}
            {seccion === "estadisticas" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Estadísticas del Día
                </h2>
                {estadisticas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="text-blue-600 text-4xl font-bold mb-2">
                        {estadisticas.total_tickets || 0}
                      </div>
                      <div className="text-gray-700 font-semibold">
                        Total Tickets
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl">
                      <div className="text-green-600 text-4xl font-bold mb-2">
                        {estadisticas.atendidos || 0}
                      </div>
                      <div className="text-gray-700 font-semibold">
                        Atendidos
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-xl">
                      <div className="text-yellow-600 text-4xl font-bold mb-2">
                        {estadisticas.en_espera || 0}
                      </div>
                      <div className="text-gray-700 font-semibold">
                        En Espera
                      </div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl">
                      <div className="text-red-600 text-4xl font-bold mb-2">
                        {estadisticas.no_presentados || 0}
                      </div>
                      <div className="text-gray-700 font-semibold">
                        No Presentados
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaAdmin;
