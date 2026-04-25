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
    <div className="w-full max-w-4xl mx-auto">
      {/* Título de Paso */}
      <div  className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
          ¿Cómo deseas identificarte?
        </h2>
        <p className="text-slate-500 font-medium">Selecciona una opción para comenzar tu atención</p>
      </div>

      {/* Grid de Opciones Estilo Dashboard */}
      <div id="titulo-paso" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {opciones.map((s,ind) => (
          <button
            key={s.id}
            onClick={s.action}
            id={`grid-opcion${ind+1}`}
            className="group relative bg-slate-100 border-slate-400-200 border p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Decoración de fondo al hacer hover */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${s.color}`}></div>
            
            <div className={`${s.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-inner group-hover:rotate-6 transition-transform`}>
              {s.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
              {s.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {s.desc}
            </p>
            
            <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Seleccionar <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      {/* Footer de Acciones Secundarias */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-slate-100">
        <button
          id="btn-tk"
          onClick={() => setIsModalTKOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide group"
        >
          <TicketIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          ¿Ya tienes un ticket?
        </button>

        <button
          id="btn-ayuda"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide"
        >
          <HelpCircleIcon className="w-5 h-5" />
          Centro de Ayuda
        </button>
      </div>

      {/* Modales */}
      <TutorialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tutorials={tutorialConfig} />
      <SelectorGuia activar={runTour} setActivar={setRunTour} guia={Guia_paso} />
      <LlamarTicketModal open={isModalTkOpen} onClose={() => setIsModalTKOpen(false)} onConfirm={setIsModalTKOpenConfirmTk} />
      <ModalCallTK open={isModalTkOpenConfirmTk} onClose={setIsModalTKOpenConfirmTk} onConfirm={isModalTkOpenConfirmTk} />

      {/* Input oculto para scanners */}
      {/* <input
        ref={inputRef}
        type="text"
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
      /> */}
    </div>
  );
}