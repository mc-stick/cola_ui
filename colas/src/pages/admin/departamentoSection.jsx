import { useState } from "react";
import {
  Briefcase,
  Plus,
  Save,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal, TabSpinner } from "../../components/loading";

function DepartamentoSection({ 
  departamento, 
  LoadingSpin, 
  onGuardarDepartamento,
  onEliminarDepartamento,
  onSwitchDepartamento,
  validarDepartamento
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [open, setOpen] = useState(null);

  const handleCrearDepartamento = () => {
    setEditando("nuevo");
    setFormulario({ nombre: "" });
  };

  const handleGuardar = async () => {
    if (!validarDepartamento(formulario, editando)) return;
    await onGuardarDepartamento(formulario, editando);
    setEditando(null);
    setFormulario({});
  };

  const handleEliminar = async (id) => {
    await onEliminarDepartamento(id);
    setOpen(null);
  };

  return (
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)] rounded-3xl shadow-xl p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Departamentos
        </h2>

        <button
          onClick={handleCrearDepartamento}
          disabled={LoadingSpin}
          className="flex items-center gap-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] disabled:bg-[var(--color-mono-silver)] disabled:cursor-not-allowed text-[var(--color-mono-white)] px-6 py-3 rounded-2xl font-semibold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Departamento
        </button>
      </div>

      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-10"></div>

      {/* Modal flotante */}
      {editando && (
        <div className="fixed backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white/90 p-8 rounded-3xl shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="absolute top-4 right-4 text-[var(--color-mono-white)] hover:text-[var(--color-primary-red)] transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-[var(--color-primary-blue)]">
              {editando === "nuevo" ? "Crear Departamento" : "Editar Departamento"}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formulario.nombre || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, nombre: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[var(--color-mono-silver)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 text-lg transition"
                placeholder="Nombre del departamento"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={handleGuardar}
                className="flex items-center gap-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)] text-[var(--color-mono-white)] px-6 py-2 rounded-2xl font-semibold transition shadow-md"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>

              <button
                onClick={() => {
                  setEditando(null);
                  setFormulario({});
                }}
                className="flex items-center gap-2 bg-[var(--color-mono-silver)] hover:bg-[var(--color-mono-black)] hover:text-[var(--color-mono-white)] text-[var(--color-mono-black)] px-6 py-2 rounded-2xl font-semibold transition"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listado de departamentos */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {LoadingSpin ? (
          <div className="flex justify-center py-20">
            <TabSpinner />
          </div>
        ) : departamento.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-mono-silver)]">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
            <p className="text-lg font-bold text-[var(--color-primary-blue)]">
              No hay Departamentos registrados
            </p>
            <p className="text-sm mt-2 text-[var(--color-primary-blue)]/80">
              Haz clic en "Nuevo Departamento" para agregar uno
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departamento.map((dep) => (
              <div
                key={dep.id}
                className="flex flex-col justify-between p-4 bg-gradient-to-tr from-white to-[var(--color-mono-white)] rounded-3xl shadow-lg hover:shadow-xl transition-all border-t-4 border-transparent"
                style={{ borderTopColor: dep.color }}
              >
                <div className="flex justify-between items-start ">
                  <h3 className="text-xl font-extrabold text-[var(--color-primary-blue)]">
                    {dep.nombre}
                  </h3>
                  
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setEditando(dep.id);
                      setFormulario(dep);
                    }}
                    className="p-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-white rounded-xl transition shadow-md"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setOpen(dep.id)}
                    className="p-2 bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-yellow-dark)] text-white rounded-xl transition shadow-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmModal
        open={open !== null}
        title="¿Estás seguro de eliminar este Departamento?"
        message="Esta acción no se puede deshacer, todos los elementos vinculados a este Departamento serán eliminados permanentemente."
        onCancel={() => setOpen(null)}
        onConfirm={() => handleEliminar(open)}
      />
    </div>
  );
}

export default DepartamentoSection;