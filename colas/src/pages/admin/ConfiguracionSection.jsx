import {
  Building2Icon,
  ImageIcon,
  Save,
  Settings2,
  AlertCircleIcon,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import { Spinner, TabSpinner } from "../../components/loading";

function ConfiguracionSection({
  configuracion,
  setConfiguracion,
  LoadingSpin,
  onGuardar,
}) {
  const colors = {
    primaryBlue: "#1e2a4f",
    primaryRed: "#cc132c",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    secondaryBlueDark: "#006ca1",
    secondaryBlueLight: "#4ec2eb",
    monoSilver: "#b2b2b2",
    monoGold: "#daab00",
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) =>
      setConfiguracion({ ...configuracion, logo_url: event.target.result });
    reader.readAsDataURL(file);
  };

  if (!configuracion) return null;

  return (
    <div
      className="bg-white rounded-[2rem] shadow-sm border relative flex flex-col overflow-hidden"
      style={{ borderColor: "#e2e8f0", height: "calc(100vh - 140px)" }}
    >
      {/* Decoración de fondo Skew */}
      <div className="absolute top-0 right-0 w-32 h-full bg-[#1e2a4f]/5 skew-x-[-20deg] translate-x-16 pointer-events-none"></div>

      {/* HEADER */}
      <div className="p-4 md:p-6 shrink-0 relative z-10 border-b border-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0">
              <Settings className="w-full h-full text-[#1e2a4f]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase italic leading-none">
                Configuración del{" "}
                <span className="text-[#1e2a4f]">Sistema</span>
              </h2>
              <p className="text-[8px] mt-1 font-bold uppercase tracking-widest text-[#4ec2eb]">
                Ajusta parámetros y módulos visibles en pantalla
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO SCROLLABLE */}
      <div className="flex-1 overflow-auto px-4 md:px-8 py-4 relative z-10">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center flex-col gap-2">
            <div className="w-6 h-6 border-2 border-slate-100 border-t-[#daab00] rounded-full animate-spin"></div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Cargando...
            </p>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={configuracion.nombre_empresa || ""}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        nombre_empresa: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#4ec2eb] outline-none font-bold text-[11px] uppercase transition-all"
                    placeholder="EJ: MI EMPRESA"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-dashed text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {configuracion.logo_url ? (
                      <img
                        src={configuracion.logo_url}
                        className="max-h-24 object-contain mb-4 drop-shadow-md"
                        alt="Logo"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                    )}
                    <span className="font-black text-[8px] uppercase tracking-widest text-[#1e2a4f]">
                      Actualizar Logotipo
                    </span>
                  </label>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                <div
                  className="bg-white border p-6 rounded-2xl"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <label className="block text-[8px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                    Rotación de Imágenes (segundos)
                  </label>
                  <input
                    type="number"
                    max={30}
                    min={1}
                    onKeyDown={(e) => e.preventDefault()}
                    value={
                      configuracion.tiempo_rotacion
                        ? configuracion.tiempo_rotacion
                            .toString()
                            .replace(/0+$/, (match) =>
                              match.length > 1 ? "0" : match,
                            )
                        : 5
                    }
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        tiempo_rotacion: parseInt(e.target.value),
                      })
                    }
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-[11px] focus:border-[#4ec2eb] outline-none"
                  />
                </div>

                <div
                  className="flex items-start p-4 rounded-2xl border-l-8"
                  style={{
                    backgroundColor: "#4ec2eb10",
                    borderColor: "#4ec2eb",
                  }}
                >
                  <AlertCircleIcon className="mr-3 mt-1 w-5 h-5 text-[#1e2a4f]" />
                  <p className="font-bold text-[9px] leading-relaxed text-[#1e2a4f]">
                    Los cambios realizados aquí se reflejarán en todas las
                    pantallas activas.
                  </p>
                </div>
              </div>
            </div>

            {/* Módulos de Pantalla */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-black text-[8px] uppercase tracking-widest mb-4 text-slate-400">
                Módulos de Pantalla
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    key: "mostrar_imagenes",
                    label: "Imágenes",
                    desc: "Carrusel de fotos",
                  },
                  {
                    key: "mostrar_videos",
                    label: "Videos",
                    desc: "Clips multimedia",
                  },
                  {
                    key: "Split",
                    label: "Pantalla Dividida",
                    desc: "Tickets + Multimedia",
                  },
                  {
                    key: "blur",
                    label: "Fondo Dinámico",
                    desc: "Agregar fondo + desenfoque",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl border transition-all"
                    style={{
                      backgroundColor: configuracion[item.key]
                        ? "#499c3510"
                        : "transparent",
                      borderColor: configuracion[item.key] ? "#499c35" : "#eee",
                    }}
                  >
                    <div>
                      <p className="font-black text-[8px] uppercase tracking-tighter text-[#1e2a4f]">
                        {item.label}
                      </p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={configuracion[item.key] || false}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 cursor-pointer accent-[#499c35]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 md:px-6 py-3 bg-slate-50 border-t flex justify-end shrink-0 relative z-10">
        <button
          onClick={onGuardar}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[9px] text-white shadow-md hover:brightness-110 transition-all"
          style={{ backgroundColor: "#daab00" }}
        >
          <Save className="w-3.5 h-3.5" />
          Actualizar Configuración
        </button>
      </div>
    </div>
  );
}

export default ConfiguracionSection;
