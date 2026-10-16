import type { ReactNode } from "react";
import { TbAlertTriangle, TbChevronDown, TbInfoCircle } from "react-icons/tb";
import type { LegalBlock, LegalSection } from "@/content/legal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichText } from "./RichText";
import styles from "./LegalPage.module.css";

type Props = {
  eyebrow: string;
  headline: string;
  effectiveDate: string;
  intro: string[];
  summary?: { title: string; items: string[] };
  tocLabel: string;
  sections: LegalSection[];
  /** Rendered wherever a section has a { type: "contact" } block. */
  contact?: ReactNode;
  /** Dev-only banners. */
  draftNotice?: string;
  draftReminder?: string;
};

// Review notes, draft banners and placeholder highlights only show while you're building.
const IS_DEV = process.env.NODE_ENV !== "production";

/** Long-form legal page: header, short version, table of contents, numbered sections. */
export function LegalPage({
  eyebrow,
  headline,
  effectiveDate,
  intro,
  summary,
  tocLabel,
  sections,
  contact,
  draftNotice,
  draftReminder,
}: Props) {
  const toc = (
    <ol className={styles.tocList}>
      {sections.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`}>{s.title}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <article className={styles.page} aria-labelledby="legal-heading">
      <div className={`container ${styles.layout}`}>
        <header className={styles.header}>
          {IS_DEV && draftNotice ? (
            <p className={styles.draft} role="note">
              <TbAlertTriangle aria-hidden="true" />
              <span>
                <RichText text={draftNotice} />
              </span>
            </p>
          ) : null}
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="legal-heading" className={styles.headline}>
            {headline}
          </h1>
          <p className={styles.effective}>
            Effective <RichText text={effectiveDate} markPlaceholders={IS_DEV} />
          </p>
          {intro.map((p) => (
            <p key={p} className={styles.intro}>
              <RichText text={p} markPlaceholders={IS_DEV} />
            </p>
          ))}
        </header>

        {/* Phones and tablets: collapsible contents. Desktop: sticky sidebar. */}
        <details className={styles.tocMobile}>
          <summary>
            {tocLabel}
            <TbChevronDown className={styles.chevron} aria-hidden="true" />
          </summary>
          <nav aria-label={tocLabel}>{toc}</nav>
        </details>

        <aside className={styles.tocDesktop}>
          <nav aria-label={tocLabel}>
            <p className={styles.tocTitle}>{tocLabel}</p>
            {toc}
          </nav>
        </aside>

        <div className={styles.body}>
          {summary ? (
            <section className={styles.summary} aria-labelledby="legal-summary">
              <h2 id="legal-summary" className={styles.summaryTitle}>
                {summary.title}
              </h2>
              <ul className={styles.summaryList}>
                {summary.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} markPlaceholders={IS_DEV} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-heading`}>
              <h2 id={`${s.id}-heading`} className={styles.sectionTitle}>
                <span className={styles.sectionNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h2>

              {IS_DEV && s.review?.length ? (
                <div className={styles.review} role="note">
                  <TbAlertTriangle aria-hidden="true" />
                  <ul>
                    {s.review.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {s.blocks.map((b, j) => (
                <Block key={j} block={b} contact={contact} />
              ))}
            </section>
          ))}

          {IS_DEV && draftReminder ? (
            <p className={styles.draft} role="note">
              <TbAlertTriangle aria-hidden="true" />
              <span>{draftReminder}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Block({ block, contact }: { block: LegalBlock; contact?: ReactNode }) {
  switch (block.type) {
    case "p":
      return (
        <p className={styles.p}>
          <RichText text={block.text} markPlaceholders={IS_DEV} />
        </p>
      );

    case "callout":
      return (
        <p className={styles.callout}>
          <TbInfoCircle className={styles.calloutIcon} aria-hidden="true" />
          <span>
            <RichText text={block.text} markPlaceholders={IS_DEV} />
          </span>
        </p>
      );

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <div className={styles.listBlock}>
          {block.lead ? (
            <p className={styles.p}>
              <RichText text={block.lead} markPlaceholders={IS_DEV} />
            </p>
          ) : null}
          <List className={block.ordered ? styles.ordered : styles.bullets}>
            {block.items.map((item) => (
              <li key={item}>
                <RichText text={item} markPlaceholders={IS_DEV} />
              </li>
            ))}
          </List>
        </div>
      );
    }

    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>{block.caption}</caption>
            <thead>
              <tr>
                {block.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, k) => {
                    const content = <RichText text={cell} markPlaceholders={IS_DEV} />;
                    // First cell names the row; on phones each row becomes a small card.
                    return k === 0 ? (
                      <th key={k} scope="row" data-label={block.columns[k]}>
                        {content}
                      </th>
                    ) : (
                      <td key={k} data-label={block.columns[k]}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "contact":
      return contact ? <>{contact}</> : null;
  }
}
