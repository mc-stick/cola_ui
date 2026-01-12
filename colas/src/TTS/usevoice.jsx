import { useEffect, useState } from "react";

export default function useVoice() {
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return; 
      const preferredVoices = [
        "Google español de Estados Unidos",
        "Google español (Latinoamérica)",
        "Google español (España)",
        "Microsoft Sabina - Spanish (Spain)",
        "Microsoft Dalia - Spanish (Mexico)",
        "Microsoft Camila - Spanish (Chile)",
        "Microsoft Laura - Spanish (Colombia)",
        "Microsoft Paloma - Spanish (Argentina)",
        "Mónica",
        "Paulina",
        "Marisol",
        // "Microsoft Helena - Spanish (Spain)",
        "Microsoft Elsa - Spanish (Mexico)",
        "Microsoft Sofia - Spanish (Spain)",
        "Microsoft Fernanda - Spanish (Argentina)",
      ];

      const naturalVoice =
        voices.find((v) => preferredVoices.includes(v.name)) ||
        voices.find((v) => v.name.toLowerCase().includes("google español")) ||
        voices.find((v) => v.lang.startsWith("es")) ||
        voices[0];

      setVoice(naturalVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return voice;
}
