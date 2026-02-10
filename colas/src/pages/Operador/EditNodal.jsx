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
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full mx-4 shadow-xl animate-bounce-in">
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">Configuración</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                disabled
                value={usuario.nombre || ""}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                disabled
                value={usuario.username || ""}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full px-4 py-2 border-2 ${
                  formulario.pass?.length < 5 || 0
                    ? "border-red-400"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-blue-600`}
                placeholder={"dejar vacío no cambia"}
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
                placeholder={usuario.tel || "Ingresa un número de teléfono"}
                className={`w-full px-4 py-2 border-2 ${
                  value
                    ? "border-red-600 focus:border-red-600"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-blue-600`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGuardarUsuario}
              disabled={passLength < 5 && telLength < 10}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors 
                ${
                  passLength < 5 && telLength < 10
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}>
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditOpen(false);
                setFormulario({});
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};