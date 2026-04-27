import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaInvitado({ activar, setActivar }) {
  useEffect(() => {
    if (activar) {
      const driverObj = driver({
        showProgress: false,
        animate: true,
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Finalizar",
        onDestroyed: () => setActivar(false),
        steps: [
          {
            element: "#grid-opcion3",
            popover: {
              title: "Selecciona la opción Invitado.",
              description: "Presiona el botón invitado para continuar.",
              side: "top",
              showButtons: [], // espera click del usuario
            },
            onHighlightStarted: (element) => {
              element.addEventListener("click", () => {
                setTimeout(() => driverObj.moveNext(), 500);
              }, { once: true });
            },
          },
          {
            element: "#table-dep",
            popover: {
              title: "Selecciona un departamento.",
              description: "Presiona el departamento para continuar.",
              side: "bottom",
              showButtons: [], // espera click del usuario
            },
            onHighlightStarted: (element) => {
              element.addEventListener("click", () => {
                setTimeout(() => driverObj.moveNext(), 500);
              }, { once: true });
            },
          },
          {
            element: "#table-service",
            popover: {
              title: "Selecciona un servicio.",
              description: "Presiona el servicio que necesitas para continuar.",
              side: "bottom",
              showButtons: [], // espera click del usuario
            },
            onHighlightStarted: (element) => {
              element.addEventListener("click", () => {
                setTimeout(() => driverObj.moveNext(), 500);
              }, { once: true });
            },
          },
          {
            element: "#ticket-creado",
            popover: {
              title: "Felicidades, ticket creado con éxito.",
              description: `Aquí finaliza el tutorial, presiona "Finalizar" para que otra persona pueda crear un ticket.`,
              side: "bottom",
              showButtons: []
            },
            onHighlightStarted: (element) => {
              element.addEventListener("click", () => {
                setTimeout(() => driverObj.moveNext(), 500);
              }, { once: true });
            },
          },
        ],
      });
      driverObj.drive();
    }
  }, [activar, setActivar]);

  return null;
}