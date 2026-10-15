"use client";

import { usePathname } from "next/navigation";
import { TbPhone } from "react-icons/tb";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./MobileCtaBar.module.css";

// Pages where the bar would just repeat what's already on screen.
const HIDDEN_ON = ["/book"];

/** Sticky Call and Book bar for phones and small tablets. Hidden at 960px and up, and on /book. */
export function MobileCtaBar() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className={styles.bar}>
      <a href={site.phoneHref} className={styles.call}>
        <TbPhone aria-hidden="true" />
        Call
      </a>
      <div className={styles.book}>
        <Button href={site.bookHref} block>
          Book a free call
        </Button>
      </div>
    </div>
  );
}
