import { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Save,
  X,
  Trash2,
  PlayIcon,
  ImageOffIcon,
  UploadCloud,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { TabSpinner, Spinner } from "../../components/loading";

function MediosSection({
  medios,
  LoadingSpin,
  onGuardarMedio,
  onEliminarMedio,
  onSwitchMedio,
  validarMedio,
}) {
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [loadingUpload, setLoadingUpload] = useState(false);

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryYellow: "#fad824",
    secondaryBlueDark: "#006ca1",
    monoSilver: "#b2b2b2",
  };

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

    const maxSize =
      formulario.tipo === "imagen" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `Tamaño excedido. Máximo: ${formulario.tipo === "imagen" ? "5MB" : "20MB"}`,
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormulario({
        ...formulario,
        url: event.target.result,
        nombre: formulario.nombre || file.name.split(".")[0],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    if (!validarMedio(formulario)) return;
    setLoadingUpload(true);
    await onGuardarMedio(formulario);
    setLoadingUpload(false);
    setEditando(null);
    setFormulario({});
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border relative overflow-hidden flex flex-col"
      style={{ borderColor: colors.monoSilver, height: "calc(100vh - 140px)" }}>
      <div
        className="absolute top-0 left-0 w-full h-3 z-10"
        style={{ backgroundColor: colors.primaryBlue }}></div>

      {/* HEADER */}
      <div className="p-8 shrink-0 flex justify-between items-center border-b">
        <div>
          <h2
            className="text-3xl font-black tracking-tighter uppercase"
            style={{ color: colors.primaryBlue }}>
            Galería de{" "}
            <span style={{ color: colors.secondaryBlueDark }}>Contenido</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Gestiona lo que el público ve en pantalla
          </p>
        </div>
        <button
          onClick={handleCrearMedio}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
          style={{ backgroundColor: colors.primaryBlue }}>
          <Plus className="w-4 h-4" />
          Añadir Medio
        </button>
      </div>

      {/* LISTA DE MEDIOS */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
        {LoadingSpin ? (
          <div className="h-full flex justify-center items-center">
            {/* <TabSpinner /> */}
          </div>
        ) : medios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
            <ImageIcon className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-widest">
              No hay contenido disponible
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medios.map((medio) => (
              <div
                key={medio.id}
                className="group bg-white rounded-xl overflow-hidden border-2 border-black hover:border-blue-500 transition-all hover:shadow-2xl flex flex-col">
                {/* Preview Area */}
                <div className="aspect-video relative overflow-hidden bg-slate-200">
                  {medio.tipo === "imagen" ? (
                    <img
                      src={medio.url}
                      alt={medio.nombre}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <PlayIcon className="text-white opacity-50 w-12 h-12" />
                      <video
                        src={medio.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        muted
                      />
                    </div>
                  )}

                  {/* Overlay Tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/50 backdrop-blur-md text-[9px] font-black text-white px-3 py-1 rounded-full uppercase italic">
                      {medio.tipo}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${medio.medio_active === 1 ? "opacity-0" : "opacity-100 bg-slate-900/60"}`}>
                    {medio.medio_active === 0 && (
                      <span className="text-white font-black uppercase italic text-[10px] tracking-widest border border-white/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    className="font-black uppercase italic text-slate-700 text-sm truncate mb-1"
                    title={medio.nombre}>
                    {medio.nombre}
                  </h3>

                   <div className="h-0.5 rounded-xl bg-black mb-4"></div>

                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const modal = window.open(
                            "",
                            "_blank",
                            "width=800,height=600",
                          );
                          if (medio.tipo === "imagen") {
                            modal.document.write(
                              `<img src="${medio.url}" style="max-width:100%; height:auto;">`,
                            );
                          } else {
                            modal.document.write(
                              `<video src="${medio.url}" controls autoplay style="max-width:100%;"></video>`,
                            );
                          }
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onSwitchMedio(medio.id, medio.medio_active)
                        }
                        className={`flex-[2] text-[10px] font-black uppercase italic rounded-xl transition-all ${
                          medio.medio_active === 0
                            ? "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white"
                        }`}>
                        {medio.medio_active === 0 ? "Activar" : "Ocultar"}
                      </button>
                      <button
                        onClick={() => onEliminarMedio(medio.id)}
                        className="flex-1 bg-red-50 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORMULARIO */}
      {editando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1e2a4f]/80 backdrop-blur-md"
            onClick={() => setEditando(null)}></div>

          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic text-slate-800">
                  Nuevo <span className="text-blue-600">Recurso</span>
                </h3>
                <button
                  onClick={() => setEditando(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Tipo de Contenido
                  </label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) =>
                      setFormulario({ ...formulario, tipo: e.target.value })
                    }
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none font-bold text-xs uppercase">
                    <option value="imagen">Imagen</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Nombre Identificador
                  </label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) =>
                      setFormulario({ ...formulario, nombre: e.target.value })
                    }
                    placeholder="Ej: Promo Verano"
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none font-bold text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Carga de Archivo
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept={
                      formulario.tipo === "imagen" ? "image/*" : "video/*"
                    }
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    id="file-upload"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center group-hover:border-blue-400 transition-all bg-slate-50">
                    <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                    <p className="text-xs font-black uppercase text-slate-500 italic">
                      Click para explorar archivos
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                      {formulario.tipo === "imagen"
                        ? "PNG, JPG, WEBP (MÁX 5MB)"
                        : "MP4, WEBM (MÁX 20MB)"}
                    </p>
                  </div>
                </div>
              </div>

              {formulario.url && (
                <div className="mb-8 p-4 bg-blue-50 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-blue-100">
                    {formulario.tipo === "imagen" ? (
                      <img
                        src={formulario.url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlayIcon className="w-4 h-4 mx-auto mt-3 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[10px] font-black uppercase text-blue-600 leading-none">
                      Vista previa lista
                    </p>
                    <p className="text-[9px] font-bold text-blue-400 truncate mt-1">
                      Archivo procesado correctamente
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleGuardar}
                  disabled={
                    !formulario.url || !formulario.nombre || loadingUpload
                  }
                  className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 disabled:opacity-50">
                  Confirmar y Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingUpload && <Spinner />}

      {/* FOOTER */}
      <div className="px-12 py-4 bg-white border-t flex items-center shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Formatos recomendados: 1920x1080 (Full HD) para evitar distorsiones en
          pantalla.
        </span>
      </div>
    </div>
  );
}

export default MediosSection;
