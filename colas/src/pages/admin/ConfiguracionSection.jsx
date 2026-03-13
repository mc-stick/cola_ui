import { Building2Icon, ImageIcon, Save } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function ConfiguracionSection({
  configuracion,
  setConfiguracion,
  LoadingSpin,
  onGuardar,
}) {
  if (!configuracion) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo: 5MB");
      e.target.value = "";
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      toast.error("Tipo de archivo no válido. Solo: JPG, PNG, GIF, WebP");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      if (!base64 || !base64.startsWith("data:")) {
        toast.error("Error al procesar el archivo");
        return;
      }
      setConfiguracion({ ...configuracion, logo_url: base64 });
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gradient-to-tl from-[var(--color-secondary-blue-light)] to-[var(--color-secondary-blue-dark)] rounded shadow-xl p-10 ">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Building2Icon className="w-8 h-8 text-[var(--color-primary-yellow)]" />
          Configuración General
        </h2>
      </div>
      <div className="h-1 w-full bg-[var(--color-primary-yellow)] rounded-full mb-5"></div>

      {LoadingSpin ? (
        <TabSpinner />
      ) : (
        <div className="space-y-8">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {/* Nombre Empresa */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={configuracion.nombre_empresa || ""}
              onChange={(e) =>
                setConfiguracion({
                  ...configuracion,
                  nombre_empresa: e.target.value,
                })
              }
              className="w-full px-4 py-3 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-[var(--color-primary-blue)] focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 text-lg transition"
              placeholder="MI EMPRESA"
            />
          </div>

          {/* Logo Upload */}
          <div className="bg-[var(--color-secondary-blue-light)]/10 p-8 rounded-2xl border border-[var(--color-secondary-blue-light)]/30">
            <h3 className="text-xl font-bold mb-6 text-white">
              Agregar Logo
            </h3>

            <label className="block text-sm font-semibold text-white mb-3">
              Seleccionar Archivo
            </label>

            <div className="flex flex-wrap items-start gap-8">
              <div className="border-2 border-dashed border-[var(--color-secondary-blue-dark)] rounded-2xl p-8 text-center hover:border-[var(--color-primary-green)] transition-colors bg-[var(--color-mono-white)] shadow-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <ImageIcon className="w-10 h-10 text-[var(--color-primary-green)] mb-2" />
                  <span className="text-sm font-semibold text-white">
                    Click para seleccionar una imagen
                  </span>
                  <span className="text-xs text-[var(--color-mono-black)]/60 mt-1">
                    PNG, JPG, GIF hasta 5MB
                  </span>
                </label>
              </div>

              {configuracion.logo_url && (
                <div className="p-6 bg-[var(--color-mono-white)] rounded-2xl shadow-md ">
                  <p className="text-sm font-semibold text-[var(--color-primary-blue)] mb-3">
                    Vista previa:
                  </p>
                  <img
                    src={configuracion.logo_url}
                    alt="Logo preview"
                    className="w-28 h-28 object-contain bg-[var(--color-mono-white)] rounded-xl p-3 border-2 border-[var(--color-mono-gold)]"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <p
                    className="text-[var(--color-primary-red)] text-sm mt-2"
                    style={{ display: "none" }}
                  >
                    No se pudo cargar la imagen
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tiempo Rotación */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tiempo de Rotación de Medios (milisegundos)
            </label>
            <input
              type="number"
              value={configuracion.tiempo_rotacion || 5000}
              onChange={(e) =>
                setConfiguracion({
                  ...configuracion,
                  tiempo_rotacion: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-3 border-2 border-[var(--color-mono-silver)] rounded-xl focus:outline-none focus:border-white focus:ring-2 focus:ring-[var(--color-secondary-blue-light)]/40 transition"
              min="1000"
              step="1000"
            />
            <p className="text-sm text-white/80 italic mt-2">
              Recomendado: 5000ms (5 segundos)
            </p>
          </div>

          {/* Opciones */}
          <div className="border-t-2 border-[var(--color-mono-silver)]/40 pt-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Opciones de Visualización
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3 bg-[var(--color-secondary-green-light)]/10 p-4 rounded-xl border border-[var(--color-secondary-green-dark)]/30">
              <div className="flex flex-col">
                
                <label
                  htmlFor="mostrar_imagenes"
                  className="font-semibold text-white cursor-pointer"
                ><input
                  type="checkbox"
                  id="mostrar_imagenes"
                  checked={configuracion.mostrar_imagenes || false}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      mostrar_imagenes: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[var(--color-primary-green)] m-2 hover:cursor-pointer rounded focus:ring-2 focus:ring-[var(--color-primary-green)]"
                />
                  Mostrar imágenes
                </label>
                <span className="text-sm text-white mt-1">
                  Activa esta opción para visualizar las imágenes en la pantalla principal.
                </span>
              </div>
              </div>

              <div className="flex items-center gap-3 bg-[var(--color-secondary-yellow-light)]/20 p-4 rounded-xl border border-[var(--color-secondary-yellow-dark)]">
              <div className="flex flex-col">
                
                <label
                  htmlFor="mostrar_videos"
                  className="font-semibold text-white cursor-pointer"
                ><input
                  type="checkbox"
                  id="mostrar_videos"
                  checked={configuracion.mostrar_videos || false}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      mostrar_videos: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[var(--color-primary-yellow)] rounded hover:cursor-pointer focus:ring-2 m-2 focus:ring-[var(--color-primary-yellow)]"
                />
                  Mostrar videos
                </label>
                <span className="text-sm text-white mt-1">
                  Activa esta opción para visualizar los videos en la pantalla principal.
                </span>
              </div>
              </div>
              <div className="flex flecol items-center gap-3 bg-[var(--color-secondary-yellow-light)]/20 p-4 rounded-xl border border-[var(--color-secondary-yellow-dark)]">
                
                <div className="flex flex-col">
                <label
                  htmlFor="split_Screen"
                  className="font-semibold text-white cursor-pointer"
                ><input
                  type="checkbox"
                  id="split_Screen"
                  checked={configuracion.Split || false}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      Split: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[var(--color-primary-yellow)] m-2 hover:cursor-pointer rounded focus:ring-2 focus:ring-[var(--color-primary-yellow)]"
                />
                  Dividir pantalla
                </label>
                <span className="text-sm text-white mt-1">
                  Activa esta opción para visualizar tickets y multimedia al mismo tiempo en la pantalla principal.
                </span></div>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-6">
            <button
              onClick={onGuardar}
              className="flex items-center gap-3 bg-[var(--color-primary-blue)] hover:bg-[var(--color-secondary-blue-dark)] text-[var(--color-mono-white)] px-10 py-3 rounded-2xl font-bold text-lg transition-all transform  shadow-lg"
            >
              <Save className="w-6 h-6" />
              Guardar Configuración
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default ConfiguracionSection;
