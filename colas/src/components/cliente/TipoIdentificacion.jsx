import {
  Phone,
  CreditCard,
  User,
  HelpCircleIcon,
  Info,
  BookOpen,
  TicketIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SliderModal, TutorialModal } from "../common/infoSliderModal";
import { getTutorialDeAcceso } from "../../helpers/Tutoriales";
import SelectorGuia from "../../helpers/GuiaSelect";
import TicketQR from "../common/Qr";
import LlamarTicketModal, { ModalCallTK } from "../common/RepeatTk";

export default function PasoTipoIdentificacion({ onSelect, setPaso }) {
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalTkOpen, setIsModalTKOpen] = useState(false);
  const [isModalTkOpenConfirm, setIsModalTKOpenConfirm] = useState(null);
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
      // Evitamos el foco si el Tour o el Modal están abiertos
      if (!isModalOpen && !runTour) inputRef.current?.focus();
    };
    keepFocus();
    document.addEventListener("click", keepFocus);
    return () => document.removeEventListener("click", keepFocus);
  }, [isModalOpen, runTour]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setInputValue("");
    }
  };

  return (
    <div className="fixed w-screen h-screen overflow-hidden bg-primary flex flex-col items-center pt-32">
      <div className="max-w-5xl w-full px-4">
        <div id="titulo-paso" className="animation-fade-in text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-12 drop-shadow-lg">
            ¿Cómo deseas identificarte?
          </h2>

          {/* Grid adaptativo */}
          <div
            id="grid-opciones"
            className="grid gap-8 auto-rows-fr"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}>
            {[
              {
                id: "telefono",
                title: "Teléfono",
                desc: "Envía su ticket al móvil.",
                color: "var(--color-primary-green)",
                icon: <Phone className="w-12 h-12 text-white" />,
                action: () => Select("telefono"),
              },
              {
                id: "identificacion",
                title: "ID CAMPUS",
                desc: "Use su ID de CAMPUS",
                color: "var(--color-primary-blue)",
                icon: <CreditCard className="w-12 h-12 text-white" />,
                action: () => Select("identificacion"),
              },
              {
                id: "sin_id",
                title: "Invitado",
                desc: "No tengo ID de CAMPUS",
                color: "var(--color-mono-gold)",
                icon: <User className="w-12 h-12 text-white" />,
                action: () => Select("sin_id", false),
              },
            ].map((s) => (
              <button
                key={s.id}
                onClick={s.action}
                className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110"
                  style={{ backgroundColor: s.color }}>
                  {s.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modales y tutorial */}
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

      {/* Footer responsivo */}
      <footer className="fixed bottom-10 w-full flex justify-center gap-4 flex-wrap px-4">
        <button
          id="btn-tk"
          onClick={() => setIsModalTKOpen(true)}
          className="flex items-center gap-3 px-6 py-3 bg-yellow-500/70 animate-pulse backdrop-blur-md rounded-full border border-white/40 hover:bg-white/80 transition-all group shadow-md active:scale-95">
          <div className="bg-primary p-2 rounded-full text-white group-hover:animate-none">
            <TicketIcon size={20} />
          </div>
          <span className="text-blue-900 font-extrabold tracking-wide uppercase text-sm">
            ¿Ya tienes un ticket?
          </span>
        </button>

        <button
          id="btn-ayuda"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-3 bg-white/60 animate-pulse backdrop-blur-md rounded-full border border-white/40 hover:bg-white/80 transition-all group shadow-md active:scale-95">
          <div className="bg-primary p-2 rounded-full text-white group-hover:animate-none">
            <HelpCircleIcon size={20} />
          </div>
          <span className="text-blue-900 font-extrabold tracking-wide uppercase text-sm">
            ¿Necesitas ayuda?
          </span>
        </button>
      </footer>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="text"
        tabIndex="-1"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        style={{ left: "-1000vw" }}
      />
    </div>
  );
}
