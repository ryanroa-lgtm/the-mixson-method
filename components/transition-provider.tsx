"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface TransitionContextValue {
  navigateTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const navigateTo = useCallback(
    (href: string) => {
      if (transitioning) return;
      setTransitioning(true);

      const el = wrapperRef.current;
      if (el) {
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        el.style.opacity = "0";
        el.style.transform = "translateY(10px)";
      }

      setTimeout(() => {
        router.push(href);
        // After navigation, the new page mounts and we fade it in
        // We reset immediately — the new content will use CSS animations
        setTimeout(() => {
          if (el) {
            el.style.transition = "none";
            el.style.opacity = "0";
            el.style.transform = "translateY(20px)";
            // Force reflow
            void el.offsetHeight;
            el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
          setTransitioning(false);
        }, 50);
      }, 400);
    },
    [router, transitioning]
  );

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      <div ref={wrapperRef}>{children}</div>
    </TransitionContext.Provider>
  );
}
