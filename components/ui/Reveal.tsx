"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Position in a row; exposed as --i so CSS can stagger siblings that enter together. */
  index?: number;
};

/**
 * Sets data-reveal="pending" on mount if the block is still below the fold, then "done" once it
 * scrolls into view. Style the entrance off those attributes. Without JS, or if the block is
 * already on screen at mount, nothing is ever hidden.
 */
export function Reveal({ children, className, index = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "done";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--i": index } as CSSProperties}>
      {children}
    </div>
  );
}
