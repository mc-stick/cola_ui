import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaOperador({ activar, setActivar }) {
  useEffect(() => {
    if (!activar) return;

    let driverObj;

    // ✅ Helper: espera a que el siguiente elemento exista antes de avanzar
    const waitForElementAndNext = (selector, timeout = 3000) => {
      const start = Date.now();

      const interval = setInterval(() => {
        const el = document.querySelector(selector);

        if (el) {
          clearInterval(interval);
          driverObj.moveNext();
        }

        // seguridad: evita loops infinitos
        if (Date.now() - start > timeout) {
          clearInterval(interval);
          console.warn(`Driver: no se encontró ${selector}`);
        }
      }, 100);
    };

    driverObj = driver({
      showProgress: false,
      animate: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",

      onDestroyed: () => setActivar(false),

      steps: [
        {
          element: "#title-user",
          popover: {
            title: "Menú de usuario",
            description: "Aquí encontrarás el menú de usuario.",
            side: "left",
          },
        },
        {
          element: "#title-puesto",
          popover: {
            title: "Puestos asignados",
            description:
              "Aquí podrás ver el puesto al que estas asignado. Solo un admin puede cambiarlo.",
            side: "bottom",
          },
        },
        {
          element: "#title-services",
          popover: {
            title: "Servicios asignados.",
            description:
              "Aquí puedes ver todos los servicios que puedes atender en tu puesto.",
            side: "right",
          },
        },
        {
          element: "#espera-tk",
          popover: {
            title: "Tickets en espera",
            description:
              "Podrás ver solo los tickets en espera de los servicios asignados.",
            side: "left",
          },
        },

        // 🔥 AUTO-NEXT seguro
        {
          element: "#llamar-tk",
          popover: {
            title: "Llamar ticket",
            description: "Toca aqui para llamar el siguiente ticket.",
            side: "left",
          },
          onHighlightStarted: (element) => {
            element.addEventListener(
              "click",
              () => {
                // esperamos a que el ticket actual exista
                waitForElementAndNext("#atencion-tk");
              },
              { once: true }
            );
          },
        },

        {
          element: "#atencion-tk",
          popover: {
            title: "Ticket actual",
            description:
              "Aqui puedes ver el ticket que atiendes actualmente.",
            side: "left",
          },
        },
        {
          element: "#llamar-tk",
          popover: {
            title: "Atendiendo",
            description:
              "No puedes llamar otro ticket hasta finalizar el actual.",
            side: "left",
          },
        },
        {
          element: "#btns-tk",
          popover: {
            title: "Funciones del usuario",
            description:
              "Aquí puedes seleccionar la opcion mas conveniente.",
            side: "left",
          },
        },
        {
          element: "#message-box",
          popover: {
            title: "Comentarios (opcional)",
            description:
              "Puedes agregar un comentario cuando sea necesario.",
            side: "left",
          },
        },
        {
          element: "#center-ghost-element",
          popover: {
            title: "Veamos un ejemplo práctico.",
            description:
              "Simularemos que el usuario aún no se presenta.",
            side: "over",
          },
        },

        // 🔥 AUTO-NEXT seguro
        {
          element: "#llamar-tk-again",
          popover: {
            title: "Llama el ticket de nuevo.",
            description:
              "Haz click aqui para llamar el ticket nuevamente.",
            side: "left",
          },
          onHighlightStarted: (element) => {
            element.addEventListener(
              "click",
              () => {
                waitForElementAndNext("#llamar-tk-again-number");
              },
              { once: true }
            );
          },
        },

        {
          element: "#llamar-tk-again-number",
          popover: {
            title: "Contador",
            description:
              "Cada llamado incrementa el contador.",
            side: "left",
          },
        },
        {
          element: "#center-ghost-element",
          popover: {
            title: "Ejemplo práctico #2",
            description:
              "Vamos a transferir un ticket a otro servicio.",
            side: "over",
          },
        },

        // 🔥 AUTO-NEXT seguro
        {
          element: "#llamar-tk-transfer",
          popover: {
            title: "Transfiere el ticket",
            description:
              "Haz click aqui para transferir el ticket.",
            side: "left",
          },
          onHighlightStarted: (element) => {
            element.addEventListener(
              "click",
              () => {
                waitForElementAndNext("#modal-transferir");
              },
              { once: true }
            );
          },
        },

        {
          element: "#modal-transferir",
          popover: {
            title: "Transferir Ticket",
            description:
              "Aqui puedes seleccionar el servicio al que deseas transferir.",
            side: "left",
          },
        },

        // 🔥 AUTO-NEXT seguro
        {
          element: "#modal-transferir-items",
          popover: {
            title: "Selecciona servicio",
            description:
              "Haz click en el servicio al que deseas transferir.",
            side: "left",
          },
          onHighlightStarted: (element) => {
            element.addEventListener(
              "click",
              () => {
                waitForElementAndNext("#modal-transferir-confirm");
              },
              { once: true }
            );
          },
        },

        {
          element: "#center-ghost-element",
          popover: {
            title: "Advertencia, Ten cuidado !!!",
            description:
              "Al transferir tickets a tus propios servicios se volveran a mostrar como prioridad a menos que alguien más que tenga ese servicio lo atienda en ese momento.",
            side: "over",
          },
        },
        {
          element: "#center-ghost-element",
          popover: {
            title: "Nota",
            description:
              "Si deseas transferir el ticket a otra persona que tenga tu mismo servicio puedes ignorar la advertencia anterior pero tendras que esperar a que esa persona atienda el ticket..",
            side: "over",
          },
        },

        {
          element: "#modal-transferir-confirm",
          popover: {
            title: "Confirma la transferencia",
            description:
              "Click aqui para confirmar.",
            side: "left",
          },
          onHighlightStarted: (element) => {
            element.addEventListener(
              "click",
              () => {
                driverObj.moveNext();
              },
              { once: true }
            );
          },
        },
      ],
    });

    driverObj.drive();
  }, [activar, setActivar]);

  return null;
}
