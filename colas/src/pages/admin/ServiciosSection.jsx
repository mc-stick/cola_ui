import { useState } from "react";
import {
  Briefcase,
  Plus,
  Save,
  X,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal, TabSpinner } from "../../components/loading";

function ServiciosSection({ 
  servicios, 
  LoadingSpin, 
  onGuardarServicio,
  onEliminarServicio,
  onSwitchServicio,
  validarServicio
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [open, setOpen] = useState(null);

  const handleCrearServicio = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      descripcion: "",
      codigo: "",
      color: "#1E40AF",
      tiempo_promedio: 15,
    });
  };

  const handleGuardar = async () => {
    if (!validarServicio(formulario, editando)) {
      return;
    }
    await onGuardarServicio(formulario, editando);
    setEditando(null);
    setFormulario({});
  };

  const handleEliminar = async (id) => {
    await onEliminarServicio(id);
    setOpen(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-orange-600" />
          Servicios
        </h2>
        <button
          onClick={handleCrearServicio}
          disabled={LoadingSpin}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {editando && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editando === "nuevo" ? "Crear Servicio" : "Editar Servicio"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código
              </label>
              <input
                type="text"
                value={formulario.codigo || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, codigo: e.target.value })
                }
                disabled={editando !== "nuevo"}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={formulario.color || "#1E40AF"}
                onChange={(e) =>
                  setFormulario({ ...formulario, color: e.target.value })
                }
                className="w-full h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiempo Promedio (min)
              </label>
              <input
                type="number"
                value={formulario.tiempo_promedio || 15}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    tiempo_promedio: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formulario.descripcion || ""}
              onChange={(e) =>
                setFormulario({ ...formulario, descripcion: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              rows={3}
            />
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

      <div className="space-y-4">
        {LoadingSpin ? (<div className="flex justify-center text-center">
          <TabSpinner /></div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay servicios registrados</p>
            <p className="text-sm mt-2">
              Haz clic en "Nuevo Servicio" para agregar uno
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-l-4"
              style={{ borderLeftColor: servicio.color }}>
              <div className="flex items-center gap-4">
                <div
                  className="text-3xl font-bold"
                  style={{ color: servicio.color }}>
                  {servicio.codigo}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {servicio.nombre}
                  </h3>
                  <p className="text-gray-600">{servicio.descripcion}</p>
                  <p className="text-sm text-gray-500">
                    Tiempo promedio: {servicio.tiempo_promedio} min
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                    servicio.service_active ? "bg-green-600" : "bg-red-600"
                  }`}>
                  {servicio.service_active ? "Activo" : "Desactivado"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSwitchServicio(servicio.id, servicio.service_active)}
                  className={`p-2 ${
                    servicio.service_active
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg transition-colors`}>
                  {servicio.service_active ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditando(servicio.id);
                    setFormulario(servicio);
                  }}
                  className="p-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setOpen(servicio.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}</div>
        )}

        <ConfirmModal
          open={open !== null}
          title="¿Estás seguro de eliminar este servicio?"
          message="Esta acción no se puede deshacer, todos los elementos vinculados a este servicio serán eliminados permanentemente."
          onCancel={() => setOpen(null)}
          onConfirm={() => handleEliminar(open)}
        />
      </div>
    </div>
  );
}

export default ServiciosSection;