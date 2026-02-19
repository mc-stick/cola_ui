import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaVolver({ activar, setActivar }) {
  useEffect(() => {
    if (activar) {
      const driverObj = driver({
        showProgress: false,
        animate: true,
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Finalizar",
        // Resetea el estado al cerrar
        onDestroyed: () => setActivar(false),
        steps: [
          {
            element: "#btn-tk",
            popover: {
              title: "Selecciona esta opción.",
              description:
                "Presiona para continuar.",
              side: "top",
            },
             
            onHighlightStarted: (element) => {
              element.addEventListener(
                "click",
                () => {
                  setTimeout(() => {
                    driverObj.moveNext();
                  }, 600);
                  
                },
                { once: true }
              );
            },
          },{
            element: "#slider-services",
            popover: {
              title: "Selecciona el servicio que se muestra en tu ticket.",
              description:
                "Usa los botones para cambiar el tipo de servicio.",
              side: "left",
            },
          },
          {
            element: "#modaltk",
            popover: {
              title: "Coloca tu número de ticket",
              description:
                "Ingresa los tres números restantes del ticket y presiona siguiente.",
              side: "right",
            },
          },
          {
            element: "#btn-accept",
            popover: {
              title: "Presiona para continuar.",
              description:
                "",
              side: "top",
            }, 
            onHighlightStarted: (element) => {
              element.addEventListener(
                "click",
                () => {
                  setTimeout(() => {
                    driverObj.moveNext();
                  }, 500);
                  
                },
                { once: true }
              );
            },
          },
          {
            element: "#validate-tk",
            popover: {
              title: "Confirmacion.",
              description:
                "Aqui se mostrara si tu ticket es valido o no.\n\n Aquí finaliza el tutorial.",
              side: "right",
            }, 
            onHighlightStarted: (element) => {
              element.addEventListener(
                "click",
                () => {
                  setTimeout(() => {
                    driverObj.moveNext();
                  }, 500);
                  
                },
                { once: true }
              );
            },
          },
        ],
      });
      driverObj.drive();
    }
  }, [activar, setActivar]);

  return null;
}
