import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function GuiaPaso2({ activar, setActivar }) {
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
            element: "#grid-opcion1",
            popover: {
              title: "Selecciona La opción teléfono.",
              description:
                "RECUERDA: Primero realiza la acción y luego presiona el boton siguiente.",
              side: "top",
            },
          },{
            element: "#btn-delete",
            popover: {
              title: "Elimina un dígito",
              description:
                "Usa este boton para eliminar los dígitos que no sean necesarios. ( justo ahora está deshabilitado porque no hay nada que borrar ).",
              side: "left",
            },
          },
          {
            element: "#btn-accept",
            popover: {
              title: "Continuar al paso siguiente",
              description:
                "Cuando ingreses un teléfono correcto se habilitará el botón, de lo contrario no podrás continuar.",
              side: "right",
            },
          },
          {
            element: "#btn-regresar",
            popover: {
              title: "¿No quieres usar tu teléfono?",
              description:
                "Puedes volver atrás para cambiar el método de identificación.",
              side: "right",
            },
          }, {
            element: "#visualizador-id",
            popover: {
              title: "Crear ticket.",
              description:
                "Ingresa tu número. Recuerda que debe ser un número que sea propio y válido de Rep. Dom. (Evita usar un número que no sea propio)",
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
