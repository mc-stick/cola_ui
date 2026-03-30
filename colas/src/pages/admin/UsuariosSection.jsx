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

  const handleGuardar = async () => {
    if (!validarUsuario(formulario, editando)) return;
    await onGuardarUsuario(formulario, editando);
    setEditando(null);
    setFormulario({});
  };

  return (
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Usuarios
        </h2>
       
      </div>

      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-10"></div>

      {/* Modal flotante */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-[var(--color-primary-blue)]">
              {editando === "nuevo" ? "Crear Usuario" : "Editar Usuario"}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formulario.nombre || ""}
                  readOnly
                  className="w-full cursor-not-allowed px-4 py-3 border-2 border-[var(--color-secondary-blue-dark)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formulario.username || ""}
                  readOnly
                  className="w-full px-4 cursor-not-allowed py-3 border-2 border-[var(--color-secondary-blue-dark)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                  Rol
                </label>
                <select
                  value={formulario.rol || 2}
                  onChange={(e) =>
                    setFormulario({ ...formulario, rol: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer px-4 py-3 border-2 border-[var(--color-secondary-blue-dark)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] text-lg"
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Operador</option>
                </select>
              </div>

              {formulario.rol === 2 && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                    Puesto Asignado
                  </label>
                  <select
                    value={formulario.puesto_id || ""}
                    onChange={(e) =>
                      setFormulario({ ...formulario, puesto_id: e.target.value })
                    }
                    className="w-full cursor-pointer px-4 py-3 border-2 border-[var(--color-secondary-blue-dark)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] text-lg"
                  >
                    <option value="" disabled>No asignado</option>
                    {puestos.filter(p => p.puesto_active).map(puesto => (
                      <option key={puesto.id} value={puesto.id}>
                        {puesto.numero} - {puesto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleGuardar}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-2xl font-semibold transition shadow-md"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditando(null);
                  setFormulario({});
                }}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded-2xl font-semibold transition"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {LoadingSpin ? (
          <div className="flex justify-center py-20">
            <TabSpinner />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-mono-silver)]">
            <Users className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
            <p className="text-lg font-bold text-[var(--color-primary-blue)]">
              No hay usuarios registrados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuarios.filter(u => u.id !== 1).map(usuario => (
              <div
                key={usuario.id}
                className={`flex justify-between p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all ${
                  usuario.rol === 1 ? "bg-orange-50 text-orange-800" : "bg-blue-50 text-blue-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="p-2 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {usuario.activo ? (
                      usuario.rol === 1 ? <ShieldCheckIcon className="w-6 h-6 text-yellow-600" /> : <UserCheck2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <PlusCircleIcon className="w-6 h-6 text-red-600 rotate-45" />
                    )}
                  </span>
                  <div>
                    <p className="font-bold text-lg">{usuario.nombre}</p>
                    <p className="text-sm text-gray-500">@{usuario.username}</p>
                    {usuario.puesto_nombre && (
                      <p className="text-sm text-green-700">Asignado a: {usuario.puesto_nombre}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${usuario.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span className="py-1 text-xs font-bold">{usuario.rol === 1 ? "Administrador" : "Operador"}</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onSwitchUser(usuario.id)}
                      className={`p-2 rounded-lg text-white ${usuario.activo ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    >
                      {usuario.activo ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { setEditando(usuario.id); setFormulario({ ...usuario, password: "" }); }}
                      className="p-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-white rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(usuario.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsuariosSection;