"use client";

import { useCallback, useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  let frame = 0;
  const schedule = () => {
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        onChange();
      });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
};

/**
 * The id of the section being read: the last of `ids` whose top has passed 30% down the screen.
 * null above the first one, so nothing is highlighted while you're still in the hero.
 */
export function useActiveSection(ids: string[]) {
  const key = ids.join("|");
  const getSnapshot = useCallback(() => {
    const line = window.innerHeight * 0.3;
    let active: string | null = null;
    for (const id of key.split("|")) {
      const el = id ? document.getElementById(id) : null;
      if (el && el.getBoundingClientRect().top <= line) active = id;
    }
    return active;
  }, [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
