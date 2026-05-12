import { useState } from "react";
import { MapPin, Plus, Save, X, Edit, Check, AlertCircleIcon, Layers } from "lucide-react";
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

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    primaryRed: "#cc132c",
    secondaryBlueDark: "#006ca1",
    monoSilver: "#b2b2b2",
  };

  const handleCrearPuesto = () => {
    setEditando("nuevo");
    setFormulario({ nombre: "" });
  };

  const handleGuardar = async () => {
    if (!validarPuesto(formulario)) return;
    await onGuardarPuesto(formulario, editando);
    setEditando(null);
    setFormulario({});
  };

 return (
  <div
    className="bg-white rounded-[2rem] shadow-sm border relative overflow-hidden flex flex-col"
    style={{ borderColor: "#e2e8f0", height: "calc(100vh - 140px)" }}
  >
    {/* Decoración de fondo Skew */}
    <div className="absolute top-0 right-0 w-32 h-full bg-[#1e2a4f]/5 skew-x-[-20deg] translate-x-16 pointer-events-none"></div>

    {/* HEADER */}
    <div className="p-5 md:px-6 md:py-5 shrink-0 relative z-10 border-b border-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <MapPin className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
              Gestión de <span className="text-[#1e2a4f]">Puestos</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Panel de administración de estaciones
            </p>
          </div>
        </div>

        <button
          onClick={handleCrearPuesto}
          disabled={LoadingSpin}
          className="group flex items-center gap-2 bg-[#1e2a4f] hover:bg-[#2a3b6e] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 text-[9px] uppercase tracking-widest border-b-2 border-black/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Puesto
        </button>
      </div>
    </div>

    {/* CUERPO */}
    <div className="flex-1 overflow-hidden px-6 md:px-8 py-4 relative z-10">
      {LoadingSpin ? (
        <div className="h-full flex justify-center items-center flex-col gap-2">
          <div className="w-6 h-6 border-2 border-slate-100 border-t-[#daab00] rounded-full animate-spin"></div>

          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Sincronizando...
          </p>
        </div>
      ) : puestos.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center opacity-20 text-center italic">
          <MapPin className="w-12 h-12 mb-3" />

          <p className="text-[10px] font-black uppercase tracking-widest">
            No hay puestos configurados
          </p>
        </div>
      ) : (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {puestos.map((puesto) => (
            <div
              key={puesto.id}
              className={`group rounded-2xl p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                puesto.puesto_active
                  ? "bg-white border-slate-100 hover:border-[#4ec2eb] hover:shadow-lg"
                  : "bg-slate-50 border-transparent opacity-60"
              }`}
            >
              {/* INFO */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 border-b-2 border-black/10 bg-[#1e2a4f]/10 text-[#1e2a4f]">
                  <MapPin className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black uppercase italic text-sm leading-none text-slate-800">
                      {puesto.nombre}
                    </h3>

                    <span
                      className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                        puesto.puesto_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {puesto.puesto_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] uppercase tracking-widest">
                    <Layers className="w-2.5 h-2.5" />
                    ID: {puesto.id.toString().padStart(3, "0")}
                  </div>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => onSwitchPuesto(puesto.id)}
                  className={`px-3 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-tighter transition-all border-b-2 border-black/10 ${
                    puesto.puesto_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {puesto.puesto_active ? "Activo" : "Inactivo"}
                </button>

                <button
                  onClick={() => {
                    setEditando(puesto.id);
                    setFormulario(puesto);
                  }}
                  className="p-2 bg-slate-50 text-slate-400 hover:bg-[#daab00] hover:text-white rounded-lg transition-all shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* FOOTER */}
    <div className="px-8 py-3 bg-slate-50 border-t flex items-center shrink-0 relative z-10">
      <AlertCircleIcon className="w-3.5 h-3.5 mr-2 text-[#daab00]" />

      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        Configuración física: Estos nombres aparecerán en las pantallas y
        tickets del sistema.
      </span>
    </div>

    {/* MODAL */}
    {editando && (
      <div className="fixed inset-0 bg-[#1e2a4f]/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div
          className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border-t-[6px]"
          style={{ borderTopColor: "#daab00" }}
        >
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 skew-x-[-20deg] translate-x-12 pointer-events-none"></div>

          <h3 className="text-xl font-black uppercase italic mb-6 relative z-10 text-slate-800">
            {editando === "nuevo"
              ? "Vincular Puesto"
              : "Editar Registro"}
          </h3>

          <div className="space-y-4 mb-6 relative z-10">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">
                Nombre del Puesto
              </label>

              <input
                type="text"
                autoFocus
                value={formulario.nombre || ""}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    nombre: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4ec2eb] rounded-xl outline-none transition-all font-bold text-[11px] uppercase"
                placeholder="Caja A / Puesto 01"
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3 relative z-10">
            <button
              onClick={handleGuardar}
              className="flex-1 flex items-center justify-center gap-2 bg-[#499c35] text-white py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:brightness-110 transition-all shadow-md border-b-2 border-black/20"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>

            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="px-6 bg-slate-100 text-slate-400 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default PuestosSection;