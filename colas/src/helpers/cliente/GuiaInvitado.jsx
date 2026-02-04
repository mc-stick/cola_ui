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
        // Resetea el estado al cerrar
        onDestroyed: () => setActivar(false),
        steps: [
          {
            element: "#grid-opcion3",
            popover: {
              title: "Selecciona La opción Invitado.",
              description:
                "RECUERDA: Primero realiza la acción y luego presiona el boton siguiente.",
              side: "top",
            },
          },
          {
            element: "#btn-regresar",
            popover: {
              title: "¿Quires regresar a la pagina anterior?",
              description:
                "Puedes volver atrás para cambiar el método de identificación.",
              side: "right",
            },
          },
          {
            element: "#table-service",
            popover: {
              title: "Selecciona un servicio.",
              description:
                "Presiona el servicio que necesitas para continuar.",
              side: "bottom",
            },
          },
          {
            element: "#ticket-creado",
            popover: {
              title: "Felicidades, ticket creado con éxito.",
              description:
                "Ahora solo espera a que tu número de ticket sea llamado en la pantalla. \n\n Aquí finaliza el tutorial, presiona aceptar para que otra persona pueda crear un ticket.",
              side: "bottom",
            },
          },
        ],
      });
      driverObj.drive();
    }
  }, [activar, setActivar]);

  return null;
}
