import {
  AngryIcon,
  CircleSlashIcon,
  FrownIcon,
  LaughIcon,
  MehIcon,
  SmileIcon,
  StarIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { useMatrixText } from "../../hooks/useMatrixEfect";
import AnimatedBubleBackground from "../../components/common/animBubbles";
import { useFecha, useHora } from "./clok";
import { usePantallaCliente } from "../../hooks/UsePantallaCliente";

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
            }}
          >
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
                }}
              >
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

  const StarPersonal = ({ filled, size = 24 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "orange" : "black"}
      stroke="gray"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
    </svg>
  );

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
              display: "inline-flex",
            }}
          >
            <StarPersonal filled={filled} size={size} />
          </span>
        );
      })}
    </div>
  );
}

export function IconRatingButton({
  value = 0,
  onChange,
  size = 32,
  readOnly = false,
}) {
  const [hover, setHover] = useState(null);
  const displayedValue = hover ?? value;

  const icons = {
    1: {
      label: "Muy malo",
      emoji: <AngryIcon className="w-10 h-10 text-red-500" />,
    },
    2: {
      label: "Malo",
      emoji: <FrownIcon className="w-10 h-10 text-orange-500" />,
    },
    3: {
      label: "Bueno",
      emoji: <MehIcon className="w-10 h-10 text-yellow-500" />,
    },
    4: {
      label: "Muy bueno",
      emoji: <SmileIcon className="w-10 h-10 text-green-500" />,
    },
    5: {
      label: "Excelente",
      emoji: <LaughIcon className="w-10 h-10 text-blue-500" />,
    },
  };

  return (
    // Columna para que la etiqueta quede abajo de la fila de iconos
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Contenedor de iconos */}
      <div style={{ display: "flex", gap: 12 }}>
        {Object.keys(icons).map((key) => {
          const ratingValue = parseInt(key);
          const isSelected = ratingValue === displayedValue;
          const iconData = icons[ratingValue];

          return (
            <span
              key={ratingValue}
              role={readOnly ? "img" : "button"}
              aria-label={iconData.label}
              onClick={() => !readOnly && onChange?.(ratingValue)}
              onMouseEnter={() => !readOnly && setHover(ratingValue)}
              onMouseLeave={() => !readOnly && setHover(null)}
              style={{
                cursor: readOnly ? "default" : "pointer",
                fontSize: size,
                transform: isSelected ? "scale(1.3)" : "scale(1)",
                opacity: isSelected ? 1 : 0.4,
                transition: "all 0.2s ease-in-out",
                display: "inline-flex",
                userSelect: "none",
              }}
            >
              {iconData.emoji}
            </span>
          );
        })}
      </div>

      {/* Etiqueta debajo: Solo aparece si hay un valor seleccionado o en hover */}
      <div style={{ height: "20px" }}>
        {" "}
        {/* Altura fija para evitar saltos de layout */}
        {displayedValue > 0 && (
          <span
            style={{
              fontWeight: "bold",
              color: "#555",
              fontSize: "14px",
              animation: "fadeIn 0.3s",
            }}
          >
            {icons[displayedValue].label}
          </span>
        )}
      </div>
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
              ? "No Evaluado"
              : "Mala";

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
              ? "text-gray-500"
              : "text-red-500";

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
          <span className="text-xl font-extrabold text-amber-600">
            {display.toFixed(1)}
          </span>
          <span className="text-m font-bold text-gray-800">/ 5</span>
        </div>
        {/* <span
          className={`font-bold italic tracking-wide transition-colors ${color}`}>
          {matrixText}
        </span> */}
      </div>
    </div>
  );
}

function Mensaje({ titulo, mensaje }) {
  return (
    <div className="min-h-screen flex  items-center justify-center px-4">
      <AnimatedBubleBackground />
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-6 text-center">
        <h2 className="text-2xl font-semibold mb-3">
          <span className="flex gap-3 justify-center">{titulo}</span>{" "}
        </h2>

        <p className="text-gray-600">{mensaje}</p>
      </div>
    </div>
  );
}

