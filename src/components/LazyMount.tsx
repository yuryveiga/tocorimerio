import React, { useEffect, useRef, useState, ReactNode } from "react";

interface LazyMountProps {
  children: ReactNode;
  /** Min height while not yet mounted to avoid CLS. */
  minHeight?: number | string;
  /** Pixels of margin around the viewport to start mounting earlier. */
  rootMargin?: string;
  className?: string;
}

/**
 * Only renders `children` when the placeholder enters (or is near) the viewport.
 * Saves React reconciliation + event listeners on heavy below-the-fold sections.
 */
export function LazyMount({
  children,
  minHeight = 400,
  rootMargin = "300px",
  className,
}: LazyMountProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;
    const el = ref.current;
    if (!el) return;

    // Bail out gracefully on old browsers.
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={shouldRender ? undefined : { minHeight }}
    >
      {shouldRender ? children : null}
    </div>
  );
}