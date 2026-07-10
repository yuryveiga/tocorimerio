/**
 * Helper to check if a URL can be optimized by external services (Unsplash or Supabase)
 */
export function isOptimizable(url: string): boolean {
  if (!url) return false;
  // Unsplash + Supabase Storage both support server-side image transformation.
  // Supabase requires the Image Transformation add-on (confirmed enabled on this project).
  return url.includes("images.unsplash.com") || /supabase\.(co|in)\/storage\/v1\/object\/public\//.test(url);
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
 
  // Supabase Storage — rewrite to /render/image/public/ with resize+quality+format.
  const sbMatch = url.match(/^(https?:\/\/[^/]+)\/storage\/v1\/object\/public\/(.+)$/);
  if (sbMatch) {
    const [, origin, rest] = sbMatch;
    const [pathPart, existingQuery = ""] = rest.split("?");
    const params = new URLSearchParams();
    params.set("width", String(width));
    if (height) params.set("height", String(height));
    params.set("quality", String(Math.round(quality)));
    params.set("resize", fit === "cover" ? "cover" : "contain");
    // format=origin lets Supabase serve WebP/AVIF via content negotiation when supported.
    if (format) params.set("format", format);
    if (version) params.set("v", String(version));
    // Preserve any pre-existing query bits (rare) so we don't strip auth tokens etc.
    const preserved = new URLSearchParams(existingQuery);
    preserved.forEach((v, k) => { if (!params.has(k)) params.set(k, v); });
    return `${origin}/storage/v1/render/image/public/${pathPart}?${params.toString()}`;
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
  // Only generate a real LQIP for URLs we can actually resize.
  // For Supabase / local assets, returning the full URL would waste bandwidth
  // by loading the same image twice — skip the blur layer instead.
  if (!isOptimizable(url)) return "";
  // tiny width (20px) and low quality (10) for maximum blur efficiency
  return getOptimizedImage(url, 20, 10, 'webp', fit, height, version);
}
