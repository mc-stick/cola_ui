import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export const SliderModal = ({ isOpen, onClose, slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-200 min-h-[350px] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors z-20">
          <X size={20} strokeWidth={3} />
        </button>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 z-10">
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 z-10">
          <ChevronRight size={28} />
        </button>
        <div className="text-center flex-1 flex flex-col justify-center px-4">
          <h3 className="text-2xl font-black text-blue-900 mb-3 leading-tight">
            {slides[currentIndex]?.title}
          </h3>
          <p className="text-gray-500 leading-relaxed text-base italic">
            "{slides[currentIndex]?.text}"
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex justify-center gap-2 mb-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 transition-all duration-300 rounded-full ${currentIndex === index ? "bg-primary w-6" : "bg-gray-200 w-1.5"}`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 text-sm">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export const TutorialModal = ({ isOpen, onClose, tutorials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reiniciar el índice al cerrar/abrir
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  if (!isOpen || !tutorials.length) return null;

  const currentSlide = tutorials[currentIndex];

  const nextSlide = (e) => {
    e?.stopPropagation();
    if (currentIndex < tutorials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full relative animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-white">
        
        {/* Botón Cerrar Superior Refinado */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all z-20"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Contenido principal con padding balanceado */}
        <div className="p-4 md:p-6 flex flex-col items-center min-h-[350px]">
          
          {/* Header con Icono Estilo Dashboard */}
          <div className="mb-4">
            {currentSlide.icon ? (
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-inner animate-pulse">
                {/* Clonamos el icono para asegurar tamaño consistente si viene de props */}
                {typeof currentSlide.icon === 'object' ? currentSlide.icon : <span className="text-4xl">{currentSlide.icon}</span>}
              </div>
            ) : (
              <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
            )}
          </div>

          {/* Cuerpo del Tutorial */}
          <div className="text-center flex-1 flex flex-col justify-center w-full">
            <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-2 leading-tight">
              {currentSlide.title}
            </h3>

            <div className="space-y-2 max-h-[150px] overflow-y-auto px-1.5 custom-scrollbar">
              {Array.isArray(currentSlide.content) ? (
                currentSlide.content.map((text, i) => (
                  <p key={i} className="text-slate-500 text-sm md:text-base leading-relaxed">
                    {text}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-sm md:text-base leading-relaxed italic">
                  "{currentSlide.text || currentSlide.content}"
                </p>
              )}
            </div>

            {currentSlide.action && (
              <div className="mt-8">
                <button
                  onClick={currentSlide.action.onClick}
                  className="px-8 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-all text-sm uppercase tracking-wide"
                >
                  {currentSlide.action.label}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Navegación e Indicadores */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-3">
          
          {/* Indicadores de Pasos (Dots) */}
          <div className="flex justify-center gap-1.5">
            {tutorials.map((_, index) => (
              <div
                key={index}
                className={`h-1 transition-all duration-500 rounded-full ${
                  currentIndex === index ? "bg-blue-600 w-6" : "bg-slate-200 w-1.5"
                }`}
              />
            ))}
          </div>

          {/* Botones de Navegación Inferiores (Mejor para Mobile/Kiosco) */}
          <div className="flex items-center justify-between w-full gap-3">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider transition-all ${
                currentIndex === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <button
              onClick={nextSlide}
              className={`flex items-center gap-1.5 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 ${
                currentIndex === tutorials.length - 1
                  ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                  : "bg-slate-900 text-white shadow-slate-200 hover:bg-black"
              }`}
            >
              {currentIndex === tutorials.length - 1 ? (
                <> Finalizar <CheckCircle2 size={14} /> </>
              ) : (
                <> Siguiente <ChevronRight size={14} /> </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
