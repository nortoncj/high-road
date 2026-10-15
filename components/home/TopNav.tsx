"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { TbMenu2, TbPhone, TbX } from "react-icons/tb";
import { navLinks, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./TopNav.module.css";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the mobile menu on route change and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="Main">
        <Link href="/" className={styles.brand}>
          {/* <span className={styles.mark} aria-hidden="true">
            {site.monogram}
          </span> */}
          <span className={styles.wordmark}>{site.name}</span>
        </Link>

        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a href={site.phoneHref} className={styles.phone}>
            <TbPhone aria-hidden="true" />
            <span className={styles.phoneText}>{site.phone}</span>
          </a>
          <span className={styles.cta}>
            <Button href={site.bookHref} size="sm" arrow>
              Book a free call
            </Button>
          </span>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <TbX aria-hidden="true" /> : <TbMenu2 aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div id={menuId} className={styles.panel} data-open={open} hidden={!open}>
        <ul className={`container ${styles.panelLinks}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.panelLink}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className={styles.panelCta}>
            <Button href={site.bookHref} block arrow>
              Book a free call
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
