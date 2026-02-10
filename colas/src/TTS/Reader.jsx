import React, { useRef, useImperativeHandle, forwardRef } from "react";
import useVoice from "./usevoice";
import { speakText } from "./TTS";
import dindongsong from "../assets/sound/dingdong.mp3"

const TextSpeaker = forwardRef((props, ref ) => {  //arreglar la declaracion de ding
  const voice = useVoice();
  const queue = useRef([]);
  const isSpeaking = useRef(false);
  
  const audioRef = useRef(typeof Audio !== "undefined" && props.ding!==false ? new Audio(dindongsong ) : null);
  // const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(App_params_config.sound.dingdong) : null);

  const playDingAsync = () => { 
    return new Promise((resolve) => {
      try {
        const audio = audioRef.current;
        if (!audio) return setTimeout(resolve, 1000);

        audio.currentTime = 0;
        const startTime = Date.now();

        const cleanup = () => {
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
          clearTimeout(stopTimer);
        };

        const stopTimer = setTimeout(() => {
          audio.pause();
          cleanup();
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 2000 - elapsed);
          setTimeout(resolve, remaining);
        }, 3000);

        const onEnded = () => {
          cleanup();
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 2000 - elapsed);
          setTimeout(resolve, remaining);
        };

        const onError = () => {
          cleanup();
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 2000 - elapsed);
          setTimeout(resolve, remaining);
        };

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(() => {
            cleanup();
            setTimeout(resolve, 500);
          });
        }
      } catch (e) {
        setTimeout(resolve, 500);
      }
    });
  };

  const processQueue = async () => {
    if (isSpeaking.current || queue.current.length === 0) return;

    const nextText = queue.current.shift();
    isSpeaking.current = true;

    await playDingAsync();

    speakText(nextText, voice, () => {
      isSpeaking.current = false;
      processQueue();
    });
  };

  const speak = (text) => {
    if (!text || !text.trim()) return;
    queue.current.push(text.trim());
    if (!isSpeaking.current) processQueue();
  };

  // 🔸 Exponer la función `speak` al padre
  useImperativeHandle(ref, () => ({ speak }));

  return null;
});

export default TextSpeaker;
