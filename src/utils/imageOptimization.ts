/**
 * Helper to check if a URL can be optimized by external services (Unsplash or Supabase)
 */
export function isOptimizable(url: string): boolean {
  if (!url) return false;
  // Only Unsplash supports free image transformation via query params.
  // Supabase /render/image/public/ requires the Image Transformation add-on
  // which is NOT enabled on this project — attempting it causes 400 errors.
  return url.includes("images.unsplash.com");
}

/**
 * Optimizes image URLs by appending resizing, quality, and format parameters.
 * Supports Unsplash and Supabase Storage (if transformation is enabled).
 */
export function getOptimizedImage(
  url: string, 
  width: number = 800, 
  quality: number = 80, 
  format?: 'webp' | 'avif',
  fit: 'cover' | 'contain' = 'cover',
  height?: number,
  version?: string | number
): string {
  if (!url) return "";

  // Enable resizing
  const widthParam = `&w=${width}`;
  const heightParam = height ? `&h=${height}` : "";
  const sbWidthParam = `&width=${width}`;
  const sbHeightParam = height ? `&height=${height}` : "";
  const versionParam = version ? `&v=${version}` : "";
 
  // Unsplash Optimization
  if (url.includes("images.unsplash.com")) {
    const baseUrl = url.split("?")[0];
    const fmt = format ? `&fm=${format}` : "&auto=format";
    
    if (fit === 'contain') {
      const fitParam = height ? "&fit=max" : "";
      return `${baseUrl}?q=${quality}${widthParam}${heightParam}${fmt}${fitParam}${versionParam}`;
    }
    
    return `${baseUrl}?q=${quality}${widthParam}${heightParam}${fmt}${versionParam}&fit=crop`;
  }
 
  // Supabase Storage — return as-is (Image Transformation API not enabled on this project)
  if (url.includes("supabase.co")) {
    return url;
  }

  // Add version to other URLs if provided (ONLY for non-local assets to avoid preload mismatch)
  if (versionParam && !url.startsWith("/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  }

  return url;
}

/**
 * Generates a tiny, low-quality version of the image for use as a blur placeholder (LQIP).
 */
export function getBlurPlaceholder(url: string, fit: 'cover' | 'contain' = 'cover', height?: number, version?: string | number): string {
  if (!url) return "";
  // tiny width (20px) and low quality (10) for maximum blur efficiency
  return getOptimizedImage(url, 20, 10, 'webp', fit, height, version);
}
