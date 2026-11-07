"use client";

import { useEffect, useRef } from "react";
import styles from "./ReadingProgress.module.css";

/** Thin bar under the nav that fills as you read the article with id `targetId`. Decorative. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const bar = barRef.current;
    if (!target || !bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = target.getBoundingClientRect();
      const span = height - window.innerHeight * 0.6;
      const p = span > 0 ? Math.min(1, Math.max(0, -top / span)) : 1;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div className={styles.track} aria-hidden="true">
      <span ref={barRef} className={styles.bar} />
    </div>
  );
}
