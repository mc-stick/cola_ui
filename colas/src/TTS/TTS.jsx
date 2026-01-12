export const speakText = (text, voice, onEnd) => {
  if (!text || !voice) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.75;
  utterance.pitch = 1.1;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};
