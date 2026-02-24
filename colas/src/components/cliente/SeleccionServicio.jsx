import { useEffect, useState } from "react";
import { BackBtnCli } from "../../pages/PantallaCliente";
import api from "../../services/api";
import { obtenerSaludo } from "../../utils/getWelcome";
import { AlertTriangle } from "lucide-react";

export default function PasoSeleccionServicio({
  servicios,
  onSelect,
  setPaso,
  setIdentificacion,
  identificacion,
}) {
  const [user, setUser] = useState("");
  const [show, setShow] = useState(true);

  const Backbtn = () => {
    setPaso(1);
    setIdentificacion("");
    setShow(true)
  };

  const handleVerificar = async () => {
    const data = await api.verificarUsuario(identificacion);
    console.log("LDAP: ident", data);
    if (data && data.displayName) {
      setUser(data.displayName);
    } else {
      setShow(false);
      setTimeout(() => {
        Backbtn();
      }, 10000);
      
    }
  };

  useEffect(() => {
    if (identificacion && identificacion.length===8) handleVerificar();
  }, [identificacion]);

  return (
    <>
      <div className="fixed w-screen h-screen flex flex-col items-center bg-primary pt-16 pb-8 px-8">
        {show ? (
          <div id="table-service" className="animation-fade-in text-center">
            <span className="text-3xl font-bold text-white m-8">
              {obtenerSaludo()}
              <span className="text-[--color-mono-gold]">{" " + user}</span>
              {`, bienvenido(a) a UCNE`}
            </span>
            <h2 className="text-3xl font-bold text-white m-8">
              Selecciona un servicio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  style={{ borderTopColor: s.color }}
                  className="bg-white w-full sm:w-auto p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-left border-t-8">
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
        ) : (
          <div className="animation-fade-in max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-300 rounded-lg shadow-lg flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />

            <h2 className="text-2xl font-bold text-red-700">
              Usuario incorrecto
            </h2>

            <p className="text-red-600 text-sm">
              Por favor verifica tu ID y vuelve a intentarlo.
            </p>
          </div>
        )}

        <BackBtnCli step={Backbtn} />
      </div>
    </>
  );
}
