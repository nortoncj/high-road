import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalPage.module.css";

// **bold** | [text](url) | `code` | [placeholder]
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\[([^\]]+)\]/g;

type Props = {
  text: string;
  /** Highlight unfilled [placeholders]. On in dev, off in production. */
  markPlaceholders?: boolean;
};

/** Tiny inline formatter so legal copy can live as plain strings in content files. */
export function RichText({ text, markPlaceholders = false }: Props) {
  return <>{parse(text, markPlaceholders, "t")}</>;
}

function parse(text: string, mark: boolean, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const m of text.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyBase}-${i++}`;
    const [whole, bold, linkText, href, code, placeholder] = m;

    if (bold !== undefined) {
      out.push(<strong key={key}>{parse(bold, mark, key)}</strong>);
    } else if (linkText !== undefined && href !== undefined) {
      out.push(
        href.startsWith("/") ? (
          <Link key={key} href={href} className={styles.inlineLink}>
            {linkText}
          </Link>
        ) : (
          <a key={key} href={href} className={styles.inlineLink} rel="noopener noreferrer">
            {linkText}
          </a>
        ),
      );
    } else if (code !== undefined) {
      out.push(
        <code key={key} className={styles.code}>
          {code}
        </code>,
      );
    } else if (placeholder !== undefined) {
      out.push(
        mark ? (
          <mark key={key} className={styles.placeholder}>
            {whole}
          </mark>
        ) : (
          whole
        ),
      );
    }
    last = start + whole.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}
