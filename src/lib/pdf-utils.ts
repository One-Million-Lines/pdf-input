import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Template, TemplateField, FilledValues } from '@/types/template';

export async function generateFilledPDF(
  originalPdfData: ArrayBuffer,
  template: Template,
  values: FilledValues
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalPdfData);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const field of template.fields) {
    const value = values[field.id] || field.defaultValue || '';
    if (!value) continue;

    const page = pages[field.pageIndex];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();
    const pageMeta = template.pagesMeta[field.pageIndex];

    if (!pageMeta) continue;

    // Convert relative coordinates to PDF points
    // Note: PDF coordinates are from bottom-left, so we need to flip Y
    const x = field.x * pageWidth;
    const y = pageHeight - (field.y * pageHeight) - (field.h * pageHeight);
    
    // Calculate font size - scale from screen pixels to PDF points
    // The pageMeta stores the rendered size, we need to scale proportionally
    const scaleRatio = pageWidth / pageMeta.width;
    const fontSize = field.fontSize * scaleRatio;

    page.drawText(value, {
      x: x + 2, // Small padding
      y: y + (field.h * pageHeight) / 2 - fontSize / 3, // Center vertically
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: field.w * pageWidth - 4,
    });
  }

  return pdfDoc.save();
}

export function downloadPDF(data: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
