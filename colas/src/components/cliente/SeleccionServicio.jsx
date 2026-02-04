import { BackBtnCli } from "../../pages/PantallaCliente";

export default function PasoSeleccionServicio({ servicios, onSelect, setPaso, setIdentificacion }) {

    const Backbtn =()=>{
        setPaso(1);
        setIdentificacion("");
    }
  return (
    <>
      <div className="max-w-6xl mx-auto p-8">
        <div id="table-service" className="animation-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 m-8 text-center">
            Selecciona el servicio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                style={{ borderTopColor: s.color }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-left border-t-8">
                <div
                  className="text-5xl font-extrabold mb-4"
                  style={{ color: s.color }}>
                  {s.codigo}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {s.nombre}
                </h3>
                <p className="text-gray-600">{s.descripcion}</p>
              </button>
            ))}
          </div>
        </div>
        
        <BackBtnCli step={Backbtn}/>
        
      </div>
    </>
  );
}
