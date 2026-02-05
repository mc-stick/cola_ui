import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

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
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors z-20">
          <X size={28} strokeWidth={3} />
        </button>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 z-10">
          <ChevronLeft size={28} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 z-10">
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
              <div key={index} className={`h-2 transition-all duration-300 rounded-full ${currentIndex === index ? 'bg-blue-600 w-8' : 'bg-gray-200 w-2'}`} />
            ))}
          </div>
          <button onClick={onClose} className="w-full bg-blue-600 text-white font-semibold py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};



export const TutorialModal = ({ isOpen, onClose, tutorials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reiniciar el índice al cerrar/abrir para que siempre empiece desde el inicio
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlide = tutorials[currentIndex];

  const nextSlide = (e) => {
    e.stopPropagation();
    if (currentIndex < tutorials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Si es el último, cerramos
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-2xl w-full p-20 relative animate-in zoom-in-95 duration-300 min-h-[550px] flex flex-col">
        
        {/* Botón Cerrar Superior */}
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors z-20 p-2 hover:bg-red-50 rounded-full">
          <X size={24} strokeWidth={3} />
        </button>

        {/* Navegación Lateral (Solo si hay más de 1 slide) */}
        {tutorials.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button onClick={prevSlide} className="absolute -left-6 top-1/2 -translate-y-1/2 p-4 bg-white shadow-xl rounded-full text-blue-600 z-10 hover:scale-110 transition-transform hidden md:block">
                <ChevronLeft size={32} strokeWidth={3} />
              </button>
            )}
            <button onClick={nextSlide} className="absolute -right-6 top-1/2 -translate-y-1/2 p-4 bg-blue-600 shadow-xl rounded-full text-white z-10 hover:scale-110 transition-transform hidden md:block">
              <ChevronRight size={32} strokeWidth={3} />
            </button>
          </>
        )}

        <div className="flex-1 flex flex-col">
          {/* Header con Icono o Imagen opcional */}
          <div className="flex justify-center mb-6">
            {currentSlide.icon ? (
              <div className="p-4 bg-blue-50 rounded-3xl text-blue-600 transition-all animate-bounce">
                {currentSlide.icon}
              </div>
            ) : (
              <div className="h-2 w-16 bg-blue-100 rounded-full mb-4" /> // Decoración simple
            )}
          </div>

          {/* Cuerpo del Tutorial */}
          <div className="text-center px-4 overflow-y-auto">
            <h3 className="text-3xl font-black text-blue-950 mb-4 leading-tight">
              {currentSlide.title}
            </h3>
            
            <div className="space-y-4">
              {Array.isArray(currentSlide.content) ? (
                currentSlide.content.map((text, i) => (
                  <p key={i} className="text-gray-500 text-lg leading-relaxed">
                    {text}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-lg leading-relaxed italic">
                  "{currentSlide.text}"
                </p>
              )}
            </div>

            {currentSlide.action && (
              <button 
                onClick={currentSlide.action.onClick}
                className="mt-6 px-6 py-2 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                {currentSlide.action.label}
              </button>
            )}
          </div>
        </div>

        {/* Footer: Indicadores y Botón Principal */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex justify-center gap-2 mb-1">
            {tutorials.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 transition-all duration-500 rounded-full ${currentIndex === index ? 'bg-blue-600 w-10' : 'bg-gray-200 w-2'}`} 
              />
            ))}
          </div>
          {/* 
          <button 
            onClick={nextSlide} 
            className={`w-full flex items-center justify-center gap-2 font-black py-5 rounded-2xl transition-all shadow-lg active:scale-[0.98] ${
              currentIndex === tutorials.length - 1 
              ? 'bg-green-600 text-white shadow-green-100' 
              : 'bg-blue-600 text-white shadow-blue-100'
            }`}
          >
            {currentIndex === tutorials.length - 1 ? (
              <> FINALIZAR <CheckCircle2 size={20} /> </>
            ) : (
              'SIGUIENTE PASO'
            )}
          </button>*/}
        </div> 
      </div>
    </div>
  );
};

