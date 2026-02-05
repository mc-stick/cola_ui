import GuiaUsuario from "./cliente/GuiaCliente";
import GuiaInvitado from "./cliente/GuiaInvitado";
import GuiaMatricula from "./cliente/GuiaMatricula";
import GuiaPaso2 from "./cliente/GuiaTelefono";
import GuiaOperador from "./operator/GuiaOperador";


export default function SelectorGuia({ activar, setActivar, guia }) {
  // Solo renderizamos la guía que coincide con el paso del flujo
  switch (guia) {
    case 1:
      return <GuiaUsuario activar={activar} setActivar={setActivar} />;
    case 2:
      return <GuiaPaso2 activar={activar} setActivar={setActivar} />;
    case 3:
      return <GuiaMatricula activar={activar} setActivar={setActivar} />;
    case 4:
      return <GuiaInvitado activar={activar} setActivar={setActivar} />;
    case 5:
      return <GuiaOperador activar={activar} setActivar={setActivar} />;
    default:
      return null;
  }
}