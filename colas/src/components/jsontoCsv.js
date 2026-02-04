import Papa from 'papaparse';

/**
 * Genera un CSV desde un array de objetos y lo descarga en el navegador
 * @param {Array} datos - Array de objetos
 * @param {String} nombreArchivo - Nombre del CSV
 */
export function exportarCSV(datos, nombreArchivo = 'datos.csv') {
  if (!Array.isArray(datos) || datos.length === 0) return;
  

  const csv = Papa.unparse(datos);

//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta varios arrays de objetos como un solo CSV
 * @param {Array[]} jsonArrays - Array de arrays de objetos
 * @param {String} nombreArchivo - Nombre del CSV
 */
export function exportarVariosCSV(jsonArrays, nombreArchivo = 'datos.csv') {
  if (!Array.isArray(jsonArrays) || jsonArrays.length === 0) {
    console.error('No hay datos para exportar');
    return;
  }

  // Combinar todos los arrays en uno solo
  const datosCombinados = jsonArrays.flat();

  if (datosCombinados.length === 0) {
    console.error('Los arrays están vacíos');
    return;
  }

  // Convertir a CSV
  const csv = Papa.unparse(datosCombinados);

  // BOM para Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  // Descargar archivo
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
