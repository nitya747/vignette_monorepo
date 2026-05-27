/**
 * Vignette.ai - YouTube Thumbnail Specifications
 * Defines standard constraints and canvas exporter utilities.
 */

export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;
export const ASPECT_RATIO = '16:9';
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB YouTube upload ceiling

/**
 * Validates canvas dimensions and reports sizing guidelines
 */
export function validateSpecs(width, height, fileSizeBytes = 0, aspectRatio = '16:9') {
  const warnings = [];
  const isShorts = aspectRatio === '9:16';
  
  const expectedWidth = isShorts ? 720 : 1280;
  const expectedHeight = isShorts ? 1280 : 720;
  const expectedRatio = expectedWidth / expectedHeight;
  const actualRatio = width / height;
  
  if (Math.abs(expectedRatio - actualRatio) > 0.05) {
    warnings.push(`Aspect ratio is not exactly ${aspectRatio} (Current: ${(width/height).toFixed(2)}). YouTube will crop or pad the sides.`);
  }
  
  if (isShorts) {
    if (width < 360) {
      warnings.push(`Image width (${width}px) is below YouTube's Shorts minimum recommendation of 360px. Thumbnail will look blurry.`);
    }
  } else {
    if (width < 640) {
      warnings.push(`Image width (${width}px) is below YouTube's minimum requirement of 640px. Thumbnail will look blurry.`);
    }
  }
  
  if (width !== expectedWidth || height !== expectedHeight) {
    warnings.push(`Dimensions are ${width}x${height}px. For optimal sharpness on all screens, we recommend exporting exactly at ${expectedWidth}x${expectedHeight}px.`);
  }
  
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    warnings.push(`File size is ${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB, exceeding YouTube's 2.0MB file limit. Use JPEG compression to shrink it.`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Downloads a canvas element as a file directly in the browser
 */
export function triggerCanvasDownload(canvas, filename = 'vignette-thumbnail.png', format = 'image/png', quality = 0.95) {
  if (!canvas) return false;
  
  try {
    const dataUrl = canvas.toDataURL(format, quality);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to trigger download:', error);
    return false;
  }
}
