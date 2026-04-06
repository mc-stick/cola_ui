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
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 relative animate-in zoom-in-95 duration-200 min-h-[450px] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors z-20">
          <X size={28} strokeWidth={3} />
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
        <div className="text-center flex-1 flex flex-col justify-center px-8">
          <h3 className="text-4xl font-black text-blue-900 mb-6 leading-tight">
            {slides[currentIndex]?.title}
          </h3>
          <p className="text-gray-500 leading-relaxed text-xl italic">
            "{slides[currentIndex]?.text}"
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex justify-center gap-3 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 transition-all duration-300 rounded-full ${currentIndex === index ? "bg-primary w-8" : "bg-gray-200 w-2"}`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-semibold py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200">
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
        <div className="p-8 md:p-12 flex flex-col items-center min-h-[450px]">
          
          {/* Header con Icono Estilo Dashboard */}
          <div className="mb-8">
            {currentSlide.icon ? (
              <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-inner animate-pulse">
                {/* Clonamos el icono para asegurar tamaño consistente si viene de props */}
                {typeof currentSlide.icon === 'object' ? currentSlide.icon : <span className="text-4xl">{currentSlide.icon}</span>}
              </div>
            ) : (
              <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
            )}
          </div>

          {/* Cuerpo del Tutorial */}
          <div className="text-center flex-1 flex flex-col justify-center w-full">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 leading-tight">
              {currentSlide.title}
            </h3>

            <div className="space-y-4 max-h-[200px] overflow-y-auto px-2 custom-scrollbar">
              {Array.isArray(currentSlide.content) ? (
                currentSlide.content.map((text, i) => (
                  <p key={i} className="text-slate-500 text-base md:text-lg leading-relaxed">
                    {text}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-base md:text-lg leading-relaxed italic">
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
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-6">
          
          {/* Indicadores de Pasos (Dots) */}
          <div className="flex justify-center gap-2">
            {tutorials.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  currentIndex === index ? "bg-blue-600 w-8" : "bg-slate-200 w-2"
                }`}
              />
            ))}
          </div>

          {/* Botones de Navegación Inferiores (Mejor para Mobile/Kiosco) */}
          <div className="flex items-center justify-between w-full gap-4">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-all ${
                currentIndex === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ChevronLeft size={20} /> Anterior
            </button>

            <button
              onClick={nextSlide}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                currentIndex === tutorials.length - 1
                  ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                  : "bg-slate-900 text-white shadow-slate-200 hover:bg-black"
              }`}
            >
              {currentIndex === tutorials.length - 1 ? (
                <> Finalizar <CheckCircle2 size={18} /> </>
              ) : (
                <> Siguiente <ChevronRight size={18} /> </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
