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
        <div className=" ">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {/* Nombre Empresa */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="MI EMPRESA"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 🔹 Logo */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">
                  Logo de la empresa
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition cursor-pointer w-full md:w-1/2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-600">
                        Subir imagen
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG hasta 5MB
                      </span>
                    </label>
                  </div>

                  {/* Preview */}
                  {configuracion.logo_url && (
                    <div className="bg-gray-50 p-4 rounded-xl border w-full md:w-1/2 flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-2">Vista previa</p>
                      <img
                        src={configuracion.logo_url}
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 🔹 Tiempo */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Configuración del tiempo de imagen
                  </h3>

                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tiempo de rotación de medios (ms)
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Recomendado: 5000ms
                  </p>
                </div>

                {/* Hint visual */}
                <div className="mt-4 text-xs text-gray-400">
                  Controla el tiempo que permacene una imagen en pantalla, no
                  afecta los videos en pantalla.
                </div>
              </div>
            </div>

            {/* <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiempo de rotación (ms)
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-2">Recomendado: 5000ms</p>
            </div> */}

            {/* Opciones */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Opciones de visualización
              </h3>

              <div className="space-y-3">
                {[
                  {
                    key: "mostrar_imagenes",
                    label: "Mostrar imágenes",
                    desc: "Visualiza imágenes en pantalla",
                  },
                  {
                    key: "mostrar_videos",
                    label: "Mostrar videos",
                    desc: "Visualiza videos en pantalla",
                  },
                  {
                    key: "Split",
                    label: "Dividir pantalla",
                    desc: "Tickets + multimedia al mismo tiempo",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border hover:bg-gray-200 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
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
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end">
              <button
                onClick={onGuardar}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md"
              >
                <Save className="w-5 h-5" />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfiguracionSection;
