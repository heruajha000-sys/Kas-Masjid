/**
 * Image Compression Utility
 * Compresses camera/phone photos (often 3MB - 10MB) down to optimized JPEG (~50KB - 90KB)
 * using HTML5 Canvas to prevent local storage quota overflow.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.72
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKB = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while clamping max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering context tidak didukung'));
          return;
        }

        // Fill white background for transparent PNG/WebP receipts
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with specified compression quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate size of base64 data
        const base64Content = dataUrl.split(',')[1] || '';
        const sizeInBytes = Math.round((base64Content.length * 3) / 4);
        const compressedSizeKB = Math.round(sizeInBytes / 1024);
        const savingsPercent = Math.max(
          0,
          Math.round(((originalSizeKB - compressedSizeKB) / Math.max(originalSizeKB, 1)) * 100)
        );

        resolve({
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          savingsPercent,
          width,
          height,
        });
      };

      img.onerror = () => reject(new Error('Gagal memproses berkas gambar'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsDataURL(file);
  });
}
