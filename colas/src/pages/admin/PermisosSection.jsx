import { useState, useEffect } from "react";
import {
  Check,
  UserCheck2Icon,
  Users,
  X,
  AlertCircleIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "react-toastify";

function PermisosSection({
  adminServicios,
  LoadingSpin,
  MENU_ITEMS,
  onTogglePermiso,
  API,
  usuarioActual,
}) {
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [permisosActuales, setPermisosActuales] = useState([]);

  // 🔥 NUEVO: mapa de permisos por usuario
  const [permisosPorUsuario, setPermisosPorUsuario] = useState({});

  const [permisosUsuarioActual, setPermisosUsuarioActual] = useState([]);

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryGreen: "#499c35",
    primaryYellow: "#fad824",
    monoSilver: "#b2b2b2",
    secondaryBlueDark: "#006ca1",
  };

  const esMismoUsuario = usuarioActual?.id === adminSeleccionado?.id;

  // 🔥 cargar permisos del usuario logueado
  useEffect(() => {
    const cargarPermisosUsuarioActual = async () => {
      if (!usuarioActual?.id) return;
      try {
        const permisos = await API.getPermisosUsuario(usuarioActual.id);
        setPermisosUsuarioActual(permisos.map(Number));
      } catch {}
    };

    cargarPermisosUsuarioActual();
  }, [usuarioActual]);

  // 🔥 NUEVO: cargar permisos de TODOS los usuarios
  useEffect(() => {
    const cargarTodosLosPermisos = async () => {
      try {
        const resultados = await Promise.all(
          adminServicios.map(async (admin) => {
            const permisos = await API.getPermisosUsuario(admin.id);
            return {
              id: admin.id,
              count: permisos.length,
            };
          }),
        );

        const mapa = {};
        resultados.forEach((r) => {
          mapa[r.id] = r.count;
        });

        setPermisosPorUsuario(mapa);
      } catch (err) {
        console.error("Error cargando permisos globales", err);
      }
    };

    if (adminServicios?.length) {
      cargarTodosLosPermisos();
    }
  }, [adminServicios]);

  const handleSeleccionaradmin = async (admin) => {
    if (!admin.activo) {
      toast.error("Usuario inactivo.");
      return;
    }

    setAdminSeleccionado(admin);

    try {
      const permisos = await API.getPermisosUsuario(admin.id);
      setPermisosActuales(permisos.map(Number));
    } catch {
      toast.error("Error al cargar permisos del usuario");
    }
  };

  const handleTogglePermiso = async (usuarioId, permisoId, activo) => {
    const id = Number(permisoId);

    if (usuarioId === usuarioActual?.id) {
      toast.warning("No puedes modificarte a ti mismo.");
      return;
    }

    if (!permisosUsuarioActual.includes(id)) {
      toast.error("No tienes acceso a este módulo.");
      return;
    }

    try {
      if (activo) {
        await API.actualizarPermiso(usuarioId, id, 0);
      } else {
        await API.actualizarPermiso(usuarioId, id, 1);
      }

      const updated = await API.getPermisosUsuario(usuarioId);
      setPermisosActuales(updated.map(Number));

      // 🔥 actualizar contador global
      setPermisosPorUsuario((prev) => ({
        ...prev,
        [usuarioId]: updated.length,
      }));

      if (onTogglePermiso) await onTogglePermiso();
    } catch {
      toast.error("Error al actualizar permiso");
    }
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 140px)", borderColor: colors.monoSilver }}
    >
      {/* HEADER */}
      <div className="p-4">
        <h2
          className="text-lg font-black uppercase"
          style={{ color: colors.primaryBlue }}
        >
          Control de acceso
        </h2>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
          {/* LISTA USUARIOS */}
          <div className="lg:col-span-1 border-r pr-4 overflow-y-auto">
            {adminServicios.map((admin) => {
              const isSelected = adminSeleccionado?.id === admin.id;
              const esYo = usuarioActual?.id === admin.id;

              return (
                <div
                  key={admin.id}
                  onClick={() => handleSeleccionaradmin(admin)}
                  className={`p-2 rounded-lg cursor-pointer border mb-1 text-sm ${
                    isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs uppercase">
                        {admin.nombre} {esYo && "(TÚ)"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        @{admin.username}
                      </p>
                    </div>

                    {/* 🔥 CONTADOR GLOBAL DE PERMISOS */}
                    <div className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 font-bold text-[10px]">
                      {permisosPorUsuario[admin.id] ?? 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PERMISOS DEL SELECCIONADO */}
          <div className="lg:col-span-2 overflow-y-auto">
            {adminSeleccionado ? (
              <div className={`${esMismoUsuario ? "opacity-60" : ""}`}>
                <h3
                  className="text-base font-black mb-2"
                  style={{ color: colors.secondaryBlueDark }}
                >
                  {adminSeleccionado.nombre}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MENU_ITEMS.map((menu) => {
                    const id = Number(menu.id);
                    const tienePermiso = permisosActuales.includes(id);
                    const puedeAsignar = permisosUsuarioActual.includes(id);
                    const Icon = menu.icon;

                    return (
                      <div
                        key={menu.id}
                        onClick={() => {
                          if (esMismoUsuario)
                            return toast.warning(
                              "No puedes modificar tus propios permisos.",
                            );
                          if (!puedeAsignar)
                            return toast.error(
                              "No puedes editar permisos que no tienes.",
                            );
                          handleTogglePermiso(
                            adminSeleccionado.id,
                            id,
                            tienePermiso,
                          );
                        }}
                        className={`p-2 rounded-lg border flex justify-between items-center gap-2 ${
                          esMismoUsuario || !puedeAsignar
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer hover:scale-[1.02]"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 min-w-0 ${tienePermiso ? "text-green-700" : "text-red-500"}`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-bold uppercase truncate">
                            {menu.label}
                          </span>
                        </div>

                        {tienePermiso ? (
                          <Check className="w-4 h-4 text-green-800 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <UserCheck2Icon className="w-10 h-10 mb-2" />

                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Selecciona un usuario
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 border-t bg-gray-50 flex items-center">
        <AlertCircleIcon className="w-3 h-3 mr-2 opacity-40" />
        <span className="text-[9px] font-bold text-gray-400 uppercase">
          Contadores de permisos por usuario activos
        </span>
      </div>
    </div>
  );
}

export default PermisosSection;
