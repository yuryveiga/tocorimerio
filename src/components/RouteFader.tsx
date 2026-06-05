import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/**
 * Wraps route content with a subtle fade + rise on every pathname change.
 * Remounts children on navigation — fine for top-level page transitions.
 */
export function RouteFader({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}