import { X, Check } from "lucide-react";

export default function NumericKeypad({
  value,
  onAdd,
  onDelete,
  onConfirm,
  confirmDisabled,
}) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {/* Números del 1 al 9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => onAdd(n.toString())}
            className="bg-blue-500 hover:bg-blue-600 text-white text-2xl sm:text-3xl font-bold py-5 sm:py-6 rounded-2xl shadow-md transform transition duration-200 hover:-translate-y-1 active:scale-95">
            {n}
          </button>
        ))}

        {/* Borrar */}
        <button
          id="btn-delete"
          onClick={onDelete}
          className={`${
            value.length >= 1
              ? "bg-red-500 hover:bg-red-600 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          } text-white text-2xl sm:text-3xl font-bold py-5 sm:py-6 rounded-2xl shadow-md flex items-center justify-center transform transition duration-200 active:scale-95`}>
          <X />
        </button>

        {/* Cero */}
        <button
          onClick={() => onAdd("0")}
          className="bg-blue-500 hover:bg-blue-600 text-white text-2xl sm:text-3xl font-bold py-5 sm:py-6 rounded-2xl shadow-md transform transition duration-200 hover:-translate-y-1 active:scale-95">
          0
        </button>

        {/* Confirmar */}
        <button
          id="btn-accept"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={`${
            !confirmDisabled
              ? "bg-green-500 hover:bg-green-600 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          } text-white text-2xl sm:text-3xl font-bold py-5 sm:py-6 rounded-2xl shadow-md flex items-center justify-center transform transition duration-200 active:scale-95`}>
          <Check />
        </button>
      </div>
    </div>
  );
}
