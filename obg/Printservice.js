import escpos from 'escpos';
import USB from 'escpos-usb';
const device = new USB();
const options = { encoding: "CP850"}
const printer = new escpos.Printer(device, options);

function fechaHoraActual12h() {
  const d = new Date();

  const dia = d.getDate().toString().padStart(2, '0');
  const mes = (d.getMonth() + 1).toString().padStart(2, '0');
  const anio = d.getFullYear();

  let horas = d.getHours();
  const minutos = d.getMinutes().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';

  horas = horas % 12;
  horas = horas ? horas : 12;

  return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
}

export async function imprimirTexto({ logo = "logo aqui", description = "", turno = "", servicio = '', footer = "footer" }) {
  await new Promise((resolve, reject) => {
    device.open(err => (err ? reject(err) : resolve()));
  });

  printer
    .font('a')
    .align('ct')
    .size(2, 0.5)
    .text('\n')
    .text(logo)
    .size(0.5, 0.5)
    .text(description)
    .text('')
    .text("Número de ticket")
  printer
    .font('B')
    .size(2, 0.5)
    .text('------------')
    .text(turno)
    .text('------------')
  printer
    .font('a')
    .size(1, 0.5)
    .text(servicio)
    .size(0.5, 0.5)
    .text('\n')
    .text('Espere al llamado de su turno.')


  printer
    .font('a')
    .align('ct')
    .size(0.5, 0.5)
    .text(fechaHoraActual12h())

  printer.cut().close();
}



