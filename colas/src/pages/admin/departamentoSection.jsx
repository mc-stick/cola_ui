import { useState } from "react";
import {
  Briefcase,
  Plus,
  Save,
  X,
  Edit,
  Trash2,
  AlertCircleIcon,
} from "lucide-react";
import { ConfirmModal, Spinner, TabSpinner } from "../../components/loading";

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

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryRed: "#cc132c",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    secondaryBlueDark: "#006ca1",
    secondaryBlueLight: "#4ec2eb",
    monoSilver: "#b2b2b2",
  };

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
    <div 
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col" 
      style={{ borderColor: colors.monoSilver, height: 'calc(100vh - 140px)' }}
    >
      {/* Barra superior de acento fijo */}
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER FIJO */}
      <div className="p-8 md:p-12 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase" style={{ color: colors.primaryBlue }}>
              Gestión de <span style={{ color: colors.secondaryBlueDark }}>Departamentos</span>
            </h2>
            <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: colors.primaryYellow }}></div>
          </div>
          
          <button
            onClick={handleCrearDepartamento}
            disabled={LoadingSpin}
            className="flex items-center gap-3 bg-[var(--color-primary-blue)] hover:scale-105 active:scale-95 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl uppercase text-xs tracking-widest"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <Plus className="w-5 h-5" />
            Nuevo Departamento
          </button>
        </div>
      </div>

      {/* ÁREA CON SCROLL (Listado) */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 custom-scrollbar">
        {LoadingSpin ? (
          <div className="py-20 flex justify-center">
            {/* <Spinner /> */}
            </div>
        ) : departamento.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 flex flex-col justify-center items-center border border-dashed text-center">
            <Briefcase className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-bold opacity-30 uppercase tracking-widest">No hay departamentos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {departamento.map((dep) => (
              <div
                key={dep.id}
                className="group relative bg-slate-200 rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Línea lateral de color */}
                <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full" style={{ backgroundColor: dep.color || colors.primaryBlue }}></div>
                
                <div className="pl-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Unidad Administrativa</span>
                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-tight truncate">
                    {dep.nombre}
                  </h3>
                </div>

                <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => { setEditando(dep.id); setFormulario(dep); }}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-[var(--color-secondary-blue-light)] hover:text-white rounded-xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setOpen(dep.id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-[var(--color-primary-red)] hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIVO FIJO */}
      <div className="px-12 py-4 bg-gray-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Total de unidades: {departamento.length} | Los cambios afectan la distribución de servicios.
        </span>
      </div>

      {/* MODAL DE EDICIÓN ESTILO BIENVENIDA */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border-t-[12px] relative" style={{ borderTopColor: colors.primaryYellow }}>
            <button 
              onClick={() => setEditando(null)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-black mb-2 italic uppercase tracking-tighter" style={{ color: colors.primaryBlue }}>
              {editando === "nuevo" ? "Nueva Unidad" : "Editar Unidad"}
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Estructura administrativa</p>

            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Nombre del Departamento</label>
                <input
                  type="text"
                  autoFocus
                  value={formulario.nombre || ""}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value.toUpperCase() })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[var(--color-secondary-blue-light)] font-black text-lg uppercase transition-all"
                  placeholder="EJ: ATENCIÓN AL CLIENTE"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                className="flex-1 flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:brightness-110 transition-all"
                style={{ backgroundColor: colors.primaryGreen }}
              >
                <Save className="w-5 h-5" /> Guardar Cambios
              </button>
              <button
                onClick={() => setEditando(null)}
                className="px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-gray-100 text-gray-400 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={open !== null}
        title="¿ELIMINAR DEPARTAMENTO?"
        message="Esta acción no se puede deshacer y desvinculará todos los servicios asociados."
        onCancel={() => setOpen(null)}
        onConfirm={() => handleEliminar(open)}
      />
    </div>
  );
}

export default DepartamentoSection;