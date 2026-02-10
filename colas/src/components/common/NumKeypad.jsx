import { X, Check } from "lucide-react";

export default function NumericKeypad({
  value,
  onAdd,
  onDelete,
  onConfirm,
  confirmDisabled,
}) {
  return (
    <>
      <div className="bg-white  p-8 rounded-2xl shadow-lg mb-6">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              className="bg-primary hover:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl transition-colors"
              key={n}
              onClick={() => onAdd(n.toString())}>
              {n}
            </button>
          ))}

          <button
          id="btn-delete"
            className={` ${value.length>=1 ? "bg-red-600 hover:bg-red-700":"bg-gray-600 hover:cursor-not-allowed"} text-white text-3xl font-bold py-6 rounded-xl transition-colors flex items-center justify-center`}
            onClick={onDelete}>
            <X />
          </button>
          <button
          
            className="bg-primary hover:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl transition-colors"
            onClick={() => onAdd("0")}>
            0
          </button>
          <button
          id="btn-accept"
            className={` ${!confirmDisabled ? "bg-green-600 hover:bg-green-700":"bg-gray-600 hover:cursor-not-allowed"}  text-white text-3xl py-6 rounded-xl transition-colors flex items-center justify-center font-bold`}
            disabled={confirmDisabled}
            onClick={onConfirm}>
            <Check />
          </button>
        </div>
      </div>
    </>
  );
}
