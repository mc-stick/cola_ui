import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import {
  Settings,
  Menu,
  Settings2,
  Users,
  UserCheck2Icon,
  Image,
  History,
  BarChart3,
  ShieldAlertIcon,
  AlertCircleIcon,
  DoorOpenIcon,
  Building,
  Tags,
  MonitorCheck,
  LibraryBigIcon,
} from "lucide-react";

import { Spinner, TabSpinner } from "../components/loading";
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
import DepartamentoSection from "./admin/departamentoSection";

function PantallaAdmin() {
  // Estado del usuario autenticado
  const [usuario, setUsuario] = useState(null);
  const [seccion, setSeccion] = useState("indx");

  // Estados de datos
  const [servicios, setServicios] = useState([]);
  const [departamentos, setdepartamentos] = useState([]);
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
  const [menuFiltrado, setMenuFiltrado] = useState([]);

  // Paleta de Colores
  const colors = {
    primaryBlue: "#1e2a4f",
    primaryRed: "#cc132c",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    secondaryBlueDark: "#006ca1",
    secondaryBlueLight: "#4ec2eb",
    monoWhite: "#ffffff",
    monoBlack: "#000000",
    monoSilver: "#b2b2b2",
    monoGold: "#daab00"
  };

  const MENU_ITEMS = [
    { id: "1", icon: Settings, label: "Configuración" },
    { id: "10", icon: Building, label: "Departamentos" },
    { id: "2", icon: Tags, label: "Servicios" },
    { id: "3", icon: MonitorCheck, label: "Puestos" },
    { id: "4", icon: Users, label: "Usuarios" },
    { id: "5", icon: LibraryBigIcon, label: "Asignar Servicios" },
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
    return true;
  };

  const validarServicio = (form) => {
    if (!form.nombre || !form.codigo) {
      toast.error("Nombre y código son obligatorios");
      return false;
    }
    return true;
  };

  const validarDepartamento = (form) => {
    if (!form.nombre) {
      toast.error("El nombre es obligatorio");
      return false;
    }
    return true;
  };

  const validarPuesto = (form) => {
    if (!form.nombre) {
      toast.error("El nombre del puesto es obligatorio");
      return false;
    }
    return true;
  };

  const validarUsuario = (form) => {
    if (!form.rol) {
      toast.error("Debes seleccionar un rol");
      return false;
    }
    return true;
  };

  const validarMedio = (form) => {
    if (!form.nombre || !form.url) {
      toast.error("Nombre y archivo son obligatorios");
      return false;
    }
    return true;
  };

  const validarFiltrosHistorial = (filtros) => {
    if (new Date(filtros.fecha_inicio) > new Date(filtros.fecha_fin)) {
      toast.error("Rango de fechas inválido");
      return false;
    }
    return true;
  };

  // ============================================
  // CARGA DE DATOS
  // ============================================

  const cargarDatos = async () => {
    setLoadingSpin(true);
    try {
      switch (seccion) {
        case "0":
          const admins = await API.getTodosPermisosUsuarios();
          setAdminServicios(admins.filter((item) => item.activo == 1 && item.id !== 1));
          break;
        case "1":
          const config = await API.getConfiguracion();
          setConfiguracion(config);
          break;
        case "2":
          const [sData, dData] = await Promise.all([API.getServicios(), API.getdepartamentos()]);
          setServicios(sData);
          setdepartamentos(dData);
          break;
        case "3":
          setPuestos(await API.getPuestos());
          break;
        case "4":
          const [uData, pData] = await Promise.all([API.getUsuarios(), API.getPuestos()]);
          setUsuarios(uData);
          setPuestos(pData);
          break;
        case "5":
          const operadores = await API.getOperadoresConServicios();
          setOperadoresServicios(operadores.filter((item) => item.activo == 1));
          break;
        case "6":
          setMedios(await API.getMedios());
          break;
        case "7":
          const [uDataHist, sDataHist] = await Promise.all([API.getUsuarios(), API.getServicios()]);
          setUsuarios(uDataHist);
          setServicios(sDataHist);
          break;
        case "9":
          setUsuarios(await API.getUsuarios());
          break;
        case "10":
          setdepartamentos(await API.getdepartamentos());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setTimeout(() => setLoadingSpin(false), 600);
    }
  };

  // ============================================
  // HANDLERS (ABSTRACCIÓN)
  // ============================================

  const handleGuardarConfiguracion = async () => {
    if (!validarConfiguracion(configuracion)) return;
    try {
      await API.updateConfiguracion(configuracion.id, configuracion);
      toast.success("Configuración guardada");
      cargarDatos();
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    window.location.reload();
  };

  const restaurarSesion = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const result = await API.getCurrentUser();
      if (result.success && result.user.rol === 1) {
        setUsuario(result.user);
        const permisos = await API.getPermisosUsuario(result.user.id);
        setMenuFiltrado(MENU_ITEMS.filter((item) => permisos.includes(Number(item.id))));
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  useEffect(() => {
    restaurarSesion();
  }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [seccion, usuario]);

  // ============================================
  // UI COMPONENTS
  // ============================================

  const MenuLateral = () => (
    <div
      className="flex flex-col flex-shrink-0 text-white w-64 p-4 sticky top-0 min-h-[calc(100vh-80px)] shadow-2xl"
      style={{ backgroundColor: colors.primaryBlue }}
    >
      <div className="flex items-center mb-8 px-2">
        <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: colors.primaryYellow }}>
          <Settings2 className="w-6 h-6" style={{ color: colors.primaryBlue }} />
        </div>
        <span className="font-black text-lg tracking-tighter uppercase">Navegación</span>
      </div>

      <ul className="flex flex-col flex-1 space-y-2">
        {menuFiltrado.map((item) => {
          const Icon = item.icon;
          const isActive = seccion === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setSeccion(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                  isActive ? "shadow-inner" : "hover:bg-white/10"
                }`}
                style={{
                  backgroundColor: isActive ? colors.secondaryBlueDark : "transparent",
                  color: isActive ? colors.monoWhite : colors.monoSilver,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? colors.primaryYellow : "inherit" }} />
                <span className="text-sm">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black transition-transform active:scale-95 shadow-lg"
          style={{ backgroundColor: colors.primaryRed, color: colors.monoWhite }}
        >
          <DoorOpenIcon className="w-5 h-5" />
          CERRAR SESIÓN
        </button>
      </div>
    </div>
  );

  if (!usuario) {
    return <LoginComponent onLoginSuccess={(u) => { setUsuario(u); restaurarSesion(); }} tipoUsuario="admin" />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f2f5" }}>
      {/* Header Corporativo */}
      <header
        className="px-8 py-5 shadow-lg z-30 flex justify-between items-center"
        style={{
          background: `linear-gradient(90deg, ${colors.primaryBlue} 0%, ${colors.secondaryBlueDark} 100%)`,
        }}
      >
        <h1 className="text-2xl font-black text-white flex items-center gap-3 italic tracking-tighter">
          <Building className="w-8 h-8" style={{ color: colors.primaryYellow }} />
          ADMIN <span style={{ color: colors.primaryYellow }}>PANEL</span>
        </h1>
        <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primaryGreen }}></div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">
             {usuario.nombre}
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {menuFiltrado.length > 0 && <MenuLateral />}

        <main className="flex-1 overflow-y-auto p-8 relative">
          {LoadingSpin && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <TabSpinner color={colors.primaryBlue} />
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {seccion === "indx" && (
              <div className="bg-white rounded-3xl shadow-sm border p-12 relative overflow-hidden" style={{ borderColor: colors.monoSilver }}>
                <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: colors.primaryBlue }}></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter mb-2" style={{ color: colors.primaryBlue }}>
                      BIENVENIDO {usuario.usuario} | {usuario.nombre}
                    </h2>
                    <p className="text-lg font-medium opacity-50 uppercase tracking-widest">Gestión de colas v1.2.2</p>
                  </div>
                  <Settings2 className="w-20 h-20 opacity-10 rotate-12" style={{ color: colors.primaryBlue }} />
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="h-2 w-24 rounded-full" style={{ backgroundColor: colors.primaryYellow }}></div>
                    <p className="text-xl leading-relaxed text-gray-700">
                      Utilice el panel de navegación para gestionar los servicios, monitorear puestos de atención y revisar las métricas de rendimiento.
                    </p>
                    <div className="flex items-center p-6 rounded-2xl border-l-8" style={{ backgroundColor: `${colors.secondaryBlueLight}15`, borderColor: colors.secondaryBlueLight }}>
                      <AlertCircleIcon className="mr-4" style={{ color: colors.secondaryBlueDark }} />
                      <span className="font-bold text-sm" style={{ color: colors.secondaryBlueDark }}>
                        Recuerde que los cambios en la configuración afectan a todos los terminales activos.
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-10 flex flex-col justify-center items-center border border-dashed text-center">
                    {menuFiltrado.length === 0 ? (
                      <>
                        <ShieldAlertIcon className="w-16 h-16 mb-4" style={{ color: colors.primaryRed }} />
                        <h3 className="font-black text-red-600">SIN PERMISOS</h3>
                        <p className="text-sm opacity-60">Solicite acceso para administrar secciones.</p>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold opacity-30 uppercase">Conectado</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Renderizado de Secciones */}
            {seccion === "1" && (
              <ConfiguracionSection configuracion={configuracion} setConfiguracion={setConfiguracion} LoadingSpin={LoadingSpin} onGuardar={handleGuardarConfiguracion} />
            )}
            {seccion === "2" && (
              <ServiciosSection servicios={servicios} departamentos={departamentos} LoadingSpin={LoadingSpin} onGuardarServicio={async (f, e) => { try { if (e === "nuevo") await API.createServicio(f); else await API.updateServicio(e, f); toast.success("Éxito"); cargarDatos(); } catch (err) {} }} onEliminarServicio={async (id) => { await API.deleteServicio(id); cargarDatos(); }} onSwitchServicio={async (id) => { await API.switchServicio(id); cargarDatos(); }} validarServicio={validarServicio} />
            )}
            {seccion === "10" && (
              <DepartamentoSection departamento={departamentos} LoadingSpin={LoadingSpin} onGuardarDepartamento={async (f, e) => { try { if (e === "nuevo") await API.createDepartamento(f); else await API.updateDepartamento(e, f); toast.success("Éxito"); cargarDatos(); } catch (err) {} }} onEliminarDepartamento={async (id) => { await API.deleteDepartamento(id); cargarDatos(); }} onSwitchDepartamento={async (id) => { await API.switchDepartamento(id); cargarDatos(); }} validarDepartamento={validarDepartamento} />
            )}
            {seccion === "0" && <PermisosSection usuarioActual={usuario} adminServicios={adminServicios} LoadingSpin={LoadingSpin} MENU_ITEMS={MENU_ITEMS} onTogglePermiso={cargarDatos} API={API} />}
            {seccion === "3" && <PuestosSection puestos={puestos} LoadingSpin={LoadingSpin} onGuardarPuesto={async (f, e) => { if (e === "nuevo") await API.createPuesto(f); else await API.updatePuesto(e, f); cargarDatos(); }} onSwitchPuesto={async (id) => { await API.switchPuesto(id); cargarDatos(); }} validarPuesto={validarPuesto} />}
            {seccion === "4" && <UsuariosSection usuarios={usuarios} puestos={puestos} LoadingSpin={LoadingSpin} onGuardarUsuario={async (f, e) => { if (e === "nuevo") await API.createUsuario(f); else await API.updateUsuario(e, f); cargarDatos(); }} onSwitchUser={async (id) => { await API.switchUser(id); cargarDatos(); }} onDeleteUser={async (id) => { if (window.confirm("¿Eliminar?")) { await API.deleteUser(id); cargarDatos(); } }} validarUsuario={validarUsuario} />}
            {seccion === "5" && <AsignarServiciosSection operadoresServicios={operadoresServicios} LoadingSpin={LoadingSpin} setLoadingSpin={setLoadingSpin} onToggleServicio={cargarDatos} API={API} />}
            {seccion === "6" && <MediosSection medios={medios} LoadingSpin={LoadingSpin} onGuardarMedio={async (f) => { await API.createMedio(f); cargarDatos(); }} onEliminarMedio={async (id) => { await API.deleteMedio(id); cargarDatos(); }} onSwitchMedio={async (id) => { await API.SwitchMedio(id); cargarDatos(); }} validarMedio={validarMedio} />}
            {seccion === "7" && <HistorialSection historial={historial} setHistorial={setHistorial} servicios={servicios} usuarios={usuarios} LoadingSpin={LoadingSpin} setLoadingSpin={setLoadingSpin} onCargarHistorial={async (f) => { const d = await API.getHistorial(f); setHistorial(d); }} validarFiltrosHistorial={validarFiltrosHistorial} />}
            {seccion === "8" && <EstadisticasSection LoadingSpin={LoadingSpin} onCargarEstadisticas={async (i, f) => { return await API.getEstadisticasRango(i, f); }} validarFechasEstadisticas={() => true} />}
            {seccion === "9" && <AuditoriaSection auditoria={auditoria} setAuditoria={setAuditoria} usuarios={usuarios} LoadingSpin={LoadingSpin} setLoadingSpin={setLoadingSpin} onCargarAuditoria={async (f) => { setAuditoria(await API.getAuditoria(f)); }} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PantallaAdmin;