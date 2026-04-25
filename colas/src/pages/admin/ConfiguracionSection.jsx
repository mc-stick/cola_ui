import {
  Building2Icon,
  ImageIcon,
  Save,
  Settings2,
  AlertCircleIcon,
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
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col"
      style={{ borderColor: colors.monoSilver, height: "calc(100vh - 140px)" }}
    >
      {/* Barra superior de acento fijo */}
      <div
        className="absolute top-0 left-0 w-full h-3 z-10"
        style={{ backgroundColor: colors.primaryBlue }}
      ></div>

      {/* HEADER FIJO */}
      <div className="p-8 md:p-12 pb-6 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2
              className="text-4xl font-black tracking-tighter mb-2"
              style={{ color: colors.primaryBlue }}
            >
              CONFIGURACIÓN{" "}
              <span style={{ color: colors.secondaryBlueDark }}>SISTEMA</span>
            </h2>
            <div
              className="h-1.5 w-20 rounded-full"
              style={{ backgroundColor: colors.primaryYellow }}
            ></div>
          </div>
          <Settings2
            className="w-16 h-16 opacity-10 rotate-12 hidden md:block"
            style={{ color: colors.primaryBlue }}
          />
        </div>
      </div>

      {/* ÁREA CON SCROLL (Cuerpo del formulario) */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 custom-scrollbar">
        {LoadingSpin ? (
          <div className="py-20 flex justify-center">{/* <Spinner /> */}</div>
        ) : (
          <div className="space-y-10 pb-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 font-bold text-xl"
                    style={{
                      focusRingColor: colors.secondaryBlueLight,
                      color: colors.primaryBlue,
                    }}
                  />
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 border border-dashed text-center">
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
                    <span
                      className="font-black text-[10px] uppercase tracking-widest"
                      style={{ color: colors.primaryBlue }}
                    >
                      Actualizar Logotipo
                    </span>
                  </label>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                <div
                  className="bg-white border p-6 rounded-3xl"
                  style={{ borderColor: colors.monoSilver }}
                >
                  <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">
                    Rotación de Imágenes (en segundos)
                  </label>
                  <input
                    type="number"
                    value={
                      configuracion.tiempo_rotacion
                        ? configuracion.tiempo_rotacion
                            .toString()
                            .replace(/000$/, "")
                        : 5
                    }
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        tiempo_rotacion: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-2xl"
                    style={{ color: colors.primaryBlue }}
                  />
                </div>

                <div
                  className="flex items-start p-5 rounded-2xl border-l-8"
                  style={{
                    backgroundColor: `${colors.secondaryBlueLight}10`,
                    borderColor: colors.secondaryBlueLight,
                  }}
                >
                  <AlertCircleIcon
                    className="mr-3 mt-1 shrink-0 w-5 h-5"
                    style={{ color: colors.secondaryBlueDark }}
                  />
                  <p
                    className="font-bold text-xs leading-relaxed"
                    style={{ color: colors.secondaryBlueDark }}
                  >
                    Los cambios realizados aquí se verán reflejados en todas las
                    pantallas de visualización de turnos activas.
                  </p>
                </div>
              </div>
            </div>

            {/* Módulos de Visualización */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 text-gray-400">
                Módulos de Pantalla
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
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
                    desc: "Agregar fondo + desenfoque a multimedia",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-5 rounded-2xl border transition-all"
                    style={{
                      backgroundColor: configuracion[item.key]
                        ? `${colors.primaryGreen}10`
                        : "transparent",
                      borderColor: configuracion[item.key]
                        ? colors.primaryGreen
                        : "#eee",
                    }}
                  >
                    <div>
                      <p
                        className="font-black text-xs uppercase tracking-tighter"
                        style={{ color: colors.primaryBlue }}
                      >
                        {item.label}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
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
                      className="w-5 h-5 cursor-pointer accent-[#499c35]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER FIJO (Botón Guardar siempre visible) */}
      <div className="p-6 bg-gray-50 border-t flex justify-end shrink-0">
        <button
          onClick={onGuardar}
          className="group flex items-center gap-4 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
          style={{ backgroundColor: colors.monoGold }}
        >
          <Save className="w-5 h-5 transition-transform group-hover:rotate-12" />
          Actualizar Configuración
        </button>
      </div>
    </div>
  );
}

export default ConfiguracionSection;
