import { useState } from "react";
import { Briefcase, Plus, Save, X, Edit, Trash2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal, TabSpinner } from "../../components/loading";

function ServiciosSection({
  servicios,
  departamentos,
  LoadingSpin,
  onGuardarServicio,
  onEliminarServicio,
  onSwitchServicio,
  validarServicio,
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
      dep: "",
    });
  };

  const handleGuardar = async () => {
    if (!validarServicio(formulario, editando)) {
      return;
    }

    const data = {
      ...formulario,
      departamento_id: formulario.dep || null,
    };

    await onGuardarServicio(data, editando);

    setEditando(null);
    setFormulario({});
  };

  const handleEliminar = async (id) => {
    await onEliminarServicio(id);
    setOpen(null);
  };

  //console.log(departamentos, servicios);

  return (
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)]  rounded shadow-xl p-10 ">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Servicios
        </h2>

        <button
          onClick={handleCrearServicio}
          disabled={LoadingSpin}
          className="flex items-center gap-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] disabled:bg-[var(--color-mono-silver)] disabled:cursor-not-allowed text-[var(--color-mono-white)] px-6 py-3 rounded-2xl font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>
      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-10"></div>
      {editando && (
        <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/80 rounded-3xl p-8 sm:p-12 max-w-2xl w-full mx-4 shadow-xl animate-bounce-in">
            <h3 className="text-2xl font-extrabold mb-6 text-[var(--color-primary-blue)] text-center">
              {editando === "nuevo" ? "Crear Servicio" : "Editar Servicio"}
            </h3>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)]">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formulario.nombre || ""}
                  onChange={(e) =>
                    setFormulario({ ...formulario, nombre: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 transition"
                  placeholder="Nombre del servicio"
                />
              </div>

              {/* Código */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)]">
                  Código
                </label>
                <input
                  type="text"
                  value={formulario.codigo || ""}
                  onChange={(e) =>
                    setFormulario({ ...formulario, codigo: e.target.value })
                  }
                  disabled={editando !== "nuevo"}
                  maxLength={10}
                  className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] disabled:bg-[var(--color-mono-silver)]/30 transition"
                  placeholder="Código interno"
                />
              </div>

              {/* Departamento */}
              <div className="space-y-1 col-span-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Departamento
                </label>
                <select
                  value={formulario.dep || ""}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      dep: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 transition"
                >
                  <option value="">No asignado</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div className="space-y-1 col-span-1 mr-[70%]">
                <label className="block text-sm font-semibold text-[var(--color-primary-blue)]">
                  Color
                </label>
                <input
                  type="color"
                  value={formulario.color || "#1e2a4f"}
                  onChange={(e) =>
                    setFormulario({ ...formulario, color: e.target.value })
                  }
                  className="h-10 w-10 border-2 border-[var(--color-mono-silver)] rounded-full p-1 cursor-pointer transition"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-6 space-y-1">
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)]">
                Descripción
              </label>
              <textarea
                value={formulario.descripcion || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, descripcion: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 transition"
                placeholder="Agrega detalles sobre el servicio"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={handleGuardar}
                className="flex items-center gap-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)] text-[var(--color-mono-white)] px-6 py-2 rounded-2xl font-semibold transition shadow-lg"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>

              <button
                onClick={() => {
                  setEditando(null);
                  setFormulario({});
                }}
                className="flex items-center gap-2 bg-[var(--color-mono-silver)] hover:bg-[var(--color-mono-black)] hover:text-[var(--color-mono-white)] text-[var(--color-mono-black)] px-6 py-2 rounded-2xl font-semibold transition shadow-sm"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {LoadingSpin ? (
          <div className="flex justify-center text-center">
            <TabSpinner />
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-mono-silver)]">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
            <p className="text-lg text-[var(--color-primary-blue)] font-semibold">
              No hay servicios registrados
            </p>
            <p className="text-sm mt-2">
              Haz clic en "Nuevo Servicio" para agregar uno
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between"
              >
                {/* IZQUIERDA */}
                <div className="flex items-center gap-5">
                  {/* Código tipo badge */}
                  <div
                    className="px-4 py-2 rounded-xl font-extrabold text-lg"
                    style={{
                      backgroundColor: `${servicio.color}20`,
                      color: servicio.color,
                    }}
                  >
                    {servicio.codigo}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--color-primary-blue)]">
                      {servicio.nombre}
                    </h3>

                    <p className="text-xs text-gray-400">
                      {departamentos.find((d) => d.id === servicio.departamento)
                        ?.nombre || "No asignado"}
                    </p>

                    <p className="text-xs text-gray-500 italic mt-1 line-clamp-1">
                      {servicio.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  {/* Estado badge */}
                  <span
                    className={`ml-4 px-3 py-1 rounded-lg text-xs font-semibold ${
                      servicio.service_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {servicio.service_active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* DERECHA - acciones */}
                <div className="flex items-center gap-2">
                  {/* Activar / Desactivar */}
                  <button
                    onClick={() =>
                      onSwitchServicio(servicio.id, servicio.service_active)
                    }
                    className={`p-2 rounded-lg transition-all ${
                      servicio.service_active
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    {servicio.service_active ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => {
                      setEditando(servicio.id);
                      setFormulario({
                        ...servicio,
                        dep: servicio.departamento || "",
                      });
                    }}
                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => setOpen(servicio.id)}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
