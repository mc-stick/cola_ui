import { Save, X } from "lucide-react";

export const EditModal = ({
  usuario,
  formulario,
  setFormulario,
  value,
  handleChange,
  handleGuardarUsuario,
  setEditOpen,
}) => {
  const passLength = formulario.pass?.length || 0;
  const telLength = formulario.tel?.length || 0;

  return (
    <div className="fixed inset-0 bg-gray-800/90 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-xl w-full mx-4 shadow-xl animate-bounce-in">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-base font-bold mb-3">Configuración</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                disabled
                value={usuario.nombre || ""}
                className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                disabled
                value={usuario.username || ""}
                className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={formulario?.pass || ""}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    pass: e.target.value,
                  })
                }
                className={`w-full px-3 py-1.5 border-2 ${
                  formulario.pass?.length < 5 || 0
                    ? "border-red-400"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-blue-600 text-sm`}
                placeholder={"Sin cambios"}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold ${
                  value ? "text-red-600" : "text-gray-700"
                } mb-1`}>
                Teléfono {value ? "(error)" : ""}
              </label>
              <input
                type="text"
                value={formulario.tel || ""}
                onChange={handleChange}
                placeholder={usuario.tel || "Teléfono"}
                className={`w-full px-3 py-1.5 border-2 ${
                  value
                    ? "border-red-600 focus:border-red-600"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-blue-600 text-sm`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGuardarUsuario}
              disabled={passLength < 5 && telLength < 10}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-colors text-sm
                ${
                  passLength < 5 && telLength < 10
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}>
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditOpen(false);
                setFormulario({});
              }}
              className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};