import Link from "next/link";
import type { ReactNode } from "react";
import { TbArrowRight } from "react-icons/tb";
import styles from "./Button.module.css";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  size?: "md" | "sm";
  /** Leading react-icons element, e.g. <TbPhone /> */
  icon?: ReactNode;
  /** Adds the arrow that nudges right on hover. Use on the main action only. */
  arrow?: boolean;
  /** Stretch to the container width (mobile stacks). */
  block?: boolean;
  className?: string;
};

/** Link styled as a button. Primary uses the tide-fill hover. One primary per view. */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  arrow = false,
  block = false,
  className,
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === "sm" ? styles.sm : "",
    block ? styles.block : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={classes}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {arrow ? (
        <TbArrowRight className={styles.arrow} aria-hidden="true" />
      ) : null}
    </Link>
  );
}
