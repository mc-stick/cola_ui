import { useState } from "react";
import { UserCheck2Icon, Users } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function PermisosSection({
  adminServicios,
  LoadingSpin,
  MENU_ITEMS,
  onTogglePermiso,
  API,
}) {
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [permisosActuales, setPermisosActuales] = useState([]);

  const handleSeleccionaradmin = async (admin) => {
    if (!admin.user_active) {
      toast.error("Usuario inactivo.");
      return;
    }

    setAdminSeleccionado(admin);

    try {
      // Cargar permisos actuales del admin
      const permisos = await API.getPermisosUsuario(admin.id);
      setPermisosActuales(permisos);
    } catch (error) {
      toast.error("Error al cargar permisos del usuario");
    }
  };

  const handleTogglePermiso = async (usuarioId, permisoId, activo) => {
    try {
      const permisos = await API.getPermisosUsuario(usuarioId);
  

      if (activo) {
        await API.actualizarPermiso(usuarioId, permisoId, 0);
        toast.error("Configuración No asignada.");
      } else {
        await API.actualizarPermiso(usuarioId, permisoId, 1);
        toast.success("Configuración asignada.");
      }

      // Recargar permisos después de actualizar
      const permisosActualizados = await API.getPermisosUsuario(usuarioId);
      setPermisosActuales(permisosActualizados);

      // Notificar al componente padre para actualizar la lista
      if (onTogglePermiso) {
        await onTogglePermiso();
      }
    } catch (error) {
      toast.error("Error al actualizar permiso");
    }
  };

  return (
    <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/40">
  <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] mb-8 flex items-center gap-3">
    <UserCheck2Icon className="w-8 h-8 text-[var(--color-primary-yellow)]" />
    Asignación de permisos a configuración
  </h2>
<div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5"></div>
  {LoadingSpin ? (
    <TabSpinner />
  ) : (
    <>
      {adminServicios.length !== 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Administradores */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-[var(--color-primary-blue)] mb-6">
              Administradores
            </h3>

            <div className="space-y-4">
              {adminServicios.map((admin) => {
                const permisosCount = admin.permisos?.length;

                return (
                  <div
                    key={admin.id}
                    onClick={() => handleSeleccionaradmin(admin)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      adminSeleccionado?.id === admin.id
                        ? "bg-[var(--color-primary-yellow)] text-white shadow-lg border-[var(--color-primary-yellow)]"
                        : "bg-[var(--color-secondary-blue-light)]/10 border-[var(--color-mono-silver)] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`font-bold text-lg ${
                            admin.user_active
                              ? ""
                              : "line-through text-[var(--color-primary-red)]"
                          }`}
                        >
                          {admin.nombre}
                        </h4>

                        <p
                          className={`text-sm ${
                            adminSeleccionado?.id === admin.id
                              ? "text-white/80"
                              : "text-[var(--color-mono-black)]/60"
                          }`}
                        >
                          @{admin.username}
                        </p>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          adminSeleccionado?.id === admin.id
                            ? "bg-white/20 text-white"
                            : "bg-[var(--color-primary-blue)] text-white"
                        }`}
                      >
                        {permisosCount}
                      </div>
                    </div>

                    {admin.permisos && admin.permisos.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {admin.permisos
                          .filter((p) => p.activo === 1)
                          .map((permiso) => (
                            <span
                              key={permiso.permiso_id}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                adminSeleccionado?.id === admin.id
                                  ? "bg-white/20 text-white"
                                  : "bg-[var(--color-secondary-blue-light)]/30 text-[var(--color-primary-blue)]"
                              }`}
                            >
                              {MENU_ITEMS.find(
                                (item) =>
                                  item.id === String(permiso.permiso_id)
                              )?.label || `#${permiso.permiso_id}`}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permisos */}
          <div className="lg:col-span-2">
            {adminSeleccionado ? (
              <>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[var(--color-primary-blue)]">
                    Permisos para: {adminSeleccionado.nombre}
                  </h3>
                  <p className="text-sm text-[var(--color-mono-black)]/60">
                    Selecciona los módulos a los que este administrador puede acceder
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-2 border-[var(--color-primary-yellow)]/40 rounded-2xl p-6">
                  {MENU_ITEMS.map((menu) => {
                    const Icon = menu.icon;
                    const tienePermiso = permisosActuales.includes(
                      Number(menu.id)
                    );

                    return (
                      <div
                        key={menu.id}
                        onClick={() =>
                          handleTogglePermiso(
                            adminSeleccionado.id,
                            menu.id,
                            tienePermiso
                          )
                        }
                        className={`p-6 rounded-2xl cursor-pointer transition-all border-2 shadow-sm ${
                          tienePermiso
                            ? "border-[var(--color-primary-green)] bg-[var(--color-primary-green)]/10"
                            : "border-[var(--color-primary-red)]/30 bg-[var(--color-primary-red)]/10 hover:border-[var(--color-mono-silver)]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 pt-1">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all ${
                                tienePermiso
                                  ? "bg-[var(--color-primary-green)]"
                                  : "bg-[var(--color-primary-red)]"
                              }`}
                            >
                              {tienePermiso ? "✓" : "✕"}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="w-7 h-7 text-[var(--color-primary-blue)]" />
                              <h4 className="text-lg font-bold text-[var(--color-primary-blue)]">
                                {menu.label}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-[var(--color-mono-silver)]">
                  <UserCheck2Icon className="w-24 h-24 mx-auto mb-4 text-[var(--color-mono-gold)]" />
                  <p className="text-lg">
                    Selecciona un administrador para gestionar sus permisos
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-mono-silver)]">
          <Users className="w-14 h-14 mx-auto mb-4 text-[var(--color-mono-gold)]" />
          <p className="text-lg font-semibold text-[var(--color-primary-blue)]">
            No hay administradores registrados
          </p>
        </div>
      )}
    </>
  )}
</div>
  );
}

export default PermisosSection;
