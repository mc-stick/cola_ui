import { useRef, useState, useEffect } from "react";
import {
  LogOut,
  CircleUser,
  TagsIcon,
  ChevronDown,
  MapPinIcon,
  HelpingHandIcon,
} from "lucide-react";

const colors = {
  primaryBlue: "#1e2a4f",
  primaryBlueDark: "#131b33",
  primaryYellow: "#fad824",
  secondaryBlueLight: "#4ec2eb",
};

export const OperatorHeader = ({
  usuario,
  serviciosAsignados,
  onLogout,
  onEdit,
  onOpenTutorial,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activo, setActivo] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setActivo(false);
      }
    };

    if (menuOpen || activo) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, activo]);

  return (
    <div 
      className="text-white px-4 py-2 shadow-2xl relative z-[100]" 
      style={{ background: `linear-gradient(135deg, ${colors.primaryBlue} 0%, ${colors.primaryBlueDark} 100%)` }}
    >
      {/* Borde inferior de acento */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5"></div>

      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        
        {/* LADO IZQUIERDO: PUESTO Y SERVICIOS */}
        <div className="flex items-center gap-4">
          {/* IDENTIFICADOR DE PUESTO */}
          <div 
            id="title-puesto" 
            className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg shadow-inner"
          >
            <div className="bg-amber-400/20 p-1.5 rounded-lg">
              <MapPinIcon className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-40 leading-none mb-0.5">Puesto</span>
              <span className="text-sm font-black tracking-tighter uppercase leading-none">
                {usuario.puesto_nombre || "Sin Asignar"}
              </span>
            </div>
          </div>

          {/* LISTA DE SERVICIOS (CHIPS) */}
          <div id="title-services" className="hidden lg:flex flex-col gap-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest opacity-40">
              <TagsIcon className="w-2.5 h-2.5" />
              <span>Servicios</span>
            </div>

            <div className="flex flex-wrap gap-2 relative">
              {serviciosAsignados.map((servicio) => (
                <div key={servicio.id} className="relative group">
                  <button
                    onClick={() => setActivo(activo === servicio.id ? null : servicio.id)}
                    className={`relative px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border transition-all duration-300 hover:scale-105 active:scale-95 ${
                      activo === servicio.id ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[#1e2a4f]" : ""
                    }`}
                    style={{ 
                      backgroundColor: `${servicio.color}22`, // Fondo muy transparente del color
                      borderColor: servicio.color,
                      color: servicio.color 
                    }}
                  >
                    {servicio.codigo}
                  </button>

                  {/* Tooltip con diseño de panel */}
                  {activo === servicio.id && (
                    <div
                      ref={menuRef}
                      className="absolute z-[110] top-full left-0 mt-2 bg-white text-slate-800 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg border border-slate-100 whitespace-nowrap animate-in fade-in zoom-in duration-200"
                    >
                      <div className="absolute -top-0.5 left-3 w-1.5 h-1.5 bg-white rotate-45 border-l border-t border-slate-100"></div>
                      {servicio.nombre}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: PERFIL Y MENÚ */}
        <div id="title-user" className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border ${
              menuOpen ? "bg-white text-slate-900 border-white" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${menuOpen ? "bg-blue-100" : "bg-blue-500/20"}`}>
              <CircleUser className={`w-4 h-4 ${menuOpen ? "text-blue-600" : "text-blue-300"}`} />
            </div>
            <div className="text-left hidden sm:block">
               <p className={`text-[8px] font-black uppercase tracking-[0.1em] ${menuOpen ? "text-slate-400" : "opacity-40"}`}>Operador</p>
               <p className="text-xs font-black tracking-tight leading-none">{usuario.nombre.split(' ')[0]}</p>
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* MENU DESPLEGABLE PREMIUM */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-1.5">
                <button
                  onClick={() => {
                    onOpenTutorial();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 group"
                >
                  <div className="p-1.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                    <HelpingHandIcon className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Ayuda</span>
                </button>

                <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>

                <button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 rounded-xl transition-colors text-red-600 group"
                >
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};