import React, { useEffect, useRef, useState } from "react";

interface ViewFadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'none';
}

export const ViewFadeIn = ({ 
  children, 
  delay = 0, 
  className = "",
  direction = 'up'
}: ViewFadeInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translateY(0)';
    if (direction === 'up') return 'translateY(20px)';
    if (direction === 'down') return 'translateY(-20px)';
    return 'none';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: isVisible ? 'blur(0)' : 'blur(6px)',
        transition: `opacity 0.7s cubic-bezier(0.2,0.8,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.2,0.8,0.2,1) ${delay}s, filter 0.7s ease-out ${delay}s`,
        willChange: 'opacity, transform, filter'
      }}
    >
      {children}
    </div>
  );
};
