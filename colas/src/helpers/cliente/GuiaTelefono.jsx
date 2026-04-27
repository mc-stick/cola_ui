import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function desbloquearKeypad() {
  // Clona el body para eliminar todos los listeners que driver.js registró
  const oldBody = document.body;
  const newBody = oldBody.cloneNode(true);
  oldBody.parentNode.replaceChild(newBody, oldBody);
}

function bloquearKeypad() {
  // No hace nada — driver.js re-registra sus listeners solo
}

export default function GuiaPaso2({ activar, setActivar }) {
  useEffect(() => {
    if (!activar) return;

    const driverObj = driver({
      showProgress: false,
      animate: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      onDestroyed: () => setActivar(false),

      steps: [
        {
          element: "#grid-opcion1",
          popover: {
            title: "Selecciona la opción teléfono.",
            description: `Toca el botón "Teléfono móvil" para continuar.`,
            side: "top",
          },
          onHighlightStarted: (element) => {
            element.addEventListener("click", () => {
              setTimeout(() => driverObj.moveNext(), 500);
            }, { once: true });
          },
        },
        {
          element: "#btn-regresar",
          popover: {
            title: "¿No quieres usar tu teléfono?",
            description: `Puedes volver atrás para cambiar el método de identificación. Presiona "siguiente"`,
            side: "right",
          },
          disableActiveInteraction: false,
        },
        {
          element: "#visualizador-id",
          popover: {
            title: "Información.",
            description: "Recuerda usar un número propio y válido. Presiona 'siguiente' para continuar.",
            side: "right",
          },
          disableActiveInteraction: false,
        },
        {
          element: "#keypad-container",
          popover: {
            title: "Ingresa tu número.",
            description: "Usa el teclado para ingresar tu número completo. Cuando termines presiona el botón verde ✓",
            side: "top",
          },
          disableActiveInteraction: false,
          onHighlightStarted: () => {
            // Elimina los listeners del body que driver.js registró
            desbloquearKeypad();

            // Espera a que btn-accept esté habilitado y avanza automáticamente
            const interval = setInterval(() => {
              const btn = document.querySelector("#btn-accept");
              if (btn && !btn.disabled) {
                clearInterval(interval);
                // Espera que el usuario presione confirmar
                btn.addEventListener("pointerdown", () => {
                  setTimeout(() => driverObj.moveNext(), 500);
                }, { once: true });
              }
            }, 300);
          },
        },
        {
          element: "#table-service",
          popover: {
            title: "Selecciona un servicio.",
            description: "Presiona el servicio que necesitas para continuar.",
            side: "bottom",
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
            description: "Ahora solo espera a que tu número sea llamado en pantalla.\n\nAquí finaliza el tutorial.",
            side: "bottom",
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
  }, [activar, setActivar]);

  return null;
}