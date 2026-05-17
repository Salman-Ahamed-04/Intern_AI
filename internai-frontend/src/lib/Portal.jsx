import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children directly into document.body via a portal.
 * This escapes any stacking context (animations, transforms, overflow)
 * that would trap position:fixed modals inside a parent element.
 */
export default function Portal({ children }) {
  const el = useRef(document.createElement("div"));

  useEffect(() => {
    const node = el.current;
    document.body.appendChild(node);
    return () => document.body.removeChild(node);
  }, []);

  return createPortal(children, el.current);
}
