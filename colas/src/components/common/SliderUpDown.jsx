import { TriangleIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SliderUpDown({ servicios, onSelect }) {
  const [index, setIndex] = useState(0);

 console.log(servicios)
  
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
  
  }, [])

  return (
    <div className="flex flex-col items-center justify-center mb-3">

      {/* Botón arriba */}
      <button
        onClick={anterior}
        disabled={index === 0}
        className={`text-xl transition  px-2 py-1 rounded ${
          index === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-black animate-pulse hover:text-blue-600"
        }`}
      >
        <TriangleIcon />
      </button>

      {/* Servicio actual */}
      <div className="my-2 w-full text-center">
        <div className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow transition-all duration-200">
          <h3 className="text-base font-semibold">
            {servicios[index].nombre}
          </h3>
        </div>
      </div>

      {/* Botón abajo */}
      <button
        onClick={siguiente}
        disabled={index === servicios.length - 1}
        className={`text-xl transition px-2 py-1 rounded ${
          index === servicios.length - 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-black animate-pulse hover:text-blue-600"
        }`}
      >
        <TriangleIcon className="rotate-180" />
      </button>

    </div>
  );
}
