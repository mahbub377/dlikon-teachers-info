import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  page1Id?: string;
  page2Id?: string;
  filename?: string;
  onProgress?: (status: string, percentage: number) => void;
}

/**
 * Converts modern CSS colors (oklch, lab, lch) to standard rgb/hex using native browser canvas context.
 * Prevents html2canvas from crashing on Tailwind v4 modern color functions.
 */
function convertCssColor(colorStr: string, helperCtx: CanvasRenderingContext2D | null): string {
  if (!colorStr) return '#000000';
  if (!colorStr.includes('oklch') && !colorStr.includes('lab') && !colorStr.includes('lch') && !colorStr.includes('color(')) {
    return colorStr;
  }
  if (!helperCtx) return '#0f172a';
  try {
    helperCtx.fillStyle = '#0f172a';
    helperCtx.fillStyle = colorStr;
    return helperCtx.fillStyle || '#0f172a';
  } catch {
    return '#0f172a';
  }
}

/**
 * Sanitizes an element and its cloned document so html2canvas doesn't crash on modern CSS colors
 * and never taints the canvas with unresolved cross-origin images.
 */
function sanitizeClonedDocument(clonedDoc: Document, targetElId: string, helperCtx: CanvasRenderingContext2D | null) {
  // 1. Sanitize all <style> text content so oklch does not become dark fills
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach(style => {
    if (style.textContent && /oklch|oklab|lab\(|lch\(|color\(/i.test(style.textContent)) {
      style.textContent = style.textContent
        .replace(/oklch\([^)]*\)/gi, '#ffffff')
        .replace(/oklab\([^)]*\)/gi, '#ffffff')
        .replace(/lab\([^)]*\)/gi, '#ffffff')
        .replace(/lch\([^)]*\)/gi, '#ffffff')
        .replace(/color\([^)]*\)/gi, '#ffffff');
    }
  });

  // 2. Locate target element in clone
  const clonedEl = clonedDoc.getElementById(targetElId);
  if (clonedEl) {
    clonedEl.style.transform = 'none';
    clonedEl.style.margin = '0 auto';
    clonedEl.style.boxShadow = 'none';
    clonedEl.style.backgroundColor = '#ffffff';
    clonedEl.style.color = '#000000';

    // 3. Sanitize inline colors on all descendants
    const allClonedNodes = clonedEl.querySelectorAll('*');
    allClonedNodes.forEach(node => {
      const htmlNode = node as HTMLElement;
      if (htmlNode.style) {
        if (htmlNode.style.backgroundColor && /oklch|lab|lch|color\(/i.test(htmlNode.style.backgroundColor)) {
          htmlNode.style.backgroundColor = '#ffffff';
        }
        if (htmlNode.style.color && /oklch|lab|lch|color\(/i.test(htmlNode.style.color)) {
          htmlNode.style.color = '#000000';
        }
        if (htmlNode.style.borderColor && /oklch|lab|lch|color\(/i.test(htmlNode.style.borderColor)) {
          htmlNode.style.borderColor = '#1e293b';
        }
      }
    });

    // 4. Critical: Ensure any <img> tags do not taint the canvas
    const images = clonedEl.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
    });
  }
}

/**
 * High-fidelity Element Capture using html2canvas with oklch sanitizer and automatic fallback.
 */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Ensure document fonts are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('fonts.ready check ignored:', e);
    }
  }

  const helperCanvas = document.createElement('canvas');
  const helperCtx = helperCanvas.getContext('2d');

  try {
    return await html2canvas(element, {
      scale: 2, // High resolution (crisp 300 DPI equivalent)
      useCORS: true,
      allowTaint: false, // Ensures canvas.toDataURL() is never blocked
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        sanitizeClonedDocument(clonedDoc, element.id, helperCtx);
      }
    });
  } catch (firstErr) {
    console.warn('Primary html2canvas capture failed, trying fallback mode:', firstErr);
    // Robust fallback: remove conflicting external styles and apply clean print styles in clone
    return await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Strip any style tag containing oklch
        clonedDoc.querySelectorAll('style').forEach(st => {
          if (st.textContent && /oklch|oklab/i.test(st.textContent)) {
            st.remove();
          }
        });
        const fallbackStyle = clonedDoc.createElement('style');
        fallbackStyle.textContent = `
          @font-face {
            font-family: 'Kalpurush';
            src: url('${window.location.origin}/fonts/kalpurush.woff2') format('woff2'),
                 url('${window.location.origin}/fonts/kalpurush.ttf') format('truetype');
            font-weight: 100 900;
            font-style: normal;
          }
          * { font-family: 'Kalpurush', -apple-system, sans-serif !important; box-sizing: border-box !important; }
          body, html { background: #ffffff !important; color: #000000 !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          td, th { border: 1px solid #1e293b !important; }
        `;
        clonedDoc.head.appendChild(fallbackStyle);
        sanitizeClonedDocument(clonedDoc, element.id, helperCtx);
      }
    });
  }
}

