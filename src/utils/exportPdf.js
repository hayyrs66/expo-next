import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generatePDF = async () => {
  if (!selectedDate) {
    alert("Selecciona una fecha para exportar los datos.");
    return;
  }

  try {
    // Obtener el contenido del dashboard o sección a exportar
    const content = document.getElementById("pdf-content"); // Asegúrate de que esta ID esté configurada en el div deseado

    // Capturar el área seleccionada con html2canvas
    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Crear un PDF con jsPDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Guardar el archivo PDF
    pdf.save(`Reporte_${selectedDate}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("Hubo un error al generar el PDF. Intenta de nuevo.");
  }
};
