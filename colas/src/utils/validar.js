const PREFIJOS_RD = ["809", "829", "849"];

export const esTelefonoRDValido = (valor) => {
  if (valor.length !== 10){  return };
  if (valor.length > 10) { return };
  return PREFIJOS_RD.some(prefijo => valor.startsWith(prefijo));
};
