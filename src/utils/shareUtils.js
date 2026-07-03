import html2canvas from 'html2canvas';

/**
 * Captures a DOM element and shares it via the native Web Share API (WhatsApp, etc.)
 * or downloads it if sharing is not supported.
 * 
 * @param {string} elementId - The ID of the DOM element to capture
 * @param {string} filename - The default filename (e.g. 'ticket.png')
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export async function captureAndShare(elementId, filename = 'documento.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    // 1. Capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true, // Allow external images (like signatures/logos)
      backgroundColor: '#ffffff',
      logging: false
    });

    // 2. Convert to Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    
    if (!blob) throw new Error('Failed to create blob from canvas');

    const file = new File([blob], filename, { type: 'image/png' });

    // 3. Try Native Share (Mobile/Safari)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Pikanditas',
          text: 'Aquí tienes tu comprobante oficial de Pikanditas 🐻🌶️'
        });
        return true;
      } catch (shareError) {
        // User cancelled share or it failed
        if (shareError.name !== 'AbortError') {
          console.error('Error sharing:', shareError);
        }
        // Fallthrough to download if they cancelled? No, if aborted just return
        if (shareError.name === 'AbortError') return true; 
      }
    }

    // 4. Fallback: Download Image (Desktop / Unsupported browsers)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error('Capture and share error:', error);
    alert('Ocurrió un error al generar la imagen del documento.');
    return false;
  }
}
