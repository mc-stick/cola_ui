import {QRCodeCanvas, QRCodeSVG} from 'qrcode.react';

/**
 * Componente para generar un QR a partir de un valor dinámico
 *
 * @param {string} value - Valor que se convertirá en QR (ej: ticketId o URL)
 * @param {number} size - Tamaño del QR (opcional)
 */
export default function TicketQR({ value, size = 100 }) {
  if (!value) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <QRCodeCanvas
        value={value}
        size={size}
        level="H"
      />
    </div>
  );
}
