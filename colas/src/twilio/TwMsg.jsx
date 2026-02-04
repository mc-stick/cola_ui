export const SendTwilioSms = async (msg, to) => {
  const services = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${services}/msg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg, to }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return { success: false, error: "Error de conexión" };
  }
};
