import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaUsuario({ activar, setActivar }) {
  useEffect(() => {
    if (activar) {
      const driverObj = driver({
        showProgress: false,
        animate: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',
        // Resetea el estado al cerrar
        onDestroyed: () => setActivar(false),
        steps: [
          { 
            element: '#titulo-paso', 
            popover: { title: 'Identificación', description: 'Selecciona cómo prefieres que el sistema te reconozca.', side: "bottom"} 
          },
          { 
            element: '#grid-opcion1', 
            popover: { title: 'Número telefónico', description: 'Si usas tu número de telefono te enviaremos un SMS con el número de ticket.', side: "top"} 
          },
          { 
            element: '#grid-opcion2', 
            popover: { title: 'Matrícula', description: 'Usa tu matrícula para identificarte en el sistema.', side: "top"} 
          },
          { 
            element: '#grid-opcion3', 
            popover: { title: 'Invitado', description: 'Continua como invitado sin registrarte en el sistema.', side: "top"} 
          },
          { 
            element: '#btn-tk', 
            popover: { title: '¿Ya tienes un ticket?', description: 'Si tu ticket fue marcado para volver mas tarde, puedo asignarte un turno lo mas próximo posible.', side: "top"} 
          },
          { 
            element: '#btn-ayuda', 
            popover: { title: '¿Dudas?', description: 'Haz clic aquí para ver el manual de uso en cualquier momento.', side: "top"} 
          }
        ]
      });
      driverObj.drive();
    }
  }, [activar, setActivar]);

  return null;
}