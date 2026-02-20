import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import {
  Settings,
  LogOut,
  Menu,
  Settings2,
  Building2,
  Briefcase,
  MapPin,
  Users,
  UserCog,
  UserCheck2Icon,
  Image,
  History,
  BarChart3,
  ShieldAlertIcon,
  AlertCircleIcon,
} from "lucide-react";

import { AlertToUI, Spinner } from "../components/loading";
import LoginComponent from "./Login";

// Importar componentes modulares
import ConfiguracionSection from "./admin/ConfiguracionSection";
import ServiciosSection from "./admin/ServiciosSection";
import PermisosSection from "./admin/PermisosSection";
import PuestosSection from "./admin/PuestosSection";
import UsuariosSection from "./admin/UsuariosSection";
import AsignarServiciosSection from "./admin/AsignarServiciosSection";
import MediosSection from "./admin/MediosSection";
import HistorialSection from "./admin/HistorialSection";
import EstadisticasSection from "./admin/EstadisticasSection";
import AuditoriaSection from "./admin/AuditoriaSection";

function PantallaAdmin() {
  // Estado del usuario autenticado
  const [usuario, setUsuario] = useState(null);
  const [seccion, setSeccion] = useState("indx");

  // Estados de datos
  const [servicios, setServicios] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [medios, setMedios] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [adminServicios, setAdminServicios] = useState([]);
  const [operadoresServicios, setOperadoresServicios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [auditoria, setAuditoria] = useState([]);

  // Estados de UI
  const [LoadingSpin, setLoadingSpin] = useState(false);
  const [menuFiltrado, setMenuFiltrado] = useState(false);

  const MENU_ITEMS = [
    { id: "1", icon: Building2, label: "Configuración" },
    { id: "2", icon: Briefcase, label: "Servicios" },
    { id: "3", icon: MapPin, label: "Puestos" },
    { id: "4", icon: Users, label: "Usuarios" },
    { id: "5", icon: UserCog, label: "Asignar Servicios" },
    { id: "0", icon: UserCheck2Icon, label: "Asignar Permisos" },
    { id: "6", icon: Image, label: "Medios" },
    { id: "7", icon: History, label: "Historial" },
    { id: "8", icon: BarChart3, label: "Estadísticas" },
    { id: "9", icon: ShieldAlertIcon, label: "Auditoría" },
  ];

  // ============================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================

  const validarConfiguracion = (config) => {
    if (!config.nombre_empresa || config.nombre_empresa.trim() === "") {
      toast.error("El nombre de la empresa es obligatorio");
      return false;
    }
    if (config.tiempo_rotacion < 1000) {
      toast.error("El tiempo de rotación debe ser al menos 1000ms");
      return false;
    }
    return true;
  };

  const validarServicio = (form, esNuevo) => {
    if (!form.nombre || form.nombre.trim() === "") {
      toast.error("El nombre del servicio es obligatorio");
      return false;
    }
    if (!form.codigo || form.codigo.trim() === "") {
      toast.error("El código del servicio es obligatorio");
      return false;
    }
    if (form.codigo.length > 10) {
      toast.error("El código no puede tener más de 10 caracteres");
      return false;
    }
    if (!form.color || form.color === "") {
      toast.error("Debes seleccionar un color para el servicio");
      return false;
    }
    if (!form.tiempo_promedio || form.tiempo_promedio < 1) {
      toast.error("El tiempo promedio debe ser mayor a 0 minutos");
      return false;
    }
    return true;
  };

  const validarPuesto = (form) => {
    if (!form.numero || form.numero.trim() === "") {
      toast.error("El número del puesto es obligatorio");
      return false;
    }
    if (!form.nombre || form.nombre.trim() === "") {
      toast.error("El nombre del puesto es obligatorio");
      return false;
    }
    return true;
  };

  const validarUsuario = (form, esNuevo) => {
    if (!form.rol || form.rol === "") {
      toast.error("Debes seleccionar un rol");
      return false;
    }
    if (form.rol === "operador" && (!form.puesto_id || form.puesto_id === "")) {
      toast.error("Los operadores deben tener un puesto asignado");
      return false;
    }
    return true;
  };

  const validarMedio = (form) => {
    if (!form.nombre || form.nombre.trim() === "") {
      toast.error("El nombre del medio es obligatorio");
      return false;
    }
    if (!form.url || form.url.trim() === "") {
      toast.error("Debes seleccionar un archivo");
      return false;
    }
    if (!form.tipo || form.tipo === "") {
      toast.error("Debes seleccionar el tipo de medio");
      return false;
    }
    return true;
  };

  const validarFiltrosHistorial = (filtros) => {
    const inicio = new Date(filtros.fecha_inicio);
    const fin = new Date(filtros.fecha_fin);
    if (inicio > fin) {
      toast.error("La fecha de inicio no puede ser mayor a la fecha fin");
      return false;
    }
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      toast.warning(
        "El rango de fechas es muy amplio (más de 1 año). Esto puede tardar.",
      );
    }
    return true;
  };

  const validarFechasEstadisticas = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (inicio > fin) {
      toast.error("La fecha de inicio no puede ser mayor a la fecha fin");
      return false;
    }
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      toast.warning("El rango de fechas es muy amplio. Esto puede tardar.");
    }
    return true;
  };

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatos = async () => {
    setLoadingSpin(true);
    try {
      switch (seccion) {
        case "0": // ASIGNAR PERMISOS
          const admins = await API.getTodosPermisosUsuarios();
          const filladmins = admins.filter(
            (item) => item.user_active == 1 && item.id !== 1,
          );
          setAdminServicios(filladmins);
          break;
        case "1": // CONFIGURACIÓN
          const config = await API.getConfiguracion();
          setConfiguracion(config);
          break;
        case "2": // SERVICIOS
          const serviciosData = await API.getServicios();
          setServicios(serviciosData);
          break;
        case "3": // PUESTOS
          const puestosData = await API.getPuestos();
          setPuestos(puestosData);
          break;
        case "4": // USUARIOS
          const usuariosData = await API.getUsuarios();
          setUsuarios(usuariosData);
          const puestosData2 = await API.getPuestos();
          setPuestos(puestosData2);
          break;
        case "5": // ASIGNAR SERVICIOS
          const operadores = await API.getOperadoresConServicios();
          const fillOperadores = operadores.filter(
            (item) => item.user_active == 1,
          );
          setOperadoresServicios(fillOperadores);
          break;
        case "6": // MEDIOS
          const mediosData = await API.getMedios();
          setMedios(mediosData);
          break;
        case "7": // HISTORIAL
          const usuariosData2 = await API.getUsuarios();
          setUsuarios(usuariosData2);
          const serviciosData7 = await API.getServicios();
          setServicios(serviciosData7);
          break;
        case "8": // ESTADÍSTICAS
          // Las estadísticas se cargan con el botón "Actualizar"
          break;
        case "9": // AUDITORIA
          const usuariosData3 = await API.getUsuarios();
          setUsuarios(usuariosData3);
          break;
      }
    } catch (error) {
      // Error ya manejado por API
    } finally {
      setTimeout(() => {
        // general
        setLoadingSpin(false);
      }, 2000);
    }
  };

  // ============================================
  // FUNCIONES DE MANEJO DE DATOS
  // ============================================

  const handleGuardarConfiguracion = async () => {
    if (!validarConfiguracion(configuracion)) {
      return;
    }
    try {
      await API.updateConfiguracion(configuracion.id, configuracion);
      toast.success("Configuración guardada exitosamente");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleGuardarServicio = async (formulario, editando) => {
    try {
      if (editando === "nuevo") {
        await API.createServicio(formulario);
        toast.success("Servicio creado exitosamente");
      } else {
        await API.updateServicio(editando, formulario);
        toast.success("Servicio actualizado exitosamente");
      }
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleEliminarServicio = async (id) => {
    try {
      await API.deleteServicio(id);
      toast.success("Servicio eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleSwitchServicio = async (id, activo) => {
    try {
      await API.switchServicio(id);
      activo
        ? toast.error("Servicio Inactivo")
        : toast.success("Servicio Activo");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  // ============================================
  // HANDLERS PUESTOS
  // ============================================

  const handleGuardarPuesto = async (formulario, editando) => {
    try {
      if (editando === "nuevo") {
        await API.createPuesto(formulario);
        toast.success("Puesto creado exitosamente");
      } else {
        await API.updatePuesto(editando, formulario);
        toast.success("Puesto actualizado exitosamente");
      }
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleSwitchPuesto = async (id) => {
    try {
      await API.switchPuesto(id);
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  // ============================================
  // HANDLERS USUARIOS
  // ============================================

  const handleGuardarUsuario = async (formulario, editando) => {
    try {
      if (editando === "nuevo") {
        await API.createUsuario(formulario);
        toast.success("Usuario creado exitosamente");
      } else {
        await API.updateUsuario(editando, formulario);
        toast.success("Usuario actualizado exitosamente");
      }
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleSwitchUser = async (id) => {
    try {
      await API.switchUser(id);
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este usuario?",
    );

    // Si el usuario confirma (presiona "Aceptar"), llamar a onDeleteUser
    if (!confirmDelete) {
      return;
    }

    try {
      await API.deleteUser(id);
      toast.success("Usuario eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  // ============================================
  // HANDLERS MEDIOS
  // ============================================

  const handleGuardarMedio = async (formulario) => {
    try {
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
      toast.success("Medio guardado exitosamente");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleEliminarMedio = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este medio?")) return;
    try {
      await API.deleteMedio(id);
      toast.success("Medio eliminado exitosamente");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const handleSwitchMedio = async (id, activo) => {
    try {
      await API.SwitchMedio(id);
      activo
        ? toast.error("No se mostrará en la pantalla")
        : toast.success("Se mostrará en la pantalla");
      cargarDatos();
    } catch (error) {
      // Error ya manejado por API
    }
  };

  // ============================================
  // HANDLERS HISTORIAL
  // ============================================

  const handleCargarHistorial = async (filtros) => {
    try {
      const params = {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
      };

      if (filtros.servicio_id) params.servicio_id = filtros.servicio_id;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.operador) params.operador = filtros.operador;

      const data = await API.getHistorial(params);

      const historialFiltrado = Object.values(
        data.reduce((acc, item) => {
          if (!acc[item.ticket_id]) {
            acc[item.ticket_id] = item;
          }
          return acc;
        }, {}),
      ).reverse();

      toast.success(
        <div className="block">
          Filtrando resultados
          <br />
          desde:<strong> {filtros.fecha_inicio} </strong>
          <br />
          hasta:<strong> {filtros.fecha_fin} </strong>
        </div>,
      );

      setHistorial(historialFiltrado);
    } catch (error) {
      // Error ya manejado por API
    }
  };

  const onCargarAuditoria = async (filtros) => {
    try {
      const params = {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
      };
      if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;

      const response = await API.getAuditoria(params);

      setAuditoria(response);
    } catch (error) {
      console.error("Error en onCargarAuditoria:", error);
      throw error;
    }
  };

  // ============================================
  // HANDLERS ESTADÍSTICAS
  // ============================================

  const handleCargarEstadisticas = async (fechaInicio, fechaFin) => {
    try {
      const [rango, servicios, operadores, horas, resumen] = await Promise.all([
        API.getEstadisticasRango(fechaInicio, fechaFin),
        API.getEstadisticasServicios(fechaInicio, fechaFin),
        API.getEstadisticasOperadores(fechaInicio, fechaFin),
        API.getEstadisticasHoras(fechaFin),
        API.getEstadisticasResumen(fechaInicio, fechaFin),
      ]);

      toast.success("Estadísticas actualizadas.");

      return {
        rango,
        servicios,
        operadores,
        horas,
        resumen,
      };
    } catch (error) {
      // Error ya manejado por API
      return null;
    }
  };

  // ============================================
  // AUTENTICACIÓN Y SESIÓN
  // ============================================

  const restaurarSesion = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const result = await API.getCurrentUser();
      if (result.success) {
        const user = result.user;
        if (user.rol !== "admin") {
          localStorage.removeItem("token");
          toast.error("Acceso denegado. Necesitas permisos de administrador.");
          return;
        }
        setUsuario(user);

        // Obtener permisos del usuario
        const permisos = await API.getPermisosUsuario(user.id);
        const mefill = MENU_ITEMS.filter((item) =>
          permisos.includes(Number(item.id)),
        );
        setMenuFiltrado(mefill);
      } else if (result.unauthorized) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
      }
    } catch (error) {
      console.error("Error restaurando sesión:", error);
      toast.error("Error inesperado. Por favor recarga la página.");
    }
  };

  useEffect(() => {
    restaurarSesion();
  }, []);

  const handleLoginSuccess = (user) => {
    setUsuario(user);
    restaurarSesion();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    window.location.reload();
  };

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [seccion, usuario]);

  // ============================================
  // COMPONENTES DE UI
  // ============================================

  const MenuLateral = () => {
    return (
      <div className="w-64 bg-white shadow-lg rounded-2xl p-6 h-fit sticky top-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Admin Panel
        </h2>

        <nav className="space-y-2">
          {menuFiltrado &&
            menuFiltrado.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSeccion(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    Number(seccion) === Number(item.id)
                      ? "bg-primary text-white"
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
  };

  // ============================================
  // RENDERIZADO PRINCIPAL
  // ============================================

  if (!usuario) {
    return (
      <LoginComponent onLoginSuccess={handleLoginSuccess} tipoUsuario="admin" />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-mono-silver)]/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] px-8 py-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-extrabold flex items-center gap-3 tracking-tight">
            <Settings className="w-10 h-10 text-[var(--color-primary-yellow)]" />
            Panel de Administración
          </h1>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-yellow-light)] hover:text-[var(--color-mono-black)] px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-8">
          {menuFiltrado.length > 0 && <MenuLateral />}

          <div className="flex-1 scroll-body">
            {seccion === "indx" && (
              <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/40">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-[var(--color-primary-blue)] flex items-center gap-3">
                    <Settings2 className="w-8 h-8 text-[var(--color-primary-green)]" />
                    Panel de Administración
                  </h2>
                </div>

                {menuFiltrado && menuFiltrado.length > 0 ? (
                  <div className="space-y-8">
                    <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full"></div>

                    <p className="text-lg text-[var(--color-mono-black)]/80">
                      Aquí podrás ver y administrar la configuración de la
                      aplicación.
                    </p>

                    <div className="flex items-center bg-[var(--color-secondary-blue-light)]/10 border border-[var(--color-secondary-blue-light)] rounded-xl p-6">
                      <Menu className="text-[var(--color-primary-blue)] w-6 h-6" />
                      <span className="ml-4 text-[var(--color-mono-black)]/80">
                        Usa el menú de la izquierda para navegar por la
                        configuración.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="h-1 w-24 bg-[var(--color-primary-red)] rounded-full"></div>

                    <div className="flex items-center bg-[var(--color-primary-red)]/10 border border-[var(--color-primary-red)]/30 rounded-xl p-6">
                      <AlertCircleIcon className="w-10 h-10 text-[var(--color-primary-red)]" />
                      <span className="ml-6 text-xl italic text-[var(--color-primary-blue)]">
                        No puedes administrar ninguna configuración, pídele a un
                        administrador que te asigne alguna configuración.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN CONFIGURACIÓN */}
            {seccion === "1" && (
              <ConfiguracionSection
                configuracion={configuracion}
                setConfiguracion={setConfiguracion}
                LoadingSpin={LoadingSpin}
                onGuardar={handleGuardarConfiguracion}
              />
            )}

            {/* SECCIÓN SERVICIOS */}
            {seccion === "2" && (
              <ServiciosSection
                servicios={servicios}
                LoadingSpin={LoadingSpin}
                onGuardarServicio={handleGuardarServicio}
                onEliminarServicio={handleEliminarServicio}
                onSwitchServicio={handleSwitchServicio}
                validarServicio={validarServicio}
              />
            )}

            {/* SECCIÓN PERMISOS */}
            {seccion === "0" && (
              <PermisosSection
                adminServicios={adminServicios}
                LoadingSpin={LoadingSpin}
                MENU_ITEMS={MENU_ITEMS}
                onTogglePermiso={cargarDatos}
                API={API}
              />
            )}

            {/* SECCIÓN PUESTOS */}
            {seccion === "3" && (
              <PuestosSection
                puestos={puestos}
                LoadingSpin={LoadingSpin}
                onGuardarPuesto={handleGuardarPuesto}
                onSwitchPuesto={handleSwitchPuesto}
                validarPuesto={validarPuesto}
              />
            )}

            {/* SECCIÓN USUARIOS */}
            {seccion === "4" && (
              <UsuariosSection
                usuarios={usuarios}
                puestos={puestos}
                LoadingSpin={LoadingSpin}
                onGuardarUsuario={handleGuardarUsuario}
                onSwitchUser={handleSwitchUser}
                onDeleteUser={handleDeleteUser}
                validarUsuario={validarUsuario}
              />
            )}

            {/* SECCIÓN ASIGNAR SERVICIOS */}
            {seccion === "5" && (
              <AsignarServiciosSection
                operadoresServicios={operadoresServicios}
                LoadingSpin={LoadingSpin}
                setLoadingSpin={setLoadingSpin}
                onToggleServicio={cargarDatos}
                API={API}
              />
            )}

            {/* SECCIÓN MEDIOS */}
            {seccion === "6" && (
              <MediosSection
                medios={medios}
                LoadingSpin={LoadingSpin}
                onGuardarMedio={handleGuardarMedio}
                onEliminarMedio={handleEliminarMedio}
                onSwitchMedio={handleSwitchMedio}
                validarMedio={validarMedio}
              />
            )}

            {/* SECCIÓN HISTORIAL */}
            {seccion === "7" && (
              <HistorialSection
                historial={historial}
                setHistorial={setHistorial}
                servicios={servicios}
                usuarios={usuarios}
                LoadingSpin={LoadingSpin}
                setLoadingSpin={setLoadingSpin}
                onCargarHistorial={handleCargarHistorial}
                validarFiltrosHistorial={validarFiltrosHistorial}
              />
            )}

            {/* SECCIÓN ESTADÍSTICAS */}
            {seccion === "8" && (
              <EstadisticasSection
                LoadingSpin={LoadingSpin}
                onCargarEstadisticas={handleCargarEstadisticas}
                validarFechasEstadisticas={validarFechasEstadisticas}
              />
            )}

            {/* SECCIÓN AUDITORIA */}
            {seccion === "9" && (
              <AuditoriaSection
                auditoria={auditoria}
                setAuditoria={setAuditoria}
                usuarios={usuarios}
                LoadingSpin={LoadingSpin}
                setLoadingSpin={setLoadingSpin}
                onCargarAuditoria={onCargarAuditoria}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PantallaAdmin;
