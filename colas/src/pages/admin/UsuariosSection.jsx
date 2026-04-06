import { useState } from "react";
import {
  Users,
  Save,
  X,
  Edit,
  Check,
  TrashIcon,
  ShieldCheckIcon,
  UserCheck2,
  AlertCircleIcon,
  UserPlus2,
  Lock,
} from "lucide-react";
import { TabSpinner } from "../../components/loading";

function UsuariosSection({
  usuarios,
  puestos,
  LoadingSpin,
  onGuardarUsuario,
  onSwitchUser,
  onDeleteUser,
  validarUsuario,
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

  const handleGuardar = async () => {
    if (!validarUsuario(formulario, editando)) return;
    await onGuardarUsuario(formulario, editando);
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
      <div className="p-8 md:p-12 pb-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase" style={{ color: colors.primaryBlue }}>
            Gestión de <span style={{ color: colors.secondaryBlueDark }}>Perfiles</span>
          </h2>
          <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: colors.primaryYellow }}></div>
        </div>
        
        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-700">
                {usuarios.length - 1} Usuarios Registrados
            </span>
        </div>
      </div>

      {/* CUERPO - LISTADO CON SCROLL */}
      <div className="flex-1 overflow-hidden px-8 md:px-12 pb-8">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center">{/* <TabSpinner /> */}</div>
        ) : usuarios.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center opacity-20 text-center italic">
            <Users className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-widest">No hay usuarios en la base de datos</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
              {usuarios.filter(u => u.id !== 1).map(usuario => (
                <div
                  key={usuario.id}
                  className={`group rounded-[2rem] p-6 border-2 transition-all flex items-center justify-between gap-4 ${
                    usuario.activo ? "bg-white border-gray-100 hover:border-gray-200" : "bg-gray-50 border-transparent opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-5 truncate">
                    {/* Avatar Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                        usuario.rol === 1 ? "bg-amber-50" : "bg-blue-50"
                    }`}>
                      {usuario.rol === 1 ? (
                        <ShieldCheckIcon className="w-8 h-8 text-amber-500" />
                      ) : (
                        <UserCheck2 className="w-8 h-8 text-blue-500" />
                      )}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black uppercase italic text-lg leading-none truncate text-slate-800">
                          {usuario.nombre}
                        </h3>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@{usuario.username}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                            usuario.rol === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        }`}>
                            {usuario.rol === 1 ? "Administrador" : "Operador"}
                        </span>
                        {usuario.puesto_nombre && (
                           <span className="text-[9px] font-black text-blue-600 uppercase italic">
                             📍 {usuario.puesto_nombre}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSwitchUser(usuario.id)}
                      className={`p-3 rounded-xl transition-all ${
                        usuario.activo ? "bg-green-100 text-green-600 hover:bg-green-600 hover:text-white" : "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                      }`}
                    >
                      {usuario.activo ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => { setEditando(usuario.id); setFormulario({ ...usuario, password: "" }); }}
                      className="p-3 bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteUser(usuario.id)}
                      className="p-3 bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
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
            Seguridad: Los usuarios se sincronizan con el Active Directory del sistema.
        </span>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-[#1e2a4f]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: colors.primaryYellow }}></div>
            
            <h3 className="text-3xl font-black uppercase italic mb-8" style={{ color: colors.primaryBlue }}>
              Configurar Perfil
            </h3>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nombre Completo</label>
                    <div className="px-5 py-3 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 border border-gray-200">
                        {formulario.nombre}
                    </div>
                </div>
                <div className="w-1/3 space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Usuario</label>
                    <div className="px-5 py-3 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 border border-gray-200 truncate">
                        @{formulario.username}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Rol de Acceso</label>
                    <select
                      value={formulario.rol || 2}
                      onChange={(e) => setFormulario({ ...formulario, rol: Number(e.target.value) })}
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value={1}>ADMINISTRADOR</option>
                      <option value={2}>OPERADOR</option>
                    </select>
                  </div>

                  {formulario.rol === 2 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Asignar Puesto</label>
                      <select
                        value={formulario.puesto_id || ""}
                        onChange={(e) => setFormulario({ ...formulario, puesto_id: e.target.value })}
                        className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">SIN PUESTO</option>
                        {puestos.filter(p => p.puesto_active).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGuardar}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                Actualizar Perfil
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
    </div>
  );
}

export default UsuariosSection;