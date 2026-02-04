import { Building2Icon, ImageIcon, Save } from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner } from "../../components/loading";

function ConfiguracionSection({ 
  configuracion, 
  setConfiguracion, 
  LoadingSpin,
  onGuardar
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Building2Icon className="w-8 h-8 text-orange-600" />
          Configuración General
        </h2>
      </div>
      
      {LoadingSpin ? (
        <TabSpinner />
      ) : (
        <div className="space-y-6">
          <div>
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg"
              placeholder="MI EMPRESA"
            />
          </div>

          {/* Logo Upload */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <h3 className="text-xl font-bold mb-4">Agregar Logo</h3>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Archivo
            </label>
            <div className="mb-4 flex">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 m-5 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-green-900" />
                  <span className="text-sm text-gray-600 font-semibold">
                    Click para seleccionar Una imagen
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF hasta 5MB
                  </span>
                </label>
              </div>

              {configuracion.logo_url && (
                <div className="mt-3 p-4 ml-20 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Vista previa:
                  </p>
                  <img
                    src={configuracion.logo_url}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain bg-white rounded-lg p-2 border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <p
                    className="text-red-600 text-sm mt-2"
                    style={{ display: "none" }}>
                    No se pudo cargar la imagen
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              min="1000"
              step="1000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recomendado: 5000ms (5 segundos)
            </p>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Opciones de Visualización
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="mostrar_imagenes"
                  checked={configuracion.mostrar_imagenes || false}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      mostrar_imagenes: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                />
                <label
                  htmlFor="mostrar_imagenes"
                  className="text-gray-700 font-semibold cursor-pointer">
                  Mostrar imágenes en pantalla de anuncios
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="mostrar_videos"
                  checked={configuracion.mostrar_videos || false}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      mostrar_videos: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                />
                <label
                  htmlFor="mostrar_videos"
                  className="text-gray-700 font-semibold cursor-pointer">
                  Mostrar videos en pantalla de anuncios
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onGuardar}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
              <Save className="w-6 h-6" />
              Guardar Configuración
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfiguracionSection;