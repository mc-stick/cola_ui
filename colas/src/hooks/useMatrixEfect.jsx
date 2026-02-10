import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function useMatrixText(text, active, duration = 1200) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const totalFrames = Math.floor(duration / 50);

    const interval = setInterval(() => {
      const progress = frame / totalFrames;

      const result = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < progress * text.length) return char;

          // menos ruido: a veces deja el char real
          return Math.random() > 0.6
            ? char
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setOutput(result);
      frame++;

      if (frame >= totalFrames) {
        setOutput(text);
        clearInterval(interval);
      }
    }, 50); // ⬅️ más lento

    return () => clearInterval(interval);
  }, [text, active, duration]);

  return output;
}
