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
    <div className="bg-[var(--color-mono-white)] rounded-3xl shadow-xl p-10 border border-[var(--color-mono-silver)]/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-[var(--color-primary-blue)] flex items-center gap-3">
          <MapPin className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Puestos
        </h2>
        <button
          onClick={handleCrearPuesto}
          className="flex items-center gap-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] px-6 py-3 rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Puesto
        </button>
      </div>
<div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-10"></div>
      {editando && (
        <div className="bg-[var(--color-secondary-blue-light)]/10 p-6 rounded-2xl mb-6">
          <h3 className="text-xl font-bold mb-4 text-[var(--color-primary-blue)]">
            {editando === "nuevo" ? "Crear Puesto" : "Editar Puesto"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-primary-blue)] mb-2">
                Número
              </label>
              <input
                type="text"
                value={formulario.numero || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, numero: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
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
                className="w-full px-4 py-2 border-2 border-[var(--color-secondary-blue-dark)] rounded-lg focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGuardar}
              className="flex items-center gap-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)] text-[var(--color-mono-white)] px-6 py-2 rounded-lg font-semibold transition-colors">
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="flex items-center gap-2 bg-[var(--color-mono-black)] hover:bg-[var(--color-mono-silver)] text-[var(--color-mono-white)] px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div
        className={`${LoadingSpin ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
        {LoadingSpin ? (
          <TabSpinner />
        ) : puestos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--color-mono-silver)]">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-[var(--color-mono-gold)]" />
            <p className="text-lg font-semibold text-[var(--color-primary-blue)]">
              No hay puestos registrados
            </p>
            <p className="text-sm mt-2 text-[var(--color-primary-blue)]/80">
              Haz clic en "Nuevo Puesto" para agregar uno
            </p>
          </div>
        ) : (
          puestos.map((puesto) => (
            <div
              key={puesto.id}
              className="p-6 bg-[var(--color-secondary-blue-light)]/20 rounded-2xl border-l-4"
              style={{
                borderLeftColor: puesto.color || "var(--color-primary-blue)",
              }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{
                      color: puesto.color || "var(--color-primary-blue)",
                    }}>
                    {puesto.numero}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-primary-blue)]">
                    {puesto.nombre}
                  </h3>
                </div>
                <div className="flex justify-around m-2 gap-2">
                  <button
                    title={puesto.puesto_active ? "Deshabilitar" : "Habilitar"}
                    onClick={() => onSwitchPuesto(puesto.id)}
                    className={`p-2 ${
                      puesto.puesto_active
                        ? "bg-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green-dark)]"
                        : "bg-[var(--color-primary-red)] hover:bg-[var(--color-secondary-red-dark)]"
                    } text-[var(--color-mono-white)] rounded-lg transition-colors`}>
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
                    className="p-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] rounded-lg transition-colors">
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
