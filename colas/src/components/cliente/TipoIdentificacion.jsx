import { Phone, CreditCard, User, HelpCircleIcon, Info, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SliderModal, TutorialModal } from "../common/infoSliderModal";
import { getTutorialDeAcceso } from "../../helpers/Tutoriales";
import SelectorGuia from "../../helpers/GuiaSelect";
import TicketQR from "../common/Qr";

export default function PasoTipoIdentificacion({ onSelect, setPaso }) {
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    console.log(x,"guia ")
  };
  
  const tutorialConfig = getTutorialDeAcceso( onGuide);

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
      console.log("Valor enviado:", inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="fixed w-screen h-screen overflow-hidden bg-primary flex flex-col items-center pt-32">
      

      <div className="max-w-4xl w-full p-2">
        <div id="titulo-paso" className="animation-fade-in text-center">
          <h2 className="text-4xl font-black text-white mb-12 drop-shadow-sm">
            ¿Cómo deseas identificarte?
          </h2>

          <div id="grid-opciones" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              id="grid-opcion1"
              className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group"
              onClick={() => Select("telefono")}>
              <div className="bg-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Teléfono</h3>
              <p className="text-gray-500 font-medium">Vía SMS</p>
            </button>

            <button
              id="grid-opcion2"
              className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group"
              onClick={() => Select("identificacion")}>
              <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Matrícula</h3>
              <p className="text-gray-500 font-medium">ID Manual</p>
            </button>

            <button
              id="grid-opcion3"
              className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group"
              onClick={() => Select("sin_id", false)}>
              <div className="bg-gray-800 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Invitado</h3>
              <p className="text-gray-500 font-medium">Sin ID</p>
            </button>
          </div>
        </div>
      </div>

     

      {/* Renderizado del Tutorial Avanzado */}
      <TutorialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutorials={tutorialConfig} // Usamos la nueva config
      />
      <SelectorGuia 
      activar={runTour} 
      setActivar={setRunTour} 
      guia={Guia_paso} // El estado que te dice si estás en el 1 o 2
    />


      {/* <TicketQR value={"http://localhost:5173/cola/evaluar/114"} /> */}
      <footer className="fixed bottom-10 w-full text-center">
        <button
          id="btn-ayuda"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-3 px-8 py-3 bg-white/60 animate-pulse backdrop-blur-md rounded-full border border-white/40 hover:bg-white/80 transition-all group shadow-md active:scale-95"
        >
          <div className="bg-blue-600 p-1.5 rounded-full text-white  group-hover:animate-none">
            <HelpCircleIcon size={20} />
          </div>
          <span className="text-blue-900 font-extrabold tracking-wide uppercase text-sm">
            ¿Necesitas ayuda?
          </span>
        </button>

        <input
          ref={inputRef}
          type="text"
          tabIndex="-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          style={{ position: 'absolute', left: '-1000vw' }}
        />
      </footer>
    </div>
  );
}