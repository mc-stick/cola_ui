export const getTutorialDeAcceso = (onGuide) => [
  {
    title: "¡Hola! Bienvenido",
    content: [
      "Aquí podrás ver toda la ayuda y tutoriales necesarios para el uso de este equipo.",
      "Para salir de un tutorial da un toque en un lugar oscuro de la pantalla."
    ],
    action: {
      label: "Iniciar Guía Rápida",
      onClick: ()=>onGuide(1)
    }
  },
  {
    title: "Crea un ticket usando tu Teléfono",
    content: ["Te ayudaré a crear un ticket usando tu número de teléfono."],
    action: {
      label: "Crear un ticket",
      onClick: ()=>onGuide(2) 
    }
  },
  {
    title: "Crea un ticket usando tu Matricula",
    content: ["Te ayudaré a crear un ticket usando tu número de matricula."],
    action: {
      label: "Crear un ticket",
      onClick: ()=>onGuide(3) 
    }
  },
  {
    title: "Crea un ticket como Invitado",
    content: ["Te ayudaré a crear un ticket como Invitado."],
    action: {
      label: "Crear un ticket",
      onClick: ()=>onGuide(4) 
    }
  }
];

export const getTutorialDeAdmin = (onGuide) => [
  {
    title: "¡Hola! Bienvenido",
    content: [
      "Aquí podrás ver toda la ayuda y tutoriales necesarios para el uso de este equipo.",
      "Para salir de un tutorial da un toque en un lugar oscuro de la pantalla."
    ],
    action: {
      label: "Iniciar Guía Rápida",
      onClick: ()=>onGuide(1)
    }
  },
];