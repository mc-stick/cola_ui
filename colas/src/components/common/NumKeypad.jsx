import { Delete, Check, X } from "lucide-react";

export default function NumericKeypad({
  value,
  onAdd,
  onDelete,
  onConfirm,
  confirmDisabled,
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Números del 1 al 9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => onAdd(n.toString())}
            className="bg-white border-2 border-slate-100 text-slate-700 text-2xl sm:text-3xl font-black py-4 sm:py-5 rounded-2xl shadow-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
          >
            {n}
          </button>
        ))}

        {/* Borrar (Rediseñado para ser menos intrusivo) */}
        <button
          id="btn-delete"
          onClick={onDelete}
          disabled={value.length === 0}
          className={`${
            value.length >= 1
              ? "bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-100"
              : "bg-slate-50 text-slate-300 border-2 border-slate-100 cursor-not-allowed"
          } text-2xl sm:text-3xl font-bold py-4 sm:py-5 rounded-2xl flex items-center justify-center transition-all active:scale-90`}
        >
          <X strokeWidth={3} size={28} />
        </button>

        {/* Cero */}
        <button
          onClick={() => onAdd("0")}
          className="bg-white border-2 border-slate-100 text-slate-700 text-2xl sm:text-3xl font-black py-4 sm:py-5 rounded-2xl shadow-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
        >
          0
        </button>

        {/* Confirmar (Estilo Botón de Acción) */}
        <button
          id="btn-accept"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={`${
            !confirmDisabled
              ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 scale-105"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          } text-2xl sm:text-3xl font-bold py-4 sm:py-5 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg`}
        >
          <Check strokeWidth={4} size={32} />
        </button>
      </div>
      
      {/* Tip de seguridad/ayuda opcional abajo del teclado para rellenar espacio si sobra */}
      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-6">
        Sistema de identificación seguro
      </p>
    </div>
  );
}