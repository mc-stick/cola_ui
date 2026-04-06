import { useState, useEffect } from "react";

/* ============================= */
/* 🔹 Hook para la hora actual  */
/* ============================= */
export function useHora() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHora(
        ahora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    actualizarHora(); // Inicial
    const interval = setInterval(actualizarHora, 1000);

    return () => clearInterval(interval);
  }, []);

  return hora;
}

/* ============================= */
/* 🔹 Hook para la fecha actual */
/* ============================= */
export function useFecha() {
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    const actualizarFecha = () => {
      const ahora = new Date();
      setFecha(
        ahora.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    actualizarFecha(); // Inicial
    const interval = setInterval(actualizarFecha, 60000); // Se puede actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  return fecha;
}