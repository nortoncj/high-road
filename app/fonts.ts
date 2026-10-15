// All font choices live here. To change fonts later, swap these three imports
// and keep the `variable` names. Nothing else in the codebase names a font.
//
// Brand spec calls for Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono.
// If your Next.js version's next/font/google list includes them, swap them in here.
import {
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  Newsreader,
} from "next/font/google";

export const displayFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display-face",
});

export const textFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-text-face",
});

export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono-face",
});

export const fontVariables = [
  displayFont.variable,
  textFont.variable,
  monoFont.variable,
].join(" ");
