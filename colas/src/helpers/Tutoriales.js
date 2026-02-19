export const getTutorialDeAcceso = (onGuide) => [
  {
    title: "¡Bienvenido! ",
    content: [
      "Aquí podrás ver toda la ayuda y tutoriales necesarios para el uso de este equipo."
    ],
    action: {
      label: "Iniciar Guía Rápida",
      onClick: ()=>onGuide(1)
    }
  },
  {
    title: "Ya tienes un ticket para mas tarde?",
    content: [
      "Te mostraré como colocarte en la fila lo mas pronto posible, este paso solo se puede realizar si tu ticket fue marcado para volver mas tarde."
    ],
    action: {
      label: "Verificar si mi tickt aun funciona",
      onClick: ()=>onGuide(6)
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
    title: "Crea un ticket usando tu ID",
    content: ["Te ayudaré a crear un ticket usando tu número de ID."],
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

export const getTutorialDeAdmin = (onGuide,user="") => [
  {
    title: `¡Bienvenido ${user?user:""}! `,
    content: [
      "Aquí podrás ver toda la ayuda y tutoriales necesarios para el uso de este equipo.",
      "Para salir de un tutorial da un toque en un lugar oscuro de la pantalla."
    ],
    action: {
      label: "Iniciar Guía Rápida",
      onClick: ()=>onGuide(5)
    }
  },
];

export const getTutorialDeOperador = (onGuide,user="") => [
  {
    title: `¡Bienvenido ${user?user:""} !`,
    content: [
      "Aquí podrás ver toda la ayuda y tutoriales necesarios para el uso de este equipo.",
      "Para salir de un tutorial da un toque en un lugar oscuro de la pantalla."
    ],
    action: {
      label: "Iniciar Guía Rápida",
      onClick: ()=>onGuide(5)
    }
  },
];