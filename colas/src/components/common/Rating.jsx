import { CircleSlashIcon, StarIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { useMatrixText } from "../../hooks/useMatrixEfect";

export function StarRating({
  max = 5,
  value = 0,
  size = 24,
  readOnly = true,
  animate = false,
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }, (_, i) => {
        const full = value >= i + 1;
        const partial = value > i && value < i + 1;
        const percent = partial ? (value - i) * 100 : 0;

        return (
          <span
            key={i}
            style={{
              position: "relative",
              fontSize: size,
              color: "#E0E0E0",
              display: "inline-block",
              animation: animate
                ? `star-wave 450ms ease-out ${i * 90}ms`
                : "none",
              animationDelay: animate ? `${i * 90}ms` : "0ms",
            }}>
            <StarIcon />

            {(full || partial) && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: full ? "100%" : `${percent}%`,
                  overflow: "hidden",
                  color: "orange",
                }}>
                <StarIcon />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function StarRatingButton({
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

export function AnimatedRating({ value = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  const numericValue = Number(value) || 0;
  const [animateStars, setAnimateStars] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let current = 0;
    const steps = 25;
    const increment = numericValue / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplay(current);

      if (step >= steps) {
        setDisplay(numericValue);
        clearInterval(interval);
        setTimeout(() => {
          setShowLabel(true);
        }, 1000);
        setTimeout(() => setAnimateStars(true), 1000);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [visible, numericValue]);

  const label =
    numericValue >= 4.5
      ? "Excelente"
      : numericValue >= 4
        ? "Muy buena"
        : numericValue >= 3
          ? "Buena"
          : numericValue >= 2
            ? "Regular"
            : numericValue == 0
            ? "No Evaluado" : "Mala";

  const color =
    numericValue >= 4.5
      ? "text-emerald-500"
      : numericValue >= 4
        ? "text-green-500"
        : numericValue >= 3
          ? "text-amber-500"
          : numericValue >= 2
            ? "text-orange-500"
            : numericValue == 0
            ? "text-gray-500":"text-red-500";

  const matrixText = useMatrixText(label, showLabel);

  return (
    <div ref={ref} className="flex items-center gap-4">
      

      <div className="flex flex-col items-center gap-1">
        <StarRating
          readOnly
          value={numericValue}
          size={36}
          animate={animateStars}
        />

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-amber-600">
            {display.toFixed(2)}
          </span>
          <span className="text-m font-bold text-gray-800">/ 5</span>
        </div><span
        className={`font-bold italic tracking-wide transition-colors ${color}`}>
        {matrixText}
      </span>
      </div>
    </div>
  );
}

function Mensaje({ titulo, mensaje }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
        <h2 className="text-2xl font-semibold mb-3">
          <span className="flex gap-3 justify-center">
            <CircleSlashIcon className="w-10 h-10 text-red-500" /> {titulo}
          </span>{" "}
        </h2>

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

  
  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const data = await API.GetTicketEvaluationState(ticketId);
        if (data.expirado || data.notfound) setEstado(1);
        else if (data.yaEvaluado) setEstado(2);
        else setEstado(0);
      } catch (err) {
        console.error("Error al traer estado del ticket:", err);
        setEstado(1); 
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

  if (estado === 1) {
    return (
      <Mensaje
        titulo="Evaluación expirada"
        mensaje="El tiempo para evaluar este ticket ha finalizado. Gracias por su visita."
      />
    );
  }

  
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
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
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
            <StarRatingButton value={rating} onChange={setRating} size={36} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`w-full py-3 rounded-lg font-medium text-white transition
              ${
                rating === 0
                  ? "bg-warning cursor-not-allowed"
                  : "bg-warning hover:bg-warning"
              }`}>
            Enviar evaluación
          </button>
        </div>
      )}
    </div>
  );
}
