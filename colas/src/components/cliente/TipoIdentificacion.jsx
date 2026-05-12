import {
  Phone,
  CreditCard,
  User,
  HelpCircleIcon,
  TicketIcon,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TutorialModal } from "../common/infoSliderModal";
import { getTutorialDeAcceso } from "../../helpers/Tutoriales";
import SelectorGuia from "../../helpers/GuiaSelect";
import LlamarTicketModal, { ModalCallTK } from "../common/RepeatTk";

export default function PasoTipoIdentificacion({ onSelect, setPaso }) {
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalTkOpen, setIsModalTKOpen] = useState(false);
  const [isModalTkOpenConfirmTk, setIsModalTKOpenConfirmTk] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [Guia_paso, setGuia_paso] = useState("");
  const inputRef = useRef(null);

  const Select = (x, y = true) => {
    if (y) setPaso(2);
    else setPaso(3);
    onSelect(x);
  };

  const onGuide = (x) => {
    setIsModalOpen(false);
    setGuia_paso(x);
    setTimeout(() => setRunTour(true), 300);
  };

  const tutorialConfig = getTutorialDeAcceso(onGuide);

  useEffect(() => {
    const keepFocus = () => {
      if (!isModalOpen && !runTour) inputRef.current?.focus();
    };
    keepFocus();
    document.addEventListener("click", keepFocus);
    return () => document.removeEventListener("click", keepFocus);
  }, [isModalOpen, runTour]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") setInputValue("");
  };

  const opciones = [
    {
      id: "telefono",
      title: "Teléfono Móvil",
      desc: "Recibe tu ticket vía SMS.",
      color: "bg-emerald-500",
      icon: <Phone className="w-8 h-8 text-white" />,
      action: () => Select("telefono"),
    },
    {
      id: "identificacion",
      title: "ID Institucional",
      desc: "Usa tu ID de campus.",
      color: "bg-blue-600",
      icon: <CreditCard className="w-8 h-8 text-white" />,
      action: () => Select("identificacion"),
    },
    {
      id: "sin_id",
      title: "Visitante / Invitado",
      desc: "No poseo un ID de campus.",
      color: "bg-amber-500",
      icon: <User className="w-8 h-8 text-white" />,
      action: () => Select("sin_id", false),
    },
  ];

  return (
    <div
      className="
      h-full
      flex
      flex-col
      overflow-hidden
    "
    >
      {/* CONTENIDO CENTRAL */}
      <div
        className="
        flex-1
        min-h-0

        flex
        flex-col
        justify-center
      "
      >
        <div
          className="
          w-full
          max-w-6xl
          mx-auto

          flex
          flex-col

          h-full
        "
        >
          {/* ───────────────────────── */}
          {/* HEADER */}
          {/* ───────────────────────── */}
          <div
            className="
            text-center

            mb-4
            sm:mb-5
            md:mb-6

            flex-shrink-0
          "
          >
            <h2
              className="
              text-2xl
              sm:text-3xl
              md:text-4xl

              font-black
              text-slate-800

              mb-2
              leading-tight
            "
            >
              ¿Cómo deseas identificarte?
            </h2>

            <p
              className="
              text-sm
              sm:text-base

              text-slate-500
              font-medium

              max-w-2xl
              mx-auto
            "
            >
              Selecciona una opción para comenzar tu atención
            </p>
          </div>

          {/* ───────────────────────── */}
          {/* GRID */}
          {/* ───────────────────────── */}
          <div
            id="titulo-paso"
            className="
            grid
            grid-cols-1
            md:grid-cols-3

            gap-4
            md:gap-5

            flex-1
            min-h-0
          "
          >
            {opciones.map((s, ind) => (
              <button
                key={s.id}
                id={`grid-opcion${ind + 1}`}
                onClick={s.action}
                className="
                group
                relative
                overflow-hidden

                border
                border-slate-200

                rounded-3xl

                bg-slate-100

                transition-all
                duration-300

                hover:shadow-xl
                hover:border-blue-300

                flex
                flex-col
                items-center
                justify-center

                text-center

                p-5
                sm:p-6
                md:p-7

                min-h-[220px]
                md:min-h-[260px]
              "
              >
                {/* EFECTO */}
                <div
                  className={`
                  absolute
                  -top-5
                  -right-5

                  w-24
                  h-24

                  rounded-full
                  opacity-5

                  group-hover:scale-150

                  transition-transform
                  duration-500

                  ${s.color}
                `}
                />

                {/* ICON */}
                <div
                  className={`
                  ${s.color}

                  w-16
                  h-16
                  md:w-20
                  md:h-20

                  rounded-2xl

                  flex
                  items-center
                  justify-center

                  mb-4

                  shadow-lg

                  group-hover:rotate-6
                  transition-transform
                `}
                >
                  {s.icon}
                </div>

                {/* TITLE */}
                <h3
                  className="
                  text-lg
                  md:text-xl

                  font-bold
                  text-slate-800

                  mb-2

                  group-hover:text-blue-600

                  transition-colors
                "
                >
                  {s.title}
                </h3>

                {/* DESC */}
                <p
                  className="
                  text-slate-400

                  text-sm

                  leading-relaxed

                  max-w-[240px]
                "
                >
                  {s.desc}
                </p>

                {/* CTA */}
                <div
                  className="
                  absolute
                  bottom-5

                  flex
                  items-center
                  gap-2

                  text-blue-600

                  font-bold
                  text-xs

                  uppercase
                  tracking-widest

                  opacity-0

                  group-hover:opacity-100

                  transition-opacity
                "
                >
                  Seleccionar
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* ───────────────────────── */}
          {/* FOOTER */}
          {/* ───────────────────────── */}
          <div
            className="
            flex
            flex-col
            sm:flex-row

            items-center
            justify-center

            gap-3

            pt-4
            md:pt-5

            mt-4

            border-t
            border-slate-100

            flex-shrink-0
          "
          >
            <button
              id="btn-tk"
              onClick={() => setIsModalTKOpen(true)}
              className="
              group

              flex
              items-center
              justify-center

              gap-3

              px-6
              py-3.5

              rounded-2xl

              bg-slate-100
              hover:bg-amber-100

              text-slate-600
              hover:text-amber-700

              transition-all

              font-bold
              text-xs
              sm:text-sm

              uppercase
              tracking-wide

              w-full
              sm:w-auto
            "
            >
              <TicketIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              ¿Ya tienes un ticket?
            </button>

            <button
              id="btn-ayuda"
              onClick={() => setIsModalOpen(true)}
              className="
              flex
              items-center
              justify-center

              gap-3

              px-6
              py-3.5

              rounded-2xl

              bg-white

              border
              border-slate-200

              hover:border-blue-300

              text-slate-500
              hover:text-blue-600

              transition-all

              font-bold
              text-xs
              sm:text-sm

              uppercase
              tracking-wide

              w-full
              sm:w-auto
            "
            >
              <HelpCircleIcon className="w-5 h-5" />
              Centro de Ayuda
            </button>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <TutorialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutorials={tutorialConfig}
      />

      <SelectorGuia
        activar={runTour}
        setActivar={setRunTour}
        guia={Guia_paso}
      />

      <LlamarTicketModal
        open={isModalTkOpen}
        onClose={() => setIsModalTKOpen(false)}
        onConfirm={setIsModalTKOpenConfirmTk}
      />

      <ModalCallTK
        open={isModalTkOpenConfirmTk}
        onClose={setIsModalTKOpenConfirmTk}
        onConfirm={isModalTkOpenConfirmTk}
      />
    </div>
  );
}
