import { useState } from "react";
import { Briefcase, Plus, Save, X, Edit, Trash2, Check, AlertCircleIcon, Layers } from "lucide-react";
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

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    primaryRed: "#cc132c",
    secondaryBlueDark: "#006ca1",
    monoSilver: "#b2b2b2",
  };

  const handleCrearServicio = () => {
    setEditando("nuevo");
    setFormulario({
      nombre: "",
      descripcion: "",
      codigo: "",
      color: "#1E40AF",
      dep: "",
      check: false,
    });
  };

  const handleGuardar = async () => {
    if (!validarServicio(formulario, editando)) return;
    const data = { ...formulario, departamento_id: formulario.dep || null };
    await onGuardarServicio(data, editando);
    setEditando(null);
    setFormulario({});
  };

  const handleEliminar = async (id) => {
    await onEliminarServicio(id);
    setOpen(null);
  };
  return (
    <div 
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col" 
      style={{ borderColor: colors.monoSilver, height: 'calc(100vh - 140px)' }}
    >
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER */}
      <div className="p-8 md:p-12 pb-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase" style={{ color: colors.primaryBlue }}>
            Gestión de <span style={{ color: colors.secondaryBlueDark }}>Servicios</span>
          </h2>
          <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: colors.primaryYellow }}></div>
        </div>

        <button
          onClick={handleCrearServicio}
          disabled={LoadingSpin}
          className="flex items-center gap-2 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
          style={{ backgroundColor: colors.primaryBlue }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      {/* CUERPO - LISTADO CON SCROLL */}
      <div className="flex-1 overflow-hidden px-8 md:px-12 pb-6">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center">
            {/* <TabSpinner /> */}
            </div>
        ) : servicios.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center opacity-20 text-center italic">
            <Briefcase className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-widest">No hay servicios registrados</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-4 custom-scrollbar space-y-4">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className={`group rounded-3xl p-5 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  servicio.service_active ? "bg-white border-gray-100 hover:border-gray-200" : "bg-gray-50 border-transparent opacity-70"
                }`}
              >
                {/* Info Principal */}
                <div className="flex items-center gap-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0"
                    style={{ backgroundColor: `${servicio.color}15`, color: servicio.color }}
                  >
                    {servicio.codigo}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black uppercase italic text-lg leading-none" style={{ color: colors.primaryBlue }}>
                        {servicio.nombre}
                      </h3>
                      {servicio?.dar_prioridad !=0 && (
                        <span className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          Prioritario
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      <Layers className="w-3 h-3" />
                      {departamentos.find((d) => d.id === servicio.departamento)?.nombre || "Sin Departamento"}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic max-w-md">
                      {servicio.descripcion || "Sin descripción adicional..."}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onSwitchServicio(servicio.id, servicio.service_active)}
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all ${
                      servicio.service_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {servicio.service_active ? "Activo" : "Inactivo"}
                  </button>

                  <button
                    onClick={() => {
                      setEditando(servicio.id);
                      setFormulario({ ...servicio, dep: servicio.departamento || "", check: servicio.dar_prioridad || false });
                    }}
                    className="p-3 bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setOpen(servicio.id)}
                    className="p-3 bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-12 py-4 bg-gray-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Los servicios activos son visibles para los usuarios en la terminal de tickets.
        </span>
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-[#1e2a4f]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: colors.primaryYellow }}></div>
            
            <h3 className="text-3xl font-black uppercase italic mb-8" style={{ color: colors.primaryBlue }}>
              {editando === "nuevo" ? "Nuevo Servicio" : "Editar Registro"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nombre del Servicio</label>
                <input
                  type="text"
                  value={formulario.nombre || ""}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-sm"
                  placeholder="Ej: Atención al Cliente"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Código (Max 3)</label>
                <input
                  type="text"
                  value={formulario.codigo || ""}
                  onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value.toUpperCase().slice(0, 3) })}
                  disabled={editando !== "nuevo"}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-black text-sm uppercase"
                  placeholder="ATC"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Departamento Relacionado</label>
                <select
                  value={formulario.dep || ""}
                  onChange={(e) => setFormulario({ ...formulario, dep: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-sm"
                >
                  <option value="">Seleccionar Departamento</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-around bg-gray-50 rounded-2xl p-3 border-2 border-transparent">
                <div className="text-center">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={formulario.color || "#1e2a4f"}
                    onChange={(e) => setFormulario({ ...formulario, color: e.target.value })}
                    className="h-8 w-8 rounded-full border-none cursor-pointer"
                  />
                </div>
                <div className="text-center">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1 text-center">¿Prioritario?</label>
                  <button
                    type="button"
                    onClick={() => setFormulario({ ...formulario, check: !formulario.check })}
                    className={`w-12 h-6 rounded-full relative transition-all ${formulario.check ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formulario.check ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Breve Descripción</label>
              <textarea
                value={formulario.descripcion || ""}
                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                rows={2}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGuardar}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                Confirmar y Guardar
              </button>
              <button
                onClick={() => { setEditando(null); setFormulario({}); }}
                className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={open !== null}
        title="¿Eliminar Servicio?"
        message="Esta acción es permanente y afectará a los departamentos vinculados."
        onCancel={() => setOpen(null)}
        onConfirm={() => handleEliminar(open)}
      />
    </div>
  );
}

export default ServiciosSection;