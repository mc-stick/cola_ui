"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e2a4f] text-white relative overflow-hidden">
      {/* Luces de emergencia de fondo (Rojo y Azul) */}
      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-[#cc132c]/20 to-transparent pointer-events-none"
      />

      <div className="text-center z-10 px-6">
        {/* SVG Dinámico: Cable de Red Roto */}
        

        {/* Código 404 con efecto "Glitch" sutil */}
        <motion.h1
          animate={{
            x: [-1, 1, -1, 0],
            textShadow: [
              "10px 10px #cc132c",
              "-10px -10px #4ec2eb",
              "10px -10px #cc132c",
              "0px 0px #000",
            ],
          }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
          className="text-8xl md:text-9xl font-extrabold text-[#fad824]">
          404
        </motion.h1>

        {/* Título y Texto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <h2 className="text-2xl md:text-3xl font-bold mt-4 uppercase tracking-tighter">
            ¡ERROR DEL SERVIDOR!
          </h2>
          <p className="mt-3 text-gray-300 max-w-md mx-auto font-medium">
            La página no fue encontrada.
          </p>
        </motion.div>

        {/* Contenedor del Botón */}
        <div className="mt-10">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(204, 19, 44, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/")}
            className="bg-[#cc132c] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-lg">
            Reconectar sistema
          </motion.button>
        </div>

        {/* Línea de estado */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 bg-[#cc132c] rounded-full"
          />
          <p className="text-xs font-mono text-gray-400">
            STATUS: CONNECTION_ERROR
          </p>
        </div>
      </div>

      {/* Ruido visual de fondo (Scanlines) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
