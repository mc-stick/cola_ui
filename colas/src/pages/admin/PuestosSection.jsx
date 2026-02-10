import { useState } from "react";
import { MapPin, Plus, Save, X, Edit, Check } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function PuestosSection({ 
  puestos, 
  LoadingSpin, 
  onGuardarPuesto,
  onSwitchPuesto,
  validarPuesto
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});

  const handleCrearPuesto = () => {
    setEditando("nuevo");
    setFormulario({
      numero: "",
      nombre: "",
    });
  };

  const handleGuardar = async () => {
    if (!validarPuesto(formulario)) {
      return;
    }
    await onGuardarPuesto(formulario, editando);
    setEditando(null);
    setFormulario({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-orange-600" />
          Puestos
        </h2>
        <button
          onClick={handleCrearPuesto}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Puesto
        </button>
      </div>

      {editando && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editando === "nuevo" ? "Crear Puesto" : "Editar Puesto"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                value={formulario.numero || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, numero: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre
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
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className={`${LoadingSpin ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}`}>
        {LoadingSpin ? (
          <TabSpinner />
        ) : puestos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay puestos registrados</p>
            <p className="text-sm mt-2">
              Haz clic en "Nuevo Puesto" para agregar uno
            </p>
          </div>
        ) : (
          puestos.map((puesto) => (
            <div
              key={puesto.id}
              className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {puesto.numero}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {puesto.nombre}
                  </h3>
                </div>
                <div className="flex justify-around m-2">
                  <button
                    title={puesto.puesto_active ? "Deshabilitar" : "Habilitar"}
                    onClick={() => onSwitchPuesto(puesto.id)}
                    className={`p-2 ${
                      puesto.puesto_active
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white rounded-lg transition-colors`}>
                    {puesto.puesto_active ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditando(puesto.id);
                      setFormulario(puesto);
                    }}
                    className="p-2 bg-primary ml-2 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PuestosSection;