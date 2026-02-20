import { useState } from "react";
import {
  Users,
  Plus,
  Save,
  X,
  Edit,
  Check,
  TrashIcon,
  ShieldCheckIcon,
  UserCheck2,
  PlusCircleIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function UsuariosSection({
  usuarios,
  puestos,
  LoadingSpin,
  onGuardarUsuario,
  onSwitchUser,
  onDeleteUser,
  validarUsuario,
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [value, setValue] = useState(false);

  // const handleChange = (e) => {
  //   const inputValue = e.target.value;
  //   const allowedPrefixes = ["809", "829", "849"];
  //   setValue(false);

  //   if (inputValue.length <= 10) {
  //     if (inputValue.length >= 3) {
  //       const prefix = inputValue.slice(0, 3);
  //       if (allowedPrefixes.includes(prefix)) {
  //         setFormulario({ ...formulario, tel: inputValue });
  //       } else {
  //         setValue(true);
  //       }
  //     } else {
  //       setFormulario({ ...formulario, tel: inputValue });
  //     }
  //   }
  // };

  const handleCrearUsuario = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      username: "",
      password: "",
      tel: "0000000000",
      rol: "operador",
      puesto_id: puestos.filter((p) => p.puesto_active)[0]?.id || "",
    });
  };

  const handleGuardar = async () => {
    if (!validarUsuario(formulario, editando)) {
      return;
    }
    await onGuardarUsuario(formulario, editando);
    setEditando(null);
    setFormulario({});
    setValue(false);
  };

  return (
    <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Usuarios
        </h2>
      </div>
      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5"></div>
      {editando && (
        <div className="bg-[var(--color-secondary-blue-light)]/10 p-6 rounded-2xl mb-6">
          <h3 className="text-xl font-bold mb-4 text-[var(--color-primary-blue)]">
            {editando === "nuevo" ? "Crear Usuario" : "Editar Usuario"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                readOnly
                value={formulario.nombre || ""}
                className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                Usuario
              </label>
              <input
                type="text"
                readOnly
                value={formulario.username || ""}
                className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                Rol
              </label>
              <select
                value={formulario.rol || "operador"}
                onChange={(e) =>
                  setFormulario({ ...formulario, rol: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]">
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
              </select>
            </div>
            {formulario.rol === "operador" && (
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                  Puesto Asignado
                </label>
                <select
                  value={formulario.puesto_id || ""}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      puesto_id:
                        formulario.rol !== "operador" ? "" : e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]">
                  <option value="" disabled>
                    No asignado
                  </option>
                  {puestos
                    .filter((puesto) => puesto.puesto_active)
                    .map((puesto) => (
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
              onClick={handleGuardar}
              className="flex items-center gap-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)] text-[var(--color-mono-white)] px-6 py-2 rounded-lg font-semibold transition-colors">
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
                setValue(false);
              }}
              className="flex items-center gap-2 bg-[var(--color-mono-black)] hover:bg-[var(--color-mono-silver)] text-[var(--color-mono-white)] px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {LoadingSpin ? (
          <TabSpinner />
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-mono-silver)]">
            <Users className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
            <p className="text-lg font-semibold text-[var(--color-primary-blue)]">
              No hay usuarios registrados
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {usuarios.map(
              (usuario) =>
                usuario.id !== 1 && (
                  <div
                    key={usuario.id}
                    className={`flex items-center justify-between p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 ${
                      usuario.rol === "admin"
                        ? "bg-warning text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`relative p-2 rounded-full text-xs border font-bold ${
                            usuario.user_active
                              ? usuario.rol === "admin"
                                ? "bg-green-50 text-[var(--color-mono-gold)] border-azul-claro"
                                : "bg-green-50 text-green-600 border-azul-claro"
                              : "bg-red-50 text-red-600 border-red-600"
                          }`}>
                          {usuario.user_active ? (
                            usuario.rol === "admin" ? (
                              <ShieldCheckIcon className="w-8 h-8 text-[var(--color-mono-gold)]" />
                            ) : (
                              <UserCheck2 className="w-8 h-8 text-green-500" />
                            )
                          ) : (
                            <PlusCircleIcon className="w-8 h-8 rotate-45 text-red-500" />
                          )}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 block max-w-48 break-words">
                          {usuario.nombre}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          usuario.user_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {usuario.user_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <p className="text-sm text-gray-600">
                        Usuario:{" "}
                        <span className="font-medium text-gray-800">
                          {usuario.username}
                        </span>
                      </p>
                      <span
                        className={`py-1 rounded-full text-xs font-black ${
                          usuario.rol === "admin"
                            ? "bg-warning text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                        {usuario.rol === "admin" ? "Administrador" : "Operador"}
                      </span>
                      {usuario.puesto_numero && (
                        <span className="text-sm text-gray-800">
                          Asignado a:{" "}
                          <span className="text-green-700 underline">
                            {usuario.puesto_nombre}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 items-center">
                      <button
                        title={
                          usuario.user_active ? "Deshabilitar" : "Habilitar"
                        }
                        onClick={() => onSwitchUser(usuario.id)}
                        className={`p-2 rounded-lg text-white transition-colors ${
                          usuario.user_active
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}>
                        {usuario.user_active ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditando(usuario.id);
                          setFormulario({ ...usuario, password: "" });
                        }}
                        className="p-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => onDeleteUser(usuario.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsuariosSection;
