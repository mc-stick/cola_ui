import {QRCodeCanvas, QRCodeSVG} from 'qrcode.react';
const PAGE_URL = import.meta.env.VITE_PAGE_URL;

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
        value={PAGE_URL+value}
        size={size}
        level="H"
      />
    </div>
  );
}
