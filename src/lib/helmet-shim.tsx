import { Children, isValidElement, useEffect, useRef, type ReactNode } from "react";

// Minimal drop-in replacement for `react-helmet-async`.
// Handles the subset of tags this project actually uses:
//   <title>, <meta>, <link>, <script type="application/ld+json">
// Tags are tagged with a data attribute so we can clean them up when
// the component re-renders or unmounts.

const MARKER = "data-rh-shim";

type AnyProps = Record<string, unknown> & { children?: ReactNode };

function flatten(node: ReactNode, out: any[]) {
  if (node == null || node === false || node === true) return;
  if (Array.isArray(node)) {
    node.forEach((n) => flatten(n, out));
    return;
  }
  if (isValidElement(node)) {
    // Fragments
    if ((node.type as any) === Symbol.for("react.fragment")) {
      flatten((node.props as AnyProps).children, out);
      return;
    }
    out.push(node);
  }
}

function textOf(children: ReactNode): string {
  if (children == null) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

function applyTag(el: any, id: string): HTMLElement | null {
  const type = typeof el.type === "string" ? el.type.toLowerCase() : "";
  const props: AnyProps = { ...(el.props || {}) };

  if (type === "title") {
    document.title = textOf(props.children);
    return null;
  }

  if (type !== "meta" && type !== "link" && type !== "script") return null;

  const node = document.createElement(type);
  for (const [k, v] of Object.entries(props)) {
    if (k === "children") continue;
    if (v == null || v === false) continue;
    if (k === "className") node.setAttribute("class", String(v));
    else if (k === "httpEquiv") node.setAttribute("http-equiv", String(v));
    else node.setAttribute(k, String(v));
  }
  if (type === "script") {
    node.textContent = textOf(props.children);
  }
  node.setAttribute(MARKER, id);
  document.head.appendChild(node);
  return node;
}

let counter = 0;

export const Helmet = ({ children }: { children?: ReactNode }) => {
  const idRef = useRef<string | null>(null);
  if (idRef.current == null) idRef.current = `h${++counter}`;
  const id = idRef.current;

  useEffect(() => {
    // Remove any previously rendered tags for this instance
    document.head.querySelectorAll(`[${MARKER}="${id}"]`).forEach((n) => n.remove());
    const flat: any[] = [];
    flatten(children, flat);
    flat.forEach((el) => applyTag(el, id));
    return () => {
      document.head.querySelectorAll(`[${MARKER}="${id}"]`).forEach((n) => n.remove());
    };
  });

  return null;
};

export const HelmetProvider = ({ children }: { children?: ReactNode }) => <>{children}</>;

export default Helmet;