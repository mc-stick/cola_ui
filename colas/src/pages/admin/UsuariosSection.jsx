import { useState } from "react";
import { Users, Plus, Save, X, Edit, Check, TrashIcon } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function UsuariosSection({ 
  usuarios, 
  puestos,
  LoadingSpin, 
  onGuardarUsuario,
  onSwitchUser,
  onDeleteUser,
  validarUsuario
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [value, setValue] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const allowedPrefixes = ["809", "829", "849"];
    setValue(false);

    if (inputValue.length <= 10) {
      if (inputValue.length >= 3) {
        const prefix = inputValue.slice(0, 3);
        if (allowedPrefixes.includes(prefix)) {
          setFormulario({ ...formulario, tel: inputValue });
        } else {
          setValue(true);
        }
      } else {
        setFormulario({ ...formulario, tel: inputValue });
      }
    }
  };

  const handleCrearUsuario = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      username: "",
      password: "",
      tel: "",
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          Usuarios
        </h2>
        <button
          onClick={handleCrearUsuario}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {editando && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editando === "nuevo" ? "Crear Usuario" : "Editar Usuario"}
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
                  setFormulario({ ...formulario, nombre: e.target.value })
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
                  setFormulario({ ...formulario, username: e.target.value })
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
                  setFormulario({ ...formulario, password: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder={
                  editando !== "nuevo" ? "(dejar vacío para no cambiar)" : ""
                }
              />
            </div>
            <div>
              <label
                className={`block text-sm font-semibold ${
                  value ? "text-red-600" : "text-gray-700"
                } mb-2`}>
                Número de teléfono {value ? "(incorrecto)" : ""}
              </label>
              <input
                type="text"
                value={formulario.tel || ""}
                onChange={handleChange}
                placeholder="Ingresa un número"
                className={`w-full px-4 py-2 border-2 ${
                  value ? "border-red-600 focus:border-red-600" : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-blue-600`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={formulario.rol || "operador"}
                onChange={(e) =>
                  setFormulario({ ...formulario, rol: e.target.value })
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
                    setFormulario({ ...formulario, puesto_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
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
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
                setValue(false);
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
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
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay usuarios registrados</p>
            <p className="text-sm mt-2">
              Haz clic en "Nuevo Usuario" para agregar uno
            </p>
          </div>
        ) : (
          usuarios.map((usuario) => (<>
            {usuario.id === 1 ? "" :
            <div
              key={usuario.id}
              className={`flex items-center justify-between p-6 ${
                usuario.rol === "admin"
                  ? "bg-warning text-orange-700"
                  : "bg-blue-100 text-blue-700"
              } rounded-xl`}>
              <div>
                <h3 className="text-xl font-bold justify-between text-gray-800">
                  <span className={`${usuario.user_active ? "" : "line-through text-red-500"}`}>
                    <span className="text-black">{usuario.nombre}</span></span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold m-4 ${
                      usuario.user_active ? "text-green-700" : "text-red-700"
                    }`}>
                    {usuario.user_active ? "Activo" : "Inactivo"}
                  </span>
                </h3>
                <p className="text-gray-600">Usuario: {usuario.username}</p>
                <div className="flex gap-4 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      usuario.rol === "admin"
                        ? "bg-warning text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                    {usuario.rol === "admin" ? "Administrador" : "Operador"}
                  </span>
                  {usuario.puesto_numero && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold ">
                      Asignado a: <span className=" text-green-700 underline">{usuario.puesto_nombre}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  title={usuario.user_active ? "Deshabilitar" : "Habilitar"}
                  onClick={() => onSwitchUser(usuario.id)}
                  className={`p-2 ${
                    usuario.user_active
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg transition-colors`}>
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
                  className="p-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteUser(usuario.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>}</>
          ))
        )}
      </div>
    </div>
  );
}

export default UsuariosSection;