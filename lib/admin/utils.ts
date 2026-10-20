import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class helper. Lives under lib/admin so it can't collide with anything on the marketing side. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
