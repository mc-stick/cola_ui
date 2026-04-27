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
              showButtons: []
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
          },
          {
            element: "#modaltk",
            popover: {
              title: "Coloca tu número de ticket",
              description:
                "Usa los botones laterales para seleccionar el servicio y luego ingresa los tres números restantes del ticket y presiona listo.",
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