export function EvaluacionTicket() {
  //const [rating, setRating] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [campos, setCampos] = useState([]);
  const [estado, setEstado] = useState(null);
  const [commentx, setCommentx] = useState("");
  const { id: ticketId } = useParams();

  const [ratings, setRatings] = useState([]);

  const [hasZero, setHasZero] = useState(true);

  const colors = {
    primaryBlue: "#1e2a4f",
    primaryRed: "#cc132c",
    primaryYellow: "#fad824",
    primaryGreen: "#499c35",
    secondaryBlueDark: "#006ca1",
    secondaryBlueLight: "#4ec2eb",
    monoWhite: "#ffffff",
    monoBlack: "#000000",
    monoSilver: "#b2b2b2",
    monoGold: "#daab00",
  };
  // 🔹 Inicializar ratings cuando lleguen los campos
  useEffect(() => {
    if (campos.length > 0) {
      setRatings(Array(campos.length).fill(0));
    }
  }, [campos]);

  useEffect(() => {
    const existsZero = ratings.some((r) => r === 0 || r === undefined);
    setHasZero(existsZero);
  }, [ratings]);

  const handleRatingChange = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const data = await API.GetTicketEvaluationState(ticketId);
        if (data.expirado || data.notfound) setEstado(1);
        else if (data.yaEvaluado) setEstado(2);
        else setEstado(0);
        setCampos(data.data[0] || []);
      } catch (err) {
        console.error("Error al traer estado del ticket:", err);
        setEstado(1);
      }
    };
    fetchEstado();
  }, [ticketId]);

  const handleSubmit = async () => {
    if (hasZero) return;

    try {
      const result = await API.SendEvaluation(
        ticketId.split("-")[0].replace(/\s+/g, ""),
        ratings,
        commentx,
      );

      if (result.expirado) setEstado(1);
      else if (result.yaEvaluado) setEstado(2);
      else if (result.success) setEnviado(true);
    } catch (err) {
      //console.error("Error al enviar evaluación:", err);
    }

    setCommentx("");
  };

  if (estado === 1) {
    setTimeout(() => {
      window.location.href = "https://www.ucne.edu.do/";
    }, 10000);
    return (
      <Mensaje
        titulo="Evaluación expirada"
        mensaje="El tiempo para evaluar este ticket ha finalizado. Gracias por su visita."
      />
    );
  }

  if (estado === 2) {
    setTimeout(() => {
      window.location.href = "https://www.ucne.edu.do/";
    }, 10000);
    return (
      <Mensaje
        titulo="Ticket ya evaluado"
        mensaje="Este ticket ya fue evaluado. Gracias por tu opinión."
      />
    );
  }

  const hora = useHora();
  const fecha = useFecha();
  const state = usePantallaCliente();
  const config = state.config;

  // 🔹 Pantalla de evaluación con corrección de scroll y estética móvil
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-950 px-3 py-6 relative overflow-hidden">
      <AnimatedBubleBackground />

      <div className="w-full max-w-xl z-10">
        {enviado ? (
          <Mensaje
            titulo="¡Gracias por tu evaluación!"
            mensaje="Tu opinión nos ayuda a mejorar nuestro servicio."
          />
        ) : (
          <div
            className="w-full bg-white rounded-[1rem] md:rounded-[2rem] shadow-2xl border relative overflow-hidden flex flex-col"
            style={{ borderColor: colors.monoSilver }}
          >
            {/* Línea decorativa superior: más delgada en móvil */}
            <div
              className="absolute top-0 left-0 w-full h-2 md:h-3"
              style={{ backgroundColor: colors.primaryBlue }}
            ></div>

            {/* Padding reducido en móvil y desktop */}
            <div className="p-4 md:p-6">
              <div
                className="
                    rounded-2xl
                    border
                    relative
                    overflow-hidden
                    px-3
                    py-3
                  "
                style={{
                  backgroundColor: "#1e2a4f",
                  borderColor: "#daab00",
                }}
              >
                {/* Decoración */}
                <div className="absolute top-0 right-0 w-24 md:w-32 h-full bg-[#cc132c]/10 skew-x-[-20deg] translate-x-12" />

                <div
                  className="
                      relative
                      z-10
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-2
                    "
                >
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Logo */}
                    <div className="relative flex-shrink-0">
                      {config?.logo_url ? (
                        <img
                          src={config.logo_url}
                          alt="Logo"
                          className="
                              w-10 h-10
                              sm:w-12 sm:h-12
                              md:w-14 md:h-14
                              object-contain
                              rounded-xl
                              
                              p-1.5
                              shadow-xl
                            "
                        />
                      ) : (
                        <div
                          className="
                              w-10 h-10
                              sm:w-12 sm:h-12
                              rounded-xl
                              flex
                              items-center
                              justify-center
                              text-lg
                              font-black
                              shadow-xl
                            "
                          style={{
                            backgroundColor: "#fad824",
                            color: "#1e2a4f",
                          }}
                        >
                          .
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <h1
                        className="
                            text-base
                            font-black
                            text-white
                            leading-tight
                            truncate
                          "
                      >
                        Universidad Católica Nordestana
                      </h1>

                      <p
                        className="
                            mt-0.5
                            text-[8px]
                            sm:text-[9px]
                            md:text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-[#4ec2eb]
                            line-clamp-2
                          "
                      ></p>
                    </div>
                  </div>

                  {/* Right */}
                </div>
              </div>

              {/* Header: Título que no se desborda */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-6 mb-4 text-center">
                Evalúa nuestro servicio
              </h2>

              {/* Lista de campos: Espaciado controlado */}
              <div className="space-y-0.5 mb-4">
                {campos.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center py-2 gap-2">
                      <p className="text-gray-800 text-xs md:text-lg font-black uppercase tracking-tight truncate pr-2">
                        {data.nombre}
                      </p>

                      {/* Contenedor de estrellas que no se sale */}
                      <div className="shrink-0 scale-75 md:scale-90 origin-right">
                        <IconRatingButton
                          value={ratings[index] || 0}
                          onChange={(value) => handleRatingChange(index, value)}
                          size={window.innerWidth < 640 ? 20 : 28}
                        />
                      </div>
                    </div>

                    {index !== campos.length - 1 && (
                      <div className="h-[1px] w-full bg-gray-100"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer: Input y Botón */}
              <div className="space-y-2">
                <textarea
                  value={commentx}
                  onChange={(e) => setCommentx(e.target.value)}
                  placeholder=" (Opcional) Comentario adicional..."
                  className="w-full min-h-[60px] md:min-h-[80px] p-3 text-xs rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition-all"
                />

                <button
                  onClick={handleSubmit}
                  disabled={hasZero}
                  className={`w-full py-3 md:py-4 rounded-lg md:rounded-lg font-black text-xs md:text-sm uppercase tracking-[0.15em] transition-all transform active:scale-95 shadow-lg
                  ${
                    hasZero
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[#FFCC00] hover:bg-[#F5C200] text-blue-900"
                  }`}
                >
                  Enviar Evaluación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
