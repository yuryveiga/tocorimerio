import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { getOptimizedImage, getBlurPlaceholder, isOptimizable } from "@/utils/imageOptimization";
import { cn } from "@/lib/utils";
import { useSiteData } from "@/hooks/useSiteData";

const SRCSET_WIDTHS = [400, 800, 1200, 1600];

function buildSrcSet(
  src: string,
  quality: number,
  fit: "cover" | "contain",
  height: number | undefined,
  version: string | number | undefined,
  fmt?: "webp" | "avif"
) {
  return SRCSET_WIDTHS
    .map((w) => `${getOptimizedImage(src, w, quality, fmt, fit, height, version)} ${w}w`)
    .join(", ");
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "sync" | "auto";
  fill?: boolean;
  fit?: "cover" | "contain";
  height?: number;
  onDimensions?: (width: number, height: number) => void;
  version?: string | number;
  showBlur?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width = 800,
  quality = 70,
  className,
  containerClassName,
  loading = "lazy",
  fetchPriority = "auto",
  decoding = "async",
  fill = true,
  fit = "cover",
  height,
  onDimensions,
  version: propVersion,
  showBlur = true,
}: OptimizedImageProps) {
  const { version: siteVersion } = useSiteData();
  
  const version = propVersion || siteVersion;
  const optimizable = useMemo(() => isOptimizable(src), [src]);
  const shouldShowBlur = showBlur && fetchPriority !== "high";

  const finalSrc = useMemo(
    () => getOptimizedImage(src, width, quality, undefined, fit, height, version),
    [src, width, quality, fit, height, version]
  );
  const blurSrc = useMemo(
    () => (shouldShowBlur ? getBlurPlaceholder(src, fit, height, version) : ""),
    [src, fit, height, version, shouldShowBlur]
  );

  // Only reset loaded state when the actual <img src> URL changes.
  // Version bumps that don't change the URL (e.g. Supabase URLs returned as-is)
  // would otherwise hide the image forever, since onLoad won't re-fire.
  const [isLoaded, setIsLoaded] = useState(true);
  const prevSrcRef = useRef(finalSrc);
  if (prevSrcRef.current !== finalSrc) {
    prevSrcRef.current = finalSrc;
    // Will trigger a re-render with isLoaded=false; onLoad/onError will flip it back.
    setIsLoaded(false);
  }

  const imgRef = useRef<HTMLImageElement | null>(null);
  // Cover the case where the image is already in cache and onLoad never fires.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [finalSrc]);

  const srcSetAvif = useMemo(
    () => (optimizable ? buildSrcSet(src, quality, fit, height, version, "avif") : undefined),
    [src, quality, fit, height, version, optimizable]
  );
  const srcSetWebp = useMemo(
    () => (optimizable ? buildSrcSet(src, quality, fit, height, version, "webp") : undefined),
    [src, quality, fit, height, version, optimizable]
  );
 
  return (
    <div className={cn(
      "relative bg-muted/20",
      fill && "overflow-hidden w-full h-full",
      containerClassName
    )}>
      {/* Blurred Placeholder (LQIP) */}
      {shouldShowBlur && blurSrc && (
        <img
          src={blurSrc}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full blur-2xl transition-opacity duration-1000 ease-in-out",
            fit === "cover" ? "object-cover scale-110" : "object-contain scale-100",
            isLoaded ? "opacity-0 invisible" : "opacity-100 visible"
          )}
          aria-hidden="true"
        />
      )}
 
      {/* Main Image with modern format support */}
      <picture className={cn(!fill && "flex items-center justify-center w-full h-full")}>
        {optimizable && (
          <>
            <source 
              srcSet={srcSetAvif} 
              type="image/avif" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <source 
              srcSet={srcSetWebp} 
              type="image/webp" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </>
        )}
        <img
          ref={imgRef}
          src={finalSrc}
          alt={alt}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (onDimensions) {
              onDimensions(img.naturalWidth, img.naturalHeight);
            }
            setIsLoaded(true);
          }}
          onError={() => setIsLoaded(true)}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}

          className={cn(
            "transition-all duration-700 ease-in-out",
            fill ? "w-full h-full" : "max-w-full max-h-full",
            fit === "cover" ? "object-cover" : "object-contain",
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-2xl",
            className
          )}
        />
      </picture>
    </div>
  );
});