/**
 * Generates and downloads a clean 2-page A4 PDF file directly in the browser.
 * 100% reliable and fail-proof inside iframes and standard browsers.
 */
export async function downloadTwoPagePdf({
  page1Id = 'a4-page-1',
  page2Id = 'a4-page-2',
  filename = 'ডি-লিকন_মডেল_একাডেমী_শিক্ষক_তথ্য_ফরম_ব্ল্যাঙ্ক.pdf',
  onProgress
}: PdfExportOptions): Promise<{ success: boolean; blobUrl?: string }> {
  try {
    onProgress?.('১ম পাতা প্রস্তুত হচ্ছে...', 20);

    // Wait slightly for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 200));

    const page1El = document.getElementById(page1Id);
    if (!page1El) {
      throw new Error(`পৃষ্ঠা ১ (${page1Id}) পাওয়া যায়নি`);
    }

    const canvas1 = await captureElement(page1El);
    let imgData1: string;
    try {
      imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
    } catch (e) {
      console.warn('JPEG toDataURL failed, trying PNG:', e);
      imgData1 = canvas1.toDataURL('image/png');
    }

    onProgress?.('২য় পাতা প্রস্তুত হচ্ছে...', 55);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Add Page 1
    const margin = 4; // 4mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight1 = (canvas1.height * contentWidth) / canvas1.width;
    const finalHeight1 = Math.min(contentHeight1, pdfHeight - (margin * 2));
    pdf.addImage(imgData1, 'JPEG', margin, margin, contentWidth, finalHeight1, undefined, 'FAST');

    // Add Page 2 if exists
    const page2El = document.getElementById(page2Id);
    if (page2El) {
      onProgress?.('২য় পাতা যুক্ত করা হচ্ছে...', 80);
      const canvas2 = await captureElement(page2El);
      let imgData2: string;
      try {
        imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
      } catch (e) {
        console.warn('JPEG toDataURL failed for page 2, trying PNG:', e);
        imgData2 = canvas2.toDataURL('image/png');
      }

      pdf.addPage('a4', 'portrait');
      const contentHeight2 = (canvas2.height * contentWidth) / canvas2.width;
      const finalHeight2 = Math.min(contentHeight2, pdfHeight - (margin * 2));
      pdf.addImage(imgData2, 'JPEG', margin, margin, contentWidth, finalHeight2, undefined, 'FAST');
    }

    onProgress?.('PDF ফাইল সেভ হচ্ছে...', 95);

    // Generate blob and download
    let blobUrl = '';
    try {
      const pdfBlob = pdf.output('blob');
      blobUrl = URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        if (downloadLink.parentNode) {
          downloadLink.parentNode.removeChild(downloadLink);
        }
      }, 2000);
    } catch (saveErr) {
      console.warn('Blob link download attempted fallback to direct save:', saveErr);
      pdf.save(filename);
    }

    onProgress?.('ডাউনলোড সম্পন্ন!', 100);
    return { success: true, blobUrl };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Downloads any given DOM element as an A4 PDF directly in browser.
 * Clean, ink-friendly, and handles single or multi-page seamlessly.
 */
