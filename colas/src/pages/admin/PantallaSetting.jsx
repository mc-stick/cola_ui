import { useState, useEffect } from "react";
import { Monitor, Plus, Pencil, Trash2, AlertCircleIcon, X, Save, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/loading"; // Asegúrate de que la ruta sea correcta
import API from "../../services/api";

const colors = {
  primaryBlue: "#1e2a4f",
  primaryRed: "#cc132c",
  primaryYellow: "#fad824",
  primaryGreen: "#499c35",
  secondaryBlueDark: "#006ca1",
  secondaryBlueLight: "#4ec2eb",
  monoSilver: "#b2b2b2",
};

function PantallasSection() {
  const [pantallas, setPantallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", token: "" });
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargarPantallas = async () => {
    try {
      const data = await API.getPantallas();
      setPantallas(data || []);
    } catch {
      toast.error("Error al cargar pantallas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPantallas(); }, []);

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.token.trim()) {
      toast.error("Nombre y token son obligatorios");
      return;
    }
    try {
      if (editando && editando !== "nuevo") {
        await API.actualizarPantalla(editando, form.nombre, form.token);
        toast.success("Pantalla actualizada");
      } else {
        await API.crearPantalla(form.nombre, form.token);
        toast.success("Pantalla creada");
      }
      setEditando(null);
      setForm({ nombre: "", token: "" });
      await cargarPantallas();
    } catch {
      toast.error("Error al guardar pantalla");
    }
  };

  const handleEliminar = async (id) => {
    try {
      await API.eliminarPantalla(id);
      toast.success("Pantalla eliminada");
      setConfirmDelete(null);
      await cargarPantallas();
    } catch {
      toast.error("Error al eliminar pantalla");
    }
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col"
      style={{ borderColor: colors.monoSilver, height: "calc(100vh - 140px)" }}
    >
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }} />

      {/* HEADER FIJO */}
      <div className="p-8 md:p-6 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: colors.primaryBlue }}>
            Gestión de <span style={{ color: colors.secondaryBlueDark }}>pantallas</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestiona las pantallas del sistema</p>
        </div>
        <button
            onClick={() => { setEditando("nuevo"); setForm({ nombre: "", token: "" }); }}
            className="flex items-center gap-3 hover:scale-105 active:scale-95 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl uppercase text-xs tracking-widest"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <Plus className="w-5 h-5" />
            Nueva Pantalla
          </button>
        </div>
        
      </div>

      {/* ÁREA CON SCROLL */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 custom-scrollbar">
        {loading ? (
          <div className="py-20 flex justify-center opacity-20">
            <Monitor className="w-16 h-16 animate-pulse" />
          </div>
        ) : pantallas.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 flex flex-col justify-center items-center border border-dashed text-center">
            <Monitor className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-bold opacity-30 uppercase tracking-widest">Sin pantallas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {pantallas.map((p) => (
              <div
                key={p.id}
                className="group relative bg-slate-50 rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Línea lateral de acento */}
                <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full" style={{ backgroundColor: colors.secondaryBlueDark }}></div>

                <div className="pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dispositivo Activo</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-tight truncate">
                    {p.nombre}
                  </h3>
                  <div className="mt-2 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-blue-600">
                    ID: {p.token}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setEditando(p.id); setForm({ nombre: p.nombre, token: p.token }); }}
                    className="p-3 bg-white text-gray-400 hover:bg-[var(--color-secondary-blue-light)] hover:text-white rounded-xl shadow-sm transition-all"
                    style={{ '--color-secondary-blue-light': colors.secondaryBlueLight }}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="p-3 bg-white text-gray-400 hover:bg-[var(--color-primary-red)] hover:text-white rounded-xl shadow-sm transition-all"
                    style={{ '--color-primary-red': colors.primaryRed }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="px-12 py-4 bg-gray-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Total de pantallas: {pantallas.length} | El token identifica de forma única el hardware en la red.
        </span>
      </div>

      {/* MODAL DE EDICIÓN (REPLICADO DE DEPARTAMENTOS) */}
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
              {editando === "nuevo" ? "Nueva Pantalla" : "Editar Dispositivo"}
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Hardware y Visualización</p>

            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  autoFocus
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value.toUpperCase() })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-400 font-black text-lg uppercase transition-all"
                  placeholder="EJ: PANTALLA RECEPCIÓN"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Token (Identificador de Red)</label>
                <input
                  type="text"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-400 font-bold text-lg text-blue-600 transition-all"
                  placeholder="ej: pantalla-1"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                className="flex-1 flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:brightness-110 transition-all"
                style={{ backgroundColor: colors.primaryGreen }}
              >
                <Save className="w-5 h-5" /> Guardar Pantalla
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
        open={confirmDelete !== null}
        title="¿ELIMINAR PANTALLA?"
        message="Se perderá el enlace con el dispositivo físico y dejará de mostrar contenido."
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => handleEliminar(confirmDelete)}
      />
    </div>
  );
}

export default PantallasSection;