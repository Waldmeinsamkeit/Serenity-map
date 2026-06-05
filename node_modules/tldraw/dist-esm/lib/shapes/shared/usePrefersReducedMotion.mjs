import { useMaybeEditor, useValue } from "@tldraw/editor";
import { useEffect, useState } from "react";
function usePrefersReducedMotion() {
  const editor = useMaybeEditor();
  const animationSpeed = useValue("animationSpeed", () => editor?.user.getAnimationSpeed(), [
    editor
  ]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (animationSpeed !== void 0) {
      setPrefersReducedMotion(animationSpeed === 0 ? true : false);
      return;
    }
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      setPrefersReducedMotion(mql.matches);
    };
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [animationSpeed]);
  return prefersReducedMotion;
}
export {
  usePrefersReducedMotion
};
//# sourceMappingURL=usePrefersReducedMotion.mjs.map