export async function downloadSingleElementAsPdf(
  elementId: string, 
  filename: string = 'ডকুমেন্ট.pdf',
  onProgress?: (status: string, percentage: number) => void
): Promise<{ success: boolean; blobUrl?: string }> {
  try {
    onProgress?.('PDF ফাইল প্রস্তুত হচ্ছে...', 20);
    await new Promise(resolve => setTimeout(resolve, 150));
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`এলিমেন্ট (${elementId}) পাওয়া যায়নি`);
    }

    onProgress?.('পাতা রেন্ডার করা হচ্ছে...', 50);
    const canvas = await captureElement(el);
    let imgData: string;
    try {
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    } catch {
      imgData = canvas.toDataURL('image/png');
    }

    onProgress?.('A4 পাতায় বিন্যাস করা হচ্ছে...', 80);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = 5;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    if (contentHeight > pdfHeight - (margin * 2)) {
      let heightLeft = contentHeight;
      let position = margin;
      let pageNum = 1;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = margin - (pageNum * (pdfHeight - margin * 2));
        pdf.addPage('a4', 'portrait');
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - margin * 2);
        pageNum++;
      }
    } else {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
    }

    onProgress?.('ডাউনলোড ফাইল তৈরি হচ্ছে...', 95);
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      if (downloadLink.parentNode) {
        downloadLink.parentNode.removeChild(downloadLink);
      }
    }, 2000);

    onProgress?.('ডাউনলোড সম্পন্ন!', 100);
    return { success: true, blobUrl };
  } catch (err) {
    console.error('downloadSingleElementAsPdf error:', err);
    throw err;
  }
}

/**
 * Isolated Hidden Iframe Print Engine.
 * Fixes the issue where browser print shows the outer AI Studio workspace or distorted layout.
 * Creates an invisible iframe styled with standard A4 dimensions, triggering browser print on ONLY the 2 pages.
 */
export function printViaIsolatedIframe(elementId: string = 'printable-two-page-area'): void {
  try {
    const el = document.getElementById(elementId);
    if (!el) {
      window.focus();
      window.print();
      return;
    }

    // Remove any previously created print iframe
    const oldIframe = document.getElementById('dlma-print-hidden-iframe');
    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.removeChild(oldIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'dlma-print-hidden-iframe';
    // CRITICAL FIX: Must give real A4 dimensions and opacity:0 (NOT visibility:hidden and NOT width:0)
    // so Chromium creates a valid print layout box without distortion.
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.focus();
      window.print();
      return;
    }

    // Grab all current stylesheets and styles to preserve fonts & layout
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(sheet => {
      stylesHtml += sheet.outerHTML + '\n';
    });

    const contentHtml = el.outerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <title>ডি-লিকন মডেল একাডেমী - শিক্ষক তথ্য ফরম (২ পাতা)</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${stylesHtml}
          <style>
            @font-face {
              font-family: 'Kalpurush';
              src: url('${window.location.origin}/fonts/kalpurush.woff2') format('woff2'),
                   url('${window.location.origin}/fonts/kalpurush.ttf') format('truetype');
              font-weight: 100 900;
              font-style: normal;
            }
            @page {
              size: A4 portrait;
              margin: 6mm 8mm 6mm 8mm;
            }
            * {
              box-sizing: border-box;
              font-family: 'Kalpurush', -apple-system, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Kalpurush', -apple-system, sans-serif !important;
              width: 100% !important;
            }
            #printable-two-page-area {
              width: 100% !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              transform: none !important;
              display: block !important;
            }
            .print-page {
              width: 100% !important;
              max-width: 100% !important;
              min-height: 275mm !important;
              box-shadow: none !important;
              border: none !important;
              padding: 2mm 3mm !important;
              margin: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            #a4-page-1 {
              page-break-after: always !important;
              break-after: page !important;
            }
            #a4-page-2 {
              page-break-before: always !important;
              break-before: page !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    doc.close();

    // Trigger iframe print once fonts and styles are parsed
    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print():', err);
        window.focus();
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 15000);
      }
    };

    if (iframe.contentWindow && 'fonts' in iframe.contentWindow.document) {
      iframe.contentWindow.document.fonts.ready
        .then(() => setTimeout(triggerPrint, 250))
        .catch(() => setTimeout(triggerPrint, 300));
    } else {
      setTimeout(triggerPrint, 350);
    }
  } catch (e) {
    console.warn('Isolated iframe print caught error, falling back:', e);
    window.focus();
    window.print();
  }
}

/**
 * Safe print helper that triggers isolated print.
 */
export function triggerSafePrint(): void {
  printViaIsolatedIframe('printable-two-page-area');
}
