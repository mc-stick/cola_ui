export default function AnimatedBubleBackground() {
  return (
    <>
      <div>
        {/* Burbuja derecha, rápida */}
        <span
          className="bubble"
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "10%", // fija a la derecha
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            backgroundColor: "#ffd900",
            opacity: 0.7,
            animation: "riseRight 20s linear infinite",
          }}
        />
        <span
          className="bubble"
          style={{
            position: "absolute",
            bottom: "-550px",
            left: "25%", // fija a la izquierda
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            backgroundColor: "#ffd900",
            opacity: 0.7,
            animation: "riseRight 35s linear infinite",
          }}
        />

        {/* Burbuja izquierda, lenta */}
        <span
          className="bubble"
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "10%", // fija a la izquierda
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: "#ff3b3b ",
            opacity: 0.7,
            animation: "riseLeft 20s linear infinite",
          }}
        />
        {/* Burbuja izquierda, lenta */}
        <span
          className="bubble"
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "35%", // fija a la derecha
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            backgroundColor: "#ff3b3b ",
            opacity: 0.7,
            animation: "riseLeft 40s linear infinite",
          }}
        />
      </div>
    </>
  );
}
