import { useState } from "react";
import { 
  Check, 
  UserCheck2Icon, 
  Users, 
  X, 
  ShieldCheck, 
  AlertCircleIcon, 
  LockIcon 
} from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function PermisosSection({
  adminServicios,
  LoadingSpin,
  MENU_ITEMS,
  onTogglePermiso,
  API,
  usuarioActual, // Objeto del usuario que tiene la sesión iniciada
}) {
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [permisosActuales, setPermisosActuales] = useState([]);

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    primaryRed: "#cc132c",
    secondaryBlueDark: "#006ca1",
    secondaryBlueLight: "#4ec2eb",
    monoSilver: "#b2b2b2",
  };

  // Determinar si el administrador seleccionado es el mismo que está operando el sistema
  const esMismoUsuario = usuarioActual?.id === adminSeleccionado?.id;

  const handleSeleccionaradmin = async (admin) => {
    if (!admin.activo) {
      toast.error("Usuario inactivo.");
      return;
    }
    setAdminSeleccionado(admin);
    try {
      const permisos = await API.getPermisosUsuario(admin.id);
      setPermisosActuales(permisos);
    } catch (error) {
      toast.error("Error al cargar permisos del usuario");
    }
  };

  const handleTogglePermiso = async (usuarioId, permisoId, activo) => {
    // Bloqueo de seguridad a nivel de función
    if (esMismoUsuario) {
      toast.warning("No puedes modificar tus propios privilegios por seguridad.");
      return;
    }

    try {
      if (activo) {
        await API.actualizarPermiso(usuarioId, permisoId, 0);
        toast.error("Permiso eliminado.");
      } else {
        await API.actualizarPermiso(usuarioId, permisoId, 1);
        toast.success("Permiso asignado.");
      }

      const permisosActualizados = await API.getPermisosUsuario(usuarioId);
      setPermisosActuales(permisosActualizados);

      if (onTogglePermiso) {
        await onTogglePermiso();
      }
    } catch (error) {
      toast.error("Error al actualizar permiso");
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col" 
      style={{ borderColor: colors.monoSilver, height: 'calc(100vh - 140px)' }}
    >
      {/* Barra superior de acento fijo */}
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER */}
      <div className="p-8 md:p-12 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase" style={{ color: colors.primaryBlue }}>
              Control de <span style={{ color: colors.secondaryBlueDark }}>Accesos</span>
            </h2>
            <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: colors.primaryYellow }}></div>
          </div>
          
          {/* Indicador de Modo Lectura */}
          {esMismoUsuario && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl animate-pulse">
              <LockIcon className="w-5 h-5 text-amber-600" />
              <div className="leading-none">
                <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Modo Lectura</p>
                <p className="text-[9px] font-bold text-amber-500 uppercase">No puedes editar tu propio perfil</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="flex-1 overflow-hidden px-8 md:px-12 pb-8">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center">{/* <TabSpinner /> */}</div>
        ) : adminServicios.length !== 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
            
            {/* PANEL IZQUIERDO: SELECCIÓN DE USUARIOS */}
            <div className="lg:col-span-1 flex flex-col h-full border-r border-gray-100 pr-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Administradores Sistema</h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {adminServicios.map((admin) => {
                  const isSelected = adminSeleccionado?.id === admin.id;
                  const esYo = usuarioActual?.id === admin.id;
                  
                  return (
                    <div
                      key={admin.id}
                      onClick={() => handleSeleccionaradmin(admin)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border-2 group ${
                        isSelected ? "bg-gray-50 shadow-inner" : "border-transparent hover:bg-gray-50"
                      }`}
                      style={{ borderColor: isSelected ? colors.primaryYellow : 'transparent' }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="truncate">
                          <h4 className="font-black text-sm uppercase italic truncate" style={{ color: colors.primaryBlue }}>
                            {admin.nombre} {esYo && <span className="text-[10px] not-italic text-amber-500">(TÚ)</span>}
                          </h4>
                          <p className="text-[10px] font-bold opacity-40">@{admin.username}</p>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                          style={{ 
                            backgroundColor: isSelected ? colors.primaryBlue : '#f3f4f6',
                            color: isSelected ? 'white' : colors.primaryBlue 
                          }}
                        >
                          {admin.permisos?.length || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANEL DERECHO: CUADRÍCULA DE PERMISOS */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {adminSeleccionado ? (
                <div className={`flex flex-col h-full transition-opacity ${esMismoUsuario ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="mb-6 shrink-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Módulos permitidos para</span>
                    <h3 className="text-2xl font-black italic uppercase" style={{ color: colors.secondaryBlueDark }}>
                      {adminSeleccionado.nombre}
                    </h3>
                  </div>

                  {/* Scroll independiente para la rejilla de permisos */}
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                      {MENU_ITEMS.map((menu) => {
                        const Icon = menu.icon;
                        const tienePermiso = permisosActuales.includes(Number(menu.id));

                        return (
                          <div
                            key={menu.id}
                            onClick={() => handleTogglePermiso(adminSeleccionado.id, menu.id, tienePermiso)}
                            className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                              esMismoUsuario ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                            }`}
                            style={{ 
                              backgroundColor: tienePermiso ? `${colors.primaryGreen}05` : 'transparent',
                              borderColor: tienePermiso ? colors.primaryGreen : '#f3f4f6'
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50">
                                <Icon className="w-5 h-5" style={{ color: colors.primaryBlue }} />
                              </div>
                              <div>
                                <p className="font-black text-xs uppercase tracking-tighter" style={{ color: colors.primaryBlue }}>
                                  {menu.label}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                  {tienePermiso ? "Acceso Total" : "Sin Acceso"}
                                </p>
                              </div>
                            </div>

                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm"
                              style={{ backgroundColor: tienePermiso ? colors.primaryGreen : '#e5e7eb' }}
                            >
                              {tienePermiso ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                  <UserCheck2Icon className="w-16 h-16 mb-4 opacity-10" style={{ color: colors.primaryBlue }} />
                  <p className="font-black text-xs uppercase tracking-[0.2em] opacity-30 italic">Selecciona un administrador para gestionar</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center">
            <Users className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-black text-xs uppercase tracking-widest opacity-30">No hay administradores registrados</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-12 py-4 bg-gray-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Sistema de Protección de Identidad: Los permisos se actualizan en tiempo real.
        </span>
      </div>
    </div>
  );
}

export default PermisosSection;