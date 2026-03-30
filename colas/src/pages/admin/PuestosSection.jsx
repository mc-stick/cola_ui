import { useState } from "react";
import { MapPin, Plus, Save, X, Edit, Check } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function PuestosSection({
  puestos,
  LoadingSpin,
  onGuardarPuesto,
  onSwitchPuesto,
  validarPuesto,
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});

  const handleCrearPuesto = () => {
    setEditando("nuevo");
    setFormulario({
      // numero: "",
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
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)] rounded shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-white" />
          Puestos
        </h2>
        <button
          onClick={handleCrearPuesto}
          className="flex items-center gap-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Puesto
        </button>
      </div>
      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5"></div>
      {editando && (
        <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 shadow-xl animate-bounce-in relative">
            {/* Botón cerrar flotante */}
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-extrabold mb-6 text-[var(--color-primary-blue)] text-center">
              {editando === "nuevo" ? "Crear Puesto" : "Editar Puesto"}
            </h3>

            {/* Formulario */}
            <div className="space-y-6">
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
                  className="w-full px-4 py-3 border-2 border-[var(--color-mono-silver)] rounded-2xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 transition"
                  placeholder="Nombre del puesto"
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
        </div>
      )}
      

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
  {LoadingSpin ? (
    <TabSpinner />
  ) : puestos.length === 0 ? (
    <div className="text-center py-20 text-[var(--color-mono-silver)]">
      <MapPin className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
      <p className="text-lg text-[var(--color-primary-blue)] font-bold">
        No hay puestos registrados
      </p>
      <p className="text-sm mt-2 text-[var(--color-primary-blue)]/80">
        Haz clic en "Nuevo Puesto" para agregar uno
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {puestos.map((puesto) => (
        <div
          key={puesto.id}
          className="flex flex-col justify-between p-5 bg-gradient-to-tr from-white to-[var(--color-mono-silver)] rounded-3xl shadow-lg hover:shadow-xl transition-all border-t-4 border-transparent"
          style={{
            borderTopColor: puesto.color || "var(--color-primary-blue)",
            opacity: puesto.puesto_active ? 1 : 0.6,
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-extrabold text-[var(--color-primary-blue)]">
              {puesto.nombre}
            </h3>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                puesto.puesto_active
                  ? "bg-[var(--color-primary-green)]"
                  : "bg-[var(--color-primary-red)]"
              }`}
            >
              {puesto.puesto_active ? "Activo" : "Desactivado"}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
                       <div className="flex gap-2">
              <button
                title={puesto.puesto_active ? "Deshabilitar" : "Habilitar"}
                onClick={() => onSwitchPuesto(puesto.id)}
                className={`p-2 rounded-xl text-white transition shadow-md ${
                  puesto.puesto_active
                    ? "bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)]"
                    : "bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-yellow-dark)]"
                }`}
              >
                {puesto.puesto_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  setEditando(puesto.id);
                  setFormulario(puesto);
                }}
                className="p-2 bg-[var(--color-primary-yellow)] hover:bg-[var(--color-secondary-blue-dark)] hover:text-white text-[var(--color-mono-black)] rounded-xl shadow-md transition-colors"
              >
                <Edit className="w-5 h-5" />
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

export default PuestosSection;
