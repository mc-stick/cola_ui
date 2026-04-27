import { useState } from "react";
import { MapPin, Plus, Save, X, Edit, Check, AlertCircleIcon } from "lucide-react";
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
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col" 
      style={{ borderColor: colors.monoSilver, height: 'calc(100vh - 140px)' }}
    >
      {/* Barra superior de acento */}
      <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER */}
        <div className="p-8 md:p-6 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: colors.primaryBlue }}>
            Gestión de <span style={{ color: colors.secondaryBlueDark }}>puestos</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestiona los puestos del sistema</p>
        </div>
        <button
          onClick={handleCrearPuesto}
          disabled={LoadingSpin}
          className="flex items-center gap-2 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
          style={{ backgroundColor: colors.primaryBlue }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Puesto
        </button>
      </div>
      </div>

      {/* CUERPO - GRID CON SCROLL */}
      <div className="flex-1 overflow-hidden px-8 md:px-12 pb-8">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center">{/* <TabSpinner /> */}</div>
        ) : puestos.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center opacity-20 text-center italic">
            <MapPin className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-widest">No hay puestos configurados</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
              {puestos.map((puesto) => (
                <div
                  key={puesto.id}
                  className={`group relative rounded-[2rem] p-6 border-2 transition-all flex flex-col justify-between h-48 shadow-sm ${
                    puesto.puesto_active ? "bg-white border-gray-100 hover:border-gray-200" : "bg-gray-50 border-transparent opacity-60"
                  }`}
                >
                  {/* Indicador Lateral de Color */}
                  <div 
                    className="absolute left-0 top-1/4 w-1.5 h-1/2 rounded-r-full"
                    style={{ backgroundColor: colors.primaryBlue }}
                  ></div>

                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 mb-4 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        puesto.puesto_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {puesto.puesto_active ? "En Línea" : "Inactivo"}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black uppercase italic text-xl leading-none truncate" style={{ color: colors.primaryBlue }}>
                      {puesto.nombre}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">ID: {puesto.id.toString().padStart(3, '0')}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onSwitchPuesto(puesto.id)}
                      className={`flex-1 py-2 rounded-xl flex justify-center transition-all ${
                        puesto.puesto_active ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      {puesto.puesto_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditando(puesto.id);
                        setFormulario(puesto);
                      }}
                      className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white flex justify-center transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-12 py-4 bg-gray-50 border-t flex items-center shrink-0">
        <AlertCircleIcon className="w-4 h-4 mr-3 opacity-30" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Configuración Física: Estos nombres aparecerán en la pantalla de llamados y tickets.
        </span>
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-[#1e2a4f]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: colors.primaryYellow }}></div>
            
            <button 
              onClick={() => { setEditando(null); setFormulario({}); }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h3 className="text-3xl font-black uppercase italic mb-8 text-center" style={{ color: colors.primaryBlue }}>
              {editando === "nuevo" ? "Crear Puesto" : "Editar Puesto"}
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Identificador del Puesto</label>
                <input
                  type="text"
                  autoFocus
                  value={formulario.nombre || ""}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-black text-lg uppercase italic shadow-inner"
                  placeholder="Ej: Puesto 01 / Caja A"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleGuardar}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PuestosSection;