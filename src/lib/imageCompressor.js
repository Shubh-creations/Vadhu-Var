/**
 * Client-side Image Compressor & Resizer Utility
 * Handles Files, Blobs, Data URLs, and high-resolution camera photos smoothly
 */
export const compressImage = (fileOrDataUrl, maxWidth = 800, maxHeight = 800, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      return resolve('');
    }

    // 1. If it's already a Data URL or Image URL string
    if (typeof fileOrDataUrl === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;

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
          if (!ctx) return resolve(fileOrDataUrl);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          console.warn('Canvas compression error:', e);
          resolve(fileOrDataUrl);
        }
      };

      img.onerror = () => {
        resolve(fileOrDataUrl);
      };

      img.src = fileOrDataUrl;
      return;
    }

    // 2. If it's a File or Blob
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        return resolve('');
      }

      // If non-image document (PDF), resolve Data URL directly
      if (fileOrDataUrl.type && !fileOrDataUrl.type.startsWith('image/')) {
        return resolve(result);
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

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
          if (!ctx) return resolve(result);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          console.warn('Canvas compression error:', e);
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(fileOrDataUrl);
  });
};

export default compressImage;
