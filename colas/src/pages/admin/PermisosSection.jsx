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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <UserCheck2Icon className="w-8 h-8 text-orange-600" />
        Asignación de permisos a configuración
      </h2>
      {LoadingSpin ? (
        <TabSpinner />
      ) : (<>
        {adminServicios.length !== 0 ? (
                
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Administradores */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Administradores
            </h3>
            <div className="space-y-3">
              {adminServicios.map((admin) => {
                const permisosCount = admin.permisos?.length
                return (
                  
                  <div
                    key={admin.id}
                    onClick={() => handleSeleccionaradmin(admin)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      adminSeleccionado?.id === admin.id
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`font-bold ${
                            adminSeleccionado?.id === admin.id
                              ? "text-white"
                              : "text-gray-800"
                          } ${
                            admin.user_active ? "" : "line-through text-red-500"
                          }`}>
                          {admin.nombre}
                        </h4>
                        <p
                          className={`text-sm ${
                            adminSeleccionado?.id === admin.id
                              ? "text-orange-100"
                              : "text-gray-600"
                          }`}>
                          @{admin.username}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          adminSeleccionado?.id === admin.id
                            ? "bg-white/20 text-white"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                        {permisosCount}
                      </div>
                    </div>

                    {admin.permisos && admin.permisos.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {admin.permisos
                          .filter((p) => p.activo === 1)
                          .map((permiso) => (
                            <span
                              key={permiso.permiso_id}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                adminSeleccionado?.id === admin.id
                                  ? "bg-white/20 text-white"
                                  : "bg-orange-100 text-orange-700"
                              }`}>
                              {MENU_ITEMS.find(
                                (item) =>
                                  item.id === String(permiso.permiso_id),
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

          {/* Permisos Disponibles */}
          <div className="lg:col-span-2">
            {adminSeleccionado ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Permisos para: {adminSeleccionado.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Selecciona los módulos a los que este administrador puede
                    acceder
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 rounded-xl border-orange-200 p-3">
                  {MENU_ITEMS.map((menu) => {
                    const Icon = menu.icon;
                    const tienePermiso = permisosActuales.includes(
                      Number(menu.id),
                    );

                    return (
                      <div
                        key={menu.id}
                        onClick={() =>
                          handleTogglePermiso(
                            adminSeleccionado.id,
                            menu.id,
                            tienePermiso,
                          )
                        }
                        className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
                          tienePermiso
                            ? "border-green-500 bg-green-50 shadow-md"
                            : "border-red-200 bg-red-50 hover:border-gray-300"
                        }`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 pt-1">
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                tienePermiso
                                  ? "bg-green-500 border-green-500"
                                  : "bg-red-500 border-red-300"
                              }`}>
                              {tienePermiso ? (
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
                              <Icon className="w-8 h-8 text-orange-600" />
                              <h4 className="text-lg font-bold text-gray-800">
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
                <div className="text-center text-gray-400">
                  <UserCheck2Icon className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg">
                    Selecciona un administrador para gestionar sus permisos
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>):(<div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay administradores registrados</p>
                </div>
              )}</>
      )}
    </div>
  );
}

export default PermisosSection;
