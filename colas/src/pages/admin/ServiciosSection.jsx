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
   <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/40">
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] flex items-center gap-3">
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
    <div className="bg-[var(--color-secondary-blue-light)]/10 border border-[var(--color-secondary-blue-light)]/30 p-8 rounded-2xl mb-8 shadow-sm">
      <h3 className="text-2xl font-bold mb-6 text-[var(--color-primary-blue)]">
        {editando === "nuevo" ? "Crear Servicio" : "Editar Servicio"}
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={formulario.nombre || ""}
            onChange={(e) =>
              setFormulario({ ...formulario, nombre: e.target.value })
            }
            className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
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
            className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-[var(--color-primary-blue)] disabled:bg-[var(--color-mono-silver)]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
            Color
          </label>
          <input
            type="color"
            value={formulario.color || "#1e2a4f"}
            onChange={(e) =>
              setFormulario({ ...formulario, color: e.target.value })
            }
            className="w-full h-10 border-2 border-[var(--color-mono-silver)] rounded-xl cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
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
            className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
          Descripción
        </label>
        <textarea
          value={formulario.descripcion || ""}
          onChange={(e) =>
            setFormulario({ ...formulario, descripcion: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-[var(--color-primary-blue)]"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGuardar}
          className="flex items-center gap-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)] text-[var(--color-mono-white)] px-6 py-2 rounded-xl font-semibold transition shadow-md"
        >
          <Save className="w-5 h-5" />
          Guardar
        </button>

        <button
          onClick={() => {
            setEditando(null);
            setFormulario({});
          }}
          className="flex items-center gap-2 bg-[var(--color-mono-silver)] hover:bg-[var(--color-mono-black)] hover:text-[var(--color-mono-white)] text-[var(--color-mono-black)] px-6 py-2 rounded-xl font-semibold transition"
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
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
            className="flex items-center justify-between p-6 bg-[var(--color-mono-white)] rounded-2xl border shadow-sm hover:shadow-md transition"
            style={{ borderLeft: `6px solid ${servicio.color}` }}
          >
            <div className="flex items-center gap-6">
              <div
                className="text-3xl font-extrabold"
                style={{ color: servicio.color }}
              >
                {servicio.codigo}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--color-primary-blue)]">
                  {servicio.nombre}
                </h3>
                <p className="text-[var(--color-mono-black)]/70">
                  {servicio.descripcion}
                </p>
                <p className="text-sm text-[var(--color-mono-black)]/50">
                  Tiempo promedio: {servicio.tiempo_promedio} min
                </p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold text-white ${
                  servicio.service_active
                    ? "bg-[var(--color-primary-green)]"
                    : "bg-[var(--color-primary-red)]"
                }`}
              >
                {servicio.service_active ? "Activo" : "Desactivado"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  onSwitchServicio(servicio.id, servicio.service_active)
                }
                className={`p-2 rounded-xl text-white transition ${
                  servicio.service_active
                    ? "bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)]"
                    : "bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-yellow-dark)]"
                }`}
              >
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
                className="p-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-white rounded-xl transition"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => setOpen(servicio.id)}
                className="p-2 bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-yellow-dark)] text-white rounded-xl transition"
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