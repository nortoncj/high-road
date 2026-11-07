import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { blockText } from "@/lib/sanity/portable-text";
import { toImg } from "@/lib/sanity/image";
import type { BodyImageBlock, CalloutCardBlock, ChecklistBlock, CodeBlock, PostBodyBlock, TableBlock } from "@/lib/sanity/types";
import { Callout } from "./Callout";
import { Checklist } from "./Checklist";
import styles from "./PortableBody.module.css";

type PortableBodyProps = {
  value: PostBodyBlock[] | PortableTextBlock[];
  /** Anchor ids by block _key, from buildToc(). */
  headingIds?: Map<string, string>;
  /** Saves checklist ticks per post. */
  storageKey?: string;
};

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

/** Renders Sanity rich text with the site's type styles. Used for post bodies and case study stories. */
export function PortableBody({ value, headingIds, storageKey = "wtn" }: PortableBodyProps) {
  const anchor = (key?: string) => (key ? headingIds?.get(key) : undefined);

  const components: PortableTextComponents = {
    block: {
      normal: ({ children, value: block }) => (blockText(block).trim() ? <p>{children}</p> : null),
      // The page title is the only h1, so an H1 typed in the Studio renders as h2.
      h1: ({ children, value: block }) => <h2 id={anchor(block._key)}>{children}</h2>,
      h2: ({ children, value: block }) => <h2 id={anchor(block._key)}>{children}</h2>,
      h3: ({ children }) => <h3>{children}</h3>,
      h4: ({ children }) => <h4>{children}</h4>,
      blockquote: ({ children }) => (
        <figure className={styles.quote}>
          <span className={styles.slash} aria-hidden="true" />
          <blockquote>{children}</blockquote>
        </figure>
      ),
    },
    list: {
      bullet: ({ children }) => <ul>{children}</ul>,
      number: ({ children }) => <ol>{children}</ol>,
    },
    marks: {
      code: ({ children }) => <code className={styles.inlineCode}>{children}</code>,
      link: ({ children, value: mark }) => {
        const href = String(mark?.href ?? "");
        if (!href) return <>{children}</>;
        if (isInternal(href)) return <Link href={href}>{children}</Link>;
        const blank = mark?.blank !== false;
        return (
          <a href={href} {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {children}
            {blank ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
          </a>
        );
      },
    },
    types: {
      image: ({ value: block }: { value: BodyImageBlock }) => {
        const img = toImg(block, { width: 1400 });
        if (!img) return null;
        return (
          <figure className={styles.figure}>
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 1080px) 720px, 100vw"
              placeholder={img.blurDataURL ? "blur" : "empty"}
              blurDataURL={img.blurDataURL}
            />
            {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          </figure>
        );
      },
      code: ({ value: block }: { value: CodeBlock }) => (
        <figure className={styles.code}>
          {block.filename ? <figcaption>{block.filename}</figcaption> : null}
          <pre>
            <code data-language={block.language}>{block.code}</code>
          </pre>
        </figure>
      ),
      contentTable: ({ value: block }: { value: TableBlock }) => <Table block={block} />,
      calloutCard: ({ value: block }: { value: CalloutCardBlock }) => <Callout block={block} />,
      checklist: ({ value: block }: { value: ChecklistBlock }) =>
        block.items?.length ? (
          <Checklist
            id={anchor(block._key)}
            storageKey={`${storageKey}:${block._key}`}
            eyebrow={block.eyebrow ?? undefined}
            heading={block.heading ?? undefined}
            items={block.items}
            doneMessage={block.doneMessage ?? undefined}
          />
        ) : null,
    },
  };

  return (
    <div className={styles.prose}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  );
}

function Table({ block }: { block: TableBlock }) {
  const rows = block.table?.rows ?? [];
  if (!rows.length) return null;
  const [head, ...rest] = block.hasHeaderRow === false ? [null, ...rows] : rows;
  return (
    <figure className={styles.table}>
      <div className={styles.tableScroll}>
        <table>
          {head ? (
            <thead>
              <tr>
                {(head.cells ?? []).map((c, i) => (
                  <th key={i} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {rest.map((r) => (
              <tr key={r?._key}>
                {(r?.cells ?? []).map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption || block.note ? (
        <figcaption>{[block.caption, block.note].filter(Boolean).join(". ")}</figcaption>
      ) : null}
    </figure>
  );
}
