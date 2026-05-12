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
  RefreshCw,
} from "lucide-react";
import { TabSpinner } from "../../components/loading";
import api from "../../services/api";

function UsuariosSection({
  usuarios,
  puestos,
  LoadingSpin,
  onGuardarUsuario,
  onSwitchUser,
  onDeleteUser,
  validarUsuario,
  onSyncLdap,
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [showLdapModal, setShowLdapModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ldapResults, setLdapResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addedUsers, setAddedUsers] = useState(new Set());

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

  const handleSearchLdap = async () => {
    if (searchQuery.trim().length < 2) {
      return;
    }
    setSearchLoading(true);
    try {
      const results = await api.searchLdapUsers(searchQuery);
      setLdapResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddLdapUser = async (ldapUser) => {
    try {
      await api.addLdapUser({
        sAMAccountName: ldapUser.sAMAccountName,
        employeeID: ldapUser.employeeID,
        displayName: ldapUser.displayName || ldapUser.cn
      });
      setAddedUsers(new Set([...addedUsers, ldapUser.sAMAccountName]));
      // Refrescar lista de usuarios
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
  <div
    className="bg-white rounded-[2rem] shadow-sm border relative overflow-hidden flex flex-col"
    style={{ borderColor: "#e2e8f0", height: "calc(100vh - 140px)" }}
  >
    {/* Decoración de fondo */}
    <div className="absolute top-0 right-0 w-32 h-full bg-[#1e2a4f]/5 skew-x-[-20deg] translate-x-16 pointer-events-none"></div>

    {/* HEADER */}
    <div className="p-5 md:px-6 md:py-5 shrink-0 relative z-10 border-b border-slate-50">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* TITULO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
            <Users className="w-full h-full text-[#1e2a4f]" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
              Gestión de <span className="text-[#1e2a4f]">Perfiles</span>
            </h2>

            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
              Panel de administración de usuarios
            </p>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Users className="w-3.5 h-3.5 text-[#1e2a4f]" />

            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
              {usuarios.length} Usuarios
            </span>
          </div>

          <button
            onClick={() => setShowLdapModal(true)}
            className="group flex items-center gap-2 bg-[#1e2a4f] hover:bg-[#2a3b6e] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-[9px] uppercase tracking-widest border-b-2 border-black/20"
          >
            <UserPlus2 className="w-3.5 h-3.5" />
            Agregar Usuario
          </button>
        </div>
      </div>
    </div>

    {/* CUERPO */}
    <div className="flex-1 overflow-hidden px-6 md:px-8 py-4 relative z-10">
      {LoadingSpin ? (
        <div className="h-full flex justify-center items-center flex-col gap-2">
          <div className="w-6 h-6 border-2 border-slate-100 border-t-[#daab00] rounded-full animate-spin"></div>

          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Sincronizando usuarios...
          </p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center opacity-20 text-center italic">
          <Users className="w-12 h-12 mb-3" />

          <p className="text-[10px] font-black uppercase tracking-widest">
            No hay usuarios registrados
          </p>
        </div>
      ) : (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {usuarios
            .filter((u) => u.id !== 1)
            .map((usuario) => (
              <div
                key={usuario.id}
                className={`group rounded-2xl p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  usuario.activo
                    ? "bg-white border-slate-100 hover:border-[#4ec2eb] hover:shadow-lg"
                    : "bg-slate-50 border-transparent opacity-60"
                }`}
              >
                {/* INFO */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 border-b-2 border-black/10 ${
                      usuario.rol === 1
                        ? "bg-amber-100 text-amber-600"
                        : "bg-[#1e2a4f]/10 text-[#1e2a4f]"
                    }`}
                  >
                    {usuario.rol === 1 ? (
                      <ShieldCheckIcon className="w-5 h-5" />
                    ) : (
                      <UserCheck2 className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black uppercase italic text-sm leading-none text-slate-800 truncate">
                        {usuario.nombre}
                      </h3>

                      <span
                        className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          usuario.rol === 1
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {usuario.rol === 1
                          ? "Administrador"
                          : "Operador"}
                      </span>

                      {usuario.puesto_nombre && (
                        <span className="bg-blue-100 text-blue-700 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase">
                          📍 {usuario.puesto_nombre}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] uppercase tracking-widest">
                      <Users className="w-2.5 h-2.5" />
                      @{usuario.username}
                    </div>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onSwitchUser(usuario.id)}
                    className={`px-3 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-tighter transition-all border-b-2 border-black/10 ${
                      usuario.activo
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </button>

                  <button
                    onClick={() => {
                      setEditando(usuario.id);
                      setFormulario({
                        ...usuario,
                        password: "",
                      });
                    }}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-[#daab00] hover:text-white rounded-lg transition-all shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteUser(usuario.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-[#cc132c] hover:text-white rounded-lg transition-all shadow-sm"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
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
        Seguridad: Los usuarios se sincronizan automáticamente con el Active
        Directory del sistema.
      </span>
    </div>

    {/* MODAL */}
    {editando && (
      <div className="fixed inset-0 bg-[#1e2a4f]/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div
          className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden border-t-[6px]"
          style={{ borderTopColor: "#daab00" }}
        >
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 skew-x-[-20deg] translate-x-12 pointer-events-none"></div>

          <h3 className="text-xl font-black uppercase italic mb-6 relative z-10 text-slate-800">
            Configurar Perfil
          </h3>

          <div className="grid grid-cols-1 gap-4 mb-6 relative z-10">
            {/* INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Nombre Completo
                </label>

                <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] uppercase text-slate-500">
                  {formulario.nombre}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Usuario
                </label>

                <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] text-slate-500">
                  @{formulario.username}
                </div>
              </div>
            </div>

            {/* ROL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Rol
                </label>

                <select
                  value={formulario.rol || 2}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      rol: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4ec2eb] rounded-xl outline-none transition-all font-bold text-[11px]"
                >
                  <option value={1}>ADMINISTRADOR</option>
                  <option value={2}>OPERADOR</option>
                </select>
              </div>

              {formulario.rol === 2 && (
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Puesto
                  </label>

                  <select
                    value={formulario.puesto_id || ""}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        puesto_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#4ec2eb] rounded-xl outline-none transition-all font-bold text-[11px]"
                  >
                    <option value="">SIN PUESTO</option>

                    {puestos
                      .filter((p) => p.puesto_active)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}
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

    {/* MODAL BÚSQUEDA LDAP */}
    {showLdapModal && (
      <div className="fixed inset-0 bg-[#1e2a4f]/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black uppercase text-slate-800">Agregar Usuario LDAP</h3>
            <button
              onClick={() => {
                setShowLdapModal(false);
                setLdapResults([]);
                setSearchQuery("");
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchLdap()}
                placeholder="Buscar por username..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#1e2a4f] text-sm"
              />
              <button
                onClick={handleSearchLdap}
                disabled={searchLoading || searchQuery.length < 2}
                className="px-4 py-2 bg-[#1e2a4f] text-white rounded-lg font-bold text-xs uppercase hover:bg-[#2a3b6e] disabled:opacity-50 transition-all"
              >
                {searchLoading ? "..." : "Buscar"}
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {ldapResults.length > 0 ? (
              ldapResults.map((user) => (
                <div key={user.sAMAccountName} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{user.displayName || user.cn}</p>
                    <p className="text-xs text-slate-400">@{user.sAMAccountName}</p>
                  </div>
                  <button
                    onClick={() => handleAddLdapUser(user)}
                    disabled={addedUsers.has(user.sAMAccountName)}
                    className={`ml-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all ${
                      addedUsers.has(user.sAMAccountName)
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-[#1e2a4f] text-white hover:bg-[#2a3b6e] cursor-pointer"
                    }`}
                  >
                    {addedUsers.has(user.sAMAccountName) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      "Agregar"
                    )}
                  </button>
                </div>
              ))
            ) : searchQuery && !searchLoading ? (
              <p className="text-center text-slate-400 text-sm py-4">Sin resultados</p>
            ) : null}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setShowLdapModal(false);
                setLdapResults([]);
                setSearchQuery("");
              }}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-xs uppercase hover:bg-slate-200 transition-all"
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
