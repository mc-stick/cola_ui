import React, { useEffect, useRef } from "react";
import TextSpeaker from "./Reader";

export default function DemoSpeaker({ number="", text="", song=false }) {
  const speakerRef = useRef();

  const handleSpeak = () => {
    if (speakerRef.current) {
      speakerRef.current.speak(`¡, ${number}, " " ${text} !`);
    }
  };

  useEffect(() => {
   
    const timer = setTimeout(() => {
      handleSpeak();
    }, 500);

  
    return () => clearTimeout(timer);
  }, [text, number]);


  return (
    
    <>
      <TextSpeaker ref={speakerRef} ding={song} />
    </>
  );
}
