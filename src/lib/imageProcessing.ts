import { UpscaleLevel } from '@/types';

/**
 * Remove background from an image using @imgly/background-removal
 * Returns a blob URL of the processed image (transparent PNG)
 */
/** Max dimension sent to the AI model — 512 keeps quality acceptable while being ~4x faster than 1024 */
const MODEL_MAX_PX = 512;

/**
 * Downscale an image blob to MODEL_MAX_PX on its longest edge.
 * Returns the original blob if already small enough.
 */
async function prepareForModel(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      if (Math.max(w, h) <= MODEL_MAX_PX) { resolve(blob); return; }
      const scale = MODEL_MAX_PX / Math.max(w, h);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => resolve(b ?? blob), 'image/png');
    };
    img.onerror = () => resolve(blob);
    img.src = url;
  });
}

export async function removeBackground(imageUrl: string): Promise<string> {
  const { removeBackground } = await import('@imgly/background-removal');

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const modelBlob = await prepareForModel(blob);

  const resultBlob = await removeBackground(modelBlob, {
    model: 'small',
    device: 'gpu',           // WebGL acceleration — major speedup on supported browsers
    output: {
      format: 'image/png',
      quality: 1,
    },
  });

  return URL.createObjectURL(resultBlob);
}

/**
 * Upscale an image using high-quality canvas interpolation
 * with sharpening post-process for crisp results
 */
export async function upscaleImage(
  imageUrl: string,
  level: UpscaleLevel
): Promise<string> {
  const multiplier = level === '4x' ? 4 : level === '2x' ? 2 : 1;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetW = img.naturalWidth * multiplier;
      const targetH = img.naturalHeight * multiplier;

      // Step-up upscaling for better quality (avoid single large jump)
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (multiplier > 1) {
        // Step-by-step 2x upscale for better quality
        let currentCanvas = document.createElement('canvas');
        currentCanvas.width = img.naturalWidth;
        currentCanvas.height = img.naturalHeight;
        const currentCtx = currentCanvas.getContext('2d')!;
        currentCtx.drawImage(img, 0, 0);

        const steps = multiplier === 4 ? 2 : 1;
        for (let s = 0; s < steps; s++) {
          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = currentCanvas.width * 2;
          nextCanvas.height = currentCanvas.height * 2;
          const nextCtx = nextCanvas.getContext('2d')!;
          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = 'high';
          nextCtx.drawImage(currentCanvas, 0, 0, nextCanvas.width, nextCanvas.height);
          currentCanvas = nextCanvas;
        }

        // Apply sharpening filter via pixel manipulation
        const finalCtx = canvas.getContext('2d')!;
        finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
        applySharpening(finalCtx, targetW, targetH);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Blob creation failed')); return; }
        resolve(URL.createObjectURL(blob));
      }, 'image/png', 1.0);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Simple unsharp mask sharpening using convolution
 */
function applySharpening(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  // Unsharp mask kernel (mild)
  const kernel = [
    0, -0.5, 0,
    -0.5, 3, -0.5,
    0, -0.5, 0,
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      // Only sharpen if pixel is not fully transparent
      if (copy[idx + 3] === 0) continue;

      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ni = ((y + ky) * w + (x + kx)) * 4;
            val += copy[ni + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        data[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Detect rough subject type from image using canvas color analysis
 * This provides a fast client-side "smart label" without any API calls
 */
export async function detectImageSubject(imageUrl: string): Promise<{ label: string; confidence: number }[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      let skinPixels = 0;
      let greenPixels = 0;
      let bluePixels = 0;
      let grayPixels = 0;
      let brightPixels = 0;
      let totalPixels = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        // Skin tone detection
        if (r > 100 && g > 60 && b > 40 && r > g && r > b && saturation > 0.1 && saturation < 0.6) skinPixels++;
        // Green / nature
        if (g > r + 15 && g > b + 15) greenPixels++;
        // Sky / blue tones
        if (b > r + 15 && b > g + 5) bluePixels++;
        // Gray / product
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) grayPixels++;
        // Bright / white bg
        if (brightness > 200) brightPixels++;
      }

      const results: { label: string; confidence: number }[] = [];

      const skinRatio = skinPixels / totalPixels;
      const greenRatio = greenPixels / totalPixels;
      const blueRatio = bluePixels / totalPixels;
      const grayRatio = grayPixels / totalPixels;

      if (skinRatio > 0.08) results.push({ label: 'Person / Portrait', confidence: Math.min(0.95, skinRatio * 5) });
      if (greenRatio > 0.15) results.push({ label: 'Nature / Plant', confidence: Math.min(0.95, greenRatio * 4) });
      if (blueRatio > 0.15) results.push({ label: 'Sky / Water', confidence: Math.min(0.95, blueRatio * 3.5) });
      if (grayRatio > 0.35 && skinRatio < 0.05) results.push({ label: 'Product / Object', confidence: Math.min(0.92, grayRatio * 2) });

      if (results.length === 0) results.push({ label: 'Mixed Scene', confidence: 0.78 });

      // Sort by confidence descending
      results.sort((a, b) => b.confidence - a.confidence);
      resolve(results.slice(0, 2));
    };
    img.onerror = () => resolve([{ label: 'Image Subject', confidence: 0.85 }]);
    img.src = imageUrl;
  });
}

/**
 * Download a URL as a PNG file
 */
export function downloadImage(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace(/\.[^/.]+$/, '') + '_bg_removed.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
