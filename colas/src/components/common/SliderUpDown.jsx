import { TriangleIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SliderUpDown({ servicios, numero, onSelect }) {
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

  const servicioActual = servicios[index];

  return (
  <div className="w-full flex items-center justify-center gap-4">
    
    {/* Botón izquierda */}
    <button
      onClick={anterior}
      disabled={index === 0}
      className={`text-2xl p-3 rounded-full ${
        index === 0
          ? "text-gray-300 cursor-not-allowed"
          : "text-blue-600 hover:text-blue-800"
      }`}
    >
      <TriangleIcon className="-rotate-90" />
    </button>

    {/* 🔥 Tarjeta ocupa todo el espacio */}
    <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-5 px-4 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
      
      {/* Nombre del servicio */}
      {/* <span className="text-sm opacity-80">
        {servicios[index].nombre}
      </span> */}

      {/* Ticket */}
      <span className="text-3xl font-bold tracking-widest">
        {servicios[index].codigo}-{numero}
      </span>
    </div>

    {/* Botón derecha */}
    <button
      onClick={siguiente}
      disabled={index === servicios.length - 1}
      className={`text-2xl p-3 rounded-full ${
        index === servicios.length - 1
          ? "text-gray-300 cursor-not-allowed"
          : "text-blue-600 hover:text-blue-800"
      }`}
    >
      <TriangleIcon className="rotate-90" />
    </button>
  </div>
);
}