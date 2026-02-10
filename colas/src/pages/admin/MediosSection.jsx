import { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Save,
  X,
  Trash2,
  PlayIcon,
  ImageOffIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner, Spinner } from "../../components/loading";

function MediosSection({ 
  medios, 
  LoadingSpin,
  onGuardarMedio,
  onEliminarMedio,
  onSwitchMedio,
  validarMedio
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [loadingUpload, setLoadingUpload] = useState(false);

  const handleCrearMedio = () => {
    setEditando("nuevo");
    setFormulario({
      tipo: "imagen",
      url: "",
      nombre: "",
      orden: 0,
      metodo: "archivo",
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = formulario.tipo === "imagen" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `El archivo es demasiado grande. Máximo: ${
          formulario.tipo === "imagen" ? "5MB" : "20MB"
        }`
      );
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
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

    if (
      formulario.tipo === "imagen" &&
      !validImageTypes.includes(file.type)
    ) {
      toast.error("Tipo de archivo no válido. Solo: JPG, PNG, GIF, WebP");
      e.target.value = "";
      return;
    }

    if (
      formulario.tipo === "video" &&
      !validVideoTypes.includes(file.type)
    ) {
      toast.error("Tipo de archivo no válido. Solo: MP4, WebM, OGG");
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
      setFormulario({
        ...formulario,
        url: base64,
        nombre: formulario.nombre || file.name.split(".")[0],
      });
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo");
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    if (!validarMedio(formulario)) {
      return;
    }
    setLoadingUpload(true);
    await onGuardarMedio(formulario);
    setLoadingUpload(false);
    setEditando(null);
    setFormulario({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-orange-600" />
          Medios (Imágenes/Videos)
        </h2>
        <button
          onClick={handleCrearMedio}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Medio
        </button>
      </div>

      {editando && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4">Agregar Medio</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formulario.tipo || "imagen"}
                onChange={(e) =>
                  setFormulario({ ...formulario, tipo: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formulario.nombre || ""}
                onChange={(e) =>
                  setFormulario({ ...formulario, nombre: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Nombre descriptivo"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Archivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept={formulario.tipo === "imagen" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600 font-semibold">
                  Click para seleccionar archivo
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {formulario.tipo === "imagen"
                    ? "PNG, JPG, GIF hasta 5MB"
                    : "MP4, WebM hasta 20MB"}
                </span>
              </label>
            </div>

            {formulario.url && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Vista previa:
                </p>
                {formulario.tipo === "imagen" ? (
                  <img
                    src={formulario.url}
                    alt="Preview"
                    className="max-w-full h-48 object-contain mx-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={formulario.url}
                    controls
                    className="max-w-full h-48 mx-auto rounded-lg"
                  />
                )}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Tamaño: {(formulario.url.length / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {loadingUpload && <Spinner onClose={loadingUpload} />}

          <div className="flex gap-3">
            <button
              onClick={handleGuardar}
              disabled={!formulario.url || !formulario.nombre}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <Save className="w-5 h-5" />
              Guardar
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setFormulario({});
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div
        className={`${
          LoadingSpin ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        }`}>
        {LoadingSpin ? (
          <TabSpinner />
        ) : medios.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay medios agregados</p>
            <p className="text-sm mt-2">
              Haz clic en "Nuevo Medio" para agregar uno
            </p>
          </div>
        ) : (
          medios.map((medio) => (
            <div
              key={medio.id}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                {medio.tipo === "imagen" ? (
                  <img
                    src={medio.url}
                    alt={medio.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+";
                    }}
                  />
                ) : (
                  <video
                    src={medio.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                )}
                {medio.medio_active === 1 ?"":<div className="absolute inset-0 bg-gray-500/90"></div>}
                
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold text-white absolute top-2 left-2 bg-black/70 ${
                    medio.medio_active === 1 ? "bg-green-600" : "bg-red-600"
                  }`}>
                  {medio.medio_active === 1
                    ? "Mostrando en pantalla"
                    : "No se muestra en pantalla"}
                </span>
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                  {medio.tipo}
                </div>
              </div>
              <div className="p-4">
                <h3
                  className="font-bold text-gray-800 truncate"
                  title={medio.nombre}>
                  {medio.nombre}
                </h3>
                <p className="text-sm text-gray-600 capitalize mb-3">
                  {medio.tipo} {medio.url.startsWith("data:") && "(Local)"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const modal = window.open("", "_blank", "width=800,height=600");
                      if (medio.tipo === "imagen") {
                        modal.document.write(
                          `<img src="${medio.url}" style="max-width:100%; height:auto;">`
                        );
                      } else {
                        modal.document.write(
                          `<video src="${medio.url}" controls autoplay style="max-width:100%;"></video>`
                        );
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                    <ImageIcon className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => onEliminarMedio(medio.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onSwitchMedio(medio.id, medio.medio_active)}
                    className={`flex-1 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                      medio.medio_active === 0
                        ? "bg-green-600 hover:bg-green-800"
                        : "bg-gray-600 hover:bg-gray-800"
                    }`}>
                    {medio.medio_active === 0 ? (
                      medio.tipo === "imagen" ? (
                        <ImageIcon className="w-6 h-6 font-bold" />
                      ) : (
                        <PlayIcon className="w-6 h-6 font-bold" />
                      )
                    ) : (
                      <ImageOffIcon className="w-6 h-6" />
                    )}
                    <span className="px-3 py-1 rounded-full text-sm font-semibold text-white">
                      {medio.medio_active === 0 ? "Mostrar" : "No mostrar"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MediosSection;