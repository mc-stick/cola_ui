export const obtenerSaludo = () => {
  const hora = new Date().getHours();

  const saludosManana = [
    "¡Buenos días!",
    "¡Muy buenos días!",
    "¡Excelente mañana!",
    "¡Feliz mañana"
  ];

  const saludosTarde = [
    "¡Buenas tardes!",
    "¡Muy buenas tardes!",
    "¡Excelente tarde!",
  ];

  const listaSaludo = hora < 12 ? saludosManana : saludosTarde;
  const saludoAleatorio = listaSaludo[Math.floor(Math.random() * listaSaludo.length)];

  return saludoAleatorio;
};