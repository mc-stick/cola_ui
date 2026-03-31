import { TriangleIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SliderUpDown({ servicios, onSelect }) {
  const [index, setIndex] = useState(0);

  const siguiente = () => {
    if (index < servicios.length - 1) {
      const nuevoIndex = index + 1;
      setIndex(nuevoIndex);
      onSelect(servicios[nuevoIndex]);
    }
  };

  const anterior = () => {
    if (index > 0) {
      const nuevoIndex = index - 1;
      setIndex(nuevoIndex);
      onSelect(servicios[nuevoIndex]);
    }
  };

  useEffect(() => {
    onSelect(servicios[0]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      {/* Botón arriba */}
      <button
        onClick={anterior}
        disabled={index === 0}
        className={`text-2xl transition p-2 rounded-full ${
          index === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-800"
        }`}>
        <TriangleIcon />
      </button>

      {/* Tarjeta de servicio */}
      <div className="w-40 sm:w-48 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center transition-transform transform hover:scale-105">
        <h3 className="text-base sm:text-lg font-semibold">
          {servicios[index].nombre}
        </h3>
      </div>

      {/* Botón abajo */}
      <button
        onClick={siguiente}
        disabled={index === servicios.length - 1}
        className={`text-2xl transition p-2 rounded-full ${
          index === servicios.length - 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-800"
        }`}>
        <TriangleIcon className="rotate-180" />
      </button>
    </div>
  );
}
