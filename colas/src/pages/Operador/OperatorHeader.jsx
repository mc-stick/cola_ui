import { useRef, useState, useEffect } from "react";
import {
  LogOut,
  CircleUser,
  TagsIcon,
  Settings2Icon,
  ChevronDown,
  MapPinIcon,
  HelpingHandIcon,
} from "lucide-react";

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, activo]);

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-start">
        {/* INFO USUARIO */}
        <div className="mt-1 ml-10 p-2 flex items-center justify-between gap-16 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          {/* PUESTO */}
          <div id="title-puesto" className="flex ml-20 items-center gap-3">
            <div className="p-2 rounded-full bg-amber-400/20 animate-pulse">
              <MapPinIcon className="w-6 h-6 text-amber-300" />
            </div>

            <span className="px-4 py-1 rounded-lg text-lg font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md">
              {usuario.puesto_nombre}
            </span>
          </div>

          {/* SERVICIOS */}
          <div id="title-services">
            {serviciosAsignados.length > 0 && (
              <div className="flex ml-20 mr-10 flex-col gap-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <TagsIcon className="w-5 h-5 text-cyan-300 animate-pulse" />
                  <span className="tracking-wide">Servicios asignados</span>
                </div>

                <div className="flex flex-wrap gap-2 relative">
                  {serviciosAsignados.map((servicio) => (
                    <div key={servicio.id} className="relative">
                      <span
                        onClick={() =>
                          setActivo(
                            activo === servicio.id ? null : servicio.id
                          )
                        }
                        className={`relative px-3 py-1 rounded-lg text-xs font-bold border border-white/30
                          shadow-md transition-all duration-300 cursor-pointer
                          hover:scale-110 hover:shadow-xl hover:brightness-110 ${
                            activo !== servicio.id
                              ? null
                              : servicio.id
                                ? "animate-pulse"
                                : ""
                          }`}
                        style={{ backgroundColor: servicio.color }}>
                        {servicio.codigo}

                        <span
                          className="absolute inset-0 blur-md opacity-40 -z-10 rounded-lg"
                          style={{ backgroundColor: servicio.color }}
                        />
                      </span>

                      {/* Tooltip */}
                      {activo === servicio.id && (
                        <div
                          ref={menuRef}
                          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2
                            bg-gray-900 text-white text-xs font-bold
                            px-3 py-2 rounded-lg shadow-xl whitespace-nowrap
                            animate-fade-in">
                          {servicio.nombre}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NOMBRE + MENÚ */}
        <div id="title-user" className="relative mt-10 text-right">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-3xl font-bold p-2 hover:bg-blue-800/40 rounded-lg transition">
            <CircleUser className="w-8 h-6 text-blue-300" />
            {usuario.nombre}
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* DROPDOWN */}
          {menuOpen && (
            <div
              id="Menu-usuario"
              ref={menuRef}
              className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={() => {
                  onOpenTutorial();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition">
                <HelpingHandIcon className="w-5 h-5 text-cyan-600" />
                Ayuda
              </button>
              <button
                onClick={() => {
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition">
                <Settings2Icon className="w-5 h-5 text-cyan-600" />
                Configuración
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition">
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};