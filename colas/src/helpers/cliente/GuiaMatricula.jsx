import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaMatricula({ activar, setActivar }) {
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
            element: "#grid-opcion2",
            popover: {
              title: "Selecciona la opción Matricula.",
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
                  }, 500);
                  
                },
                { once: true }
              );
            },
          },
          {
            element: "#btn-accept",
            popover: {
              title: "Continuar al paso siguiente",
              description:
                "Cuando ingreses tu matricula se habilitará el botón, de lo contrario no podrás continuar.",
              side: "right",
            },
          }, {
            element: "#visualizador-id",
            popover: {
              title: "Crear ticket.",
              description:
                "Ingresa tu número. Recuerda que debe ser un número que sea propio y válido. (Evita usar un número que no sea propio)",
              side: "top",
            },
          },
          {
            element: "#btn-accept",
            popover: {
              title: "Continuemos creando un ticket.",
              description:
                "Presiona aqui para continuar.",
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
          {
            element: "#table-service",
            popover: {
              title: "Selecciona un servicio.",
              description:
                "Presiona el servicio que necesitas para continuar.",
              side: "bottom",
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
            element: "#ticket-creado",
            popover: {
              title: "Felicidades, ticket creado con éxito.",
              description:
                "Ahora solo espera a que tu número de ticket sea llamado en la pantalla. \n\n Aquí finaliza el tutorial, presiona aceptar para que otra persona pueda crear un ticket.",
              side: "bottom",
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
