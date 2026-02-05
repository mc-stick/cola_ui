import {  CircleSlashIcon,  StarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

export function StarRating({
  max = 5,
  value = 0,
  onChange,
  size = 24,
  readOnly = false,
}) {
  const [hover, setHover] = useState(null);

  const displayedValue = hover ?? value;

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }, (_, i) => {
        const ratingValue = i + 1;
        const filled = ratingValue <= displayedValue;

        return (
          <span
            key={ratingValue}
            role={readOnly ? "img" : "button"}
            aria-label={`${ratingValue} estrella`}
            onClick={() => !readOnly && onChange?.(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(null)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              fontSize: size,
              color: filled ? "orange" : "#E0E0E0",
              transition: "color 0.2s",
            }}>
            <StarIcon />
          </span>
        );
      })}
    </div>
  );
}

function Mensaje({ titulo, mensaje }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
        <h2 className="text-2xl font-semibold mb-3"><span className="flex gap-3 justify-center"><CircleSlashIcon className="w-10 h-10 text-red-500"/> {titulo}</span> </h2>

        <p className="text-gray-600">{mensaje}</p>
      </div>
    </div>
  );
}

export function EvaluacionTicket() {
  const [rating, setRating] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [estado, setEstado] = useState(null);
  const { id: ticketId } = useParams();

  // 🔹 Traer estado del ticket al montar
  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const data = await API.GetTicketEvaluationState(ticketId);
        if (data.expirado || data.notfound) setEstado(1);
        else if (data.yaEvaluado) setEstado(2);
        else setEstado(0);
      } catch (err) {
        console.error("Error al traer estado del ticket:", err);
        setEstado(1); // asumimos expirado si hay error
      }
    };
    fetchEstado();
  }, [ticketId]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      const result = await API.SendEvaluation(ticketId, rating);

      if (result.expirado) setEstado(1);
      else if (result.yaEvaluado) setEstado(2);
      else if (result.success) setEnviado(true);
    } catch (err) {
      console.error("Error al enviar evaluación:", err);
    }
  };

  // 🔹 Pantalla de expirado
  if (estado === 1) {
    return (
      <Mensaje
        titulo="Evaluación expirada"
        mensaje="El tiempo para evaluar este ticket ha finalizado. Gracias por su visita."
      />
    );
  }

  // 🔹 Pantalla de ticket ya evaluado
  if (estado === 2) {
    return (
      <Mensaje
        titulo="Ticket ya evaluado"
        mensaje="Este ticket ya fue evaluado. Gracias por tu opinión."
      />
    );
  }

  // 🔹 Pantalla de evaluación
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 px-4">
      {enviado ? (
        <Mensaje
          titulo="¡Gracias por tu evaluación!"
          mensaje="Tu opinión nos ayuda a mejorar nuestro servicio."
        />
      ) : (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            ¿Cómo fue tu atención?
          </h2>

          <p className="text-gray-500 mb-6">
            Toca una estrella para calificar el servicio
          </p>

          <div className="flex justify-center mb-6">
            <StarRating value={rating} onChange={setRating} size={36} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`w-full py-3 rounded-lg font-medium text-white transition
              ${rating === 0
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"}`}
          >
            Enviar evaluación
          </button>
        </div>
      )}
    </div>
  );
}


