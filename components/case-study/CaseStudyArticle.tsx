import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { TbAlertTriangle, TbChartBar, TbChevronDown, TbListCheck, TbQuote } from "react-icons/tb";
import { caseStudyPage as copy } from "@/content/case-study";
import { PortableBody, Thumb } from "@/components/blog";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { toImg } from "@/lib/sanity/image";
import type { CaseStudyDetail } from "@/lib/sanity/types";
import { ActionPlan } from "./ActionPlan";
import { BeforeAfter } from "./BeforeAfter";
import styles from "./CaseStudy.module.css";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function caseStudyCrumbs(c: CaseStudyDetail): Crumb[] {
  return c.industryPage
    ? [copy.industriesCrumb, { label: c.industryPage.name, href: `/industries/${c.industryPage.slug}` }, { label: c.name }]
    : [copy.workCrumb, { label: c.name }];
}

/** Which sections have content, in page order. Drives the jump nav and the section ids. */
export function caseStudySections(c: CaseStudyDetail) {
  const s = c.summary;
  return {
    summary: Boolean(s?.problem || s?.plan || s?.result),
    problem: Boolean(c.beforeAfter?.length || c.problem?.length),
    plan: Boolean(c.steps?.length || c.solution?.length),
    results: Boolean(c.results?.length || c.outcomes?.length || c.resultsChart?.points?.length || c.testimonial?.quote || c.gallery?.length),
    takeaways: Boolean(c.takeaways?.length || c.underTheHood?.length || c.systemBuilt?.length || c.techStack?.length),
  };
}

function SectionHead({ id, eyebrow, heading, children }: { id: string; eyebrow: string; heading: string; children?: ReactNode }) {
  return (
    <header className={styles.sectionHead}>
      <div className={styles.titles}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className={styles.heading}>
          {heading}
        </h2>
      </div>
      {children}
    </header>
  );
}

export function CaseStudyArticle({ study: c }: { study: CaseStudyDetail }) {
  const has = caseStudySections(c);
  const cover = toImg(c.image, { width: 1200, aspect: 4 / 3 });

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero} aria-labelledby="case-heading">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <div className="settle" style={stagger(0)}>
              <Breadcrumbs items={caseStudyCrumbs(c)} label={copy.breadcrumbLabel} />
            </div>
            <div className={`settle ${styles.badges}`} style={stagger(1)}>
              <span className={styles.badge}>{copy.badge}</span>
              {c.sector ? <span className={styles.badgeQuiet}>{c.sector.trim()}</span> : null}
            </div>
            <p className={`settle ${styles.client}`} style={stagger(2)}>
              {c.name}
            </p>
            <h1 id="case-heading" className={`settle ${styles.title}`} style={stagger(3)}>
              {c.headline?.trim() || c.title}
            </h1>
            {!has.summary && c.excerpt?.trim() ? (
              <p className={`settle ${styles.lead}`} style={stagger(4)}>
                {c.excerpt.trim()}
              </p>
            ) : null}
            {c.facts?.length ? (
              <dl className={`settle ${styles.facts}`} style={stagger(4)}>
                {c.facts.slice(0, 3).map((f) => (
                  <div key={f._key} className={styles.fact}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {cover ? (
            <div className={`settle ${styles.cover}`} style={stagger(5)}>
              <Thumb image={cover} sizes="(min-width: 1080px) 520px, 100vw" priority />
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------- 30-second version ---------- */}
      {has.summary ? (
        <section id="summary" className={styles.section} aria-labelledby="summary-heading">
          <div className="container">
            <SectionHead id="summary-heading" eyebrow={copy.summary.eyebrow} heading={copy.summary.heading} />
            <ol className={styles.summary}>
              {(
                [
                  ["problem", copy.summary.problem, c.summary?.problem, TbAlertTriangle],
                  ["plan", copy.summary.plan, c.summary?.plan, TbListCheck],
                  ["result", copy.summary.result, c.summary?.result, TbChartBar],
                ] as const
              )
                .filter(([, , text]) => text)
                .map(([key, label, text, Icon], i) => (
                  <li key={key}>
                    <Reveal className={styles.summaryCard} index={i}>
                      <span className={styles.summaryIcon} data-kind={key} aria-hidden="true">
                        <Icon />
                      </span>
                      <span className={styles.summaryLabel}>{label}</span>
                      <p>{text}</p>
                    </Reveal>
                  </li>
                ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ---------- The problem ---------- */}
      {has.problem ? (
        <section id="problem" className={styles.section} aria-labelledby="problem-heading">
          <div className="container">
            {c.beforeAfter?.length ? (
              <>
                <SectionHead id="problem-heading" eyebrow={copy.problem.eyebrow} heading={c.problemHeading?.trim() || copy.problem.heading} />
                <BeforeAfter
                  rows={c.beforeAfter.map((r) => ({ key: r._key, label: r.label, before: r.before, after: r.after }))}
                  beforeImage={toImg(c.beforeImage, { width: 1040 })}
                  afterImage={toImg(c.afterImage, { width: 1040 })}
                />
              </>
            ) : (
              <>
                <SectionHead id="problem-heading" eyebrow={copy.problem.eyebrow} heading={c.problemHeading?.trim() || copy.problem.heading} />
                <div className={styles.story}>
                  <PortableBody value={c.problem ?? []} />
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      {/* ---------- The plan ---------- */}
      {has.plan ? (
        <section id="plan" className={styles.section} aria-labelledby="plan-heading">
          <div className="container">
            {c.steps?.length ? (
              <>
                <SectionHead id="plan-heading" eyebrow={copy.plan.eyebrow} heading={copy.plan.heading(c.steps.length)}>
                  {c.steps.length > 1 ? <p className={styles.headNote}>{copy.plan.intro}</p> : null}
                </SectionHead>
                <ActionPlan steps={c.steps} />
              </>
            ) : (
              <>
                <SectionHead id="plan-heading" eyebrow={copy.plan.eyebrow} heading={copy.plan.fallbackHeading} />
                <div className={styles.story}>
                  <PortableBody value={c.solution ?? []} />
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      {/* ---------- Results ---------- */}
      {has.results ? <Results study={c} /> : null}

      {/* ---------- Takeaways ---------- */}
      {has.takeaways ? <Takeaways study={c} /> : null}
    </>
  );
}

function Results({ study: c }: { study: CaseStudyDetail }) {
  const points = c.resultsChart?.points ?? [];
  const max = Math.max(1, ...points.map((p) => p.value));
  const quote = c.testimonial?.quote?.trim();
  const photo = toImg(c.testimonial?.authorPhoto, { width: 96, aspect: 1, alt: "" });
  const gallery = (c.gallery ?? []).map((g) => toImg(g, { width: 900 })).filter((g) => g !== null);

  return (
    <section id="results" className={styles.section} aria-labelledby="results-heading">
      <div className="container">
        <SectionHead id="results-heading" eyebrow={copy.results.eyebrow} heading={copy.results.heading} />

        {c.results?.length ? (
          <ul className={styles.tiles}>
            {c.results.map((r, i) => (
              <li key={r._key}>
                <Reveal className={`${styles.tile} ${r.highlight ? styles.tileHi : ""}`} index={i}>
                  <span className={styles.tileLabel}>{r.label}</span>
                  <span className={styles.tileValue}>{r.value}</span>
                  {r.note ? <span className={styles.tileNote}>{r.note}</span> : null}
                </Reveal>
              </li>
            ))}
          </ul>
        ) : null}

        {points.length || quote ? (
          <div className={`${styles.resultsRow} ${points.length && quote ? styles.resultsSplit : ""}`}>
            {points.length ? (
              <figure className={styles.chart}>
                <figcaption>
                  {c.resultsChart?.title ? <span className={styles.chartTitle}>{c.resultsChart.title}</span> : null}
                  {c.resultsChart?.note ? <span className={styles.chartNote}>{c.resultsChart.note}</span> : null}
                </figcaption>
                <ol className={styles.bars}>
                  {points.map((p, i) => (
                    <li key={p._key} style={{ "--h": `${(p.value / max) * 100}%`, "--i": i } as CSSProperties} data-after={Boolean(p.after)}>
                      <span className={styles.barValue}>{p.value}</span>
                      <span className={styles.bar} aria-hidden="true" />
                      <span className={styles.barLabel}>
                        {p.label}
                        <span className="visually-hidden">
                          {" "}
                          ({p.after ? copy.results.chartAfter : copy.results.chartBefore})
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className={styles.chartKey} aria-hidden="true">
                  <span data-after="false">{copy.results.chartBefore}</span>
                  <span data-after="true">{copy.results.chartAfter}</span>
                </p>
              </figure>
            ) : null}

            {quote ? (
              <figure className={styles.quote}>
                <TbQuote className={styles.quoteMark} aria-hidden="true" />
                <blockquote>{quote}</blockquote>
                <figcaption>
                  {photo ? (
                    <Image src={photo.src} alt="" width={48} height={48} className={styles.quotePhoto} />
                  ) : (
                    <span className={styles.quoteInitials} aria-hidden="true">
                      {(c.testimonial?.authorName ?? c.name).slice(0, 1)}
                    </span>
                  )}
                  <span>
                    {c.testimonial?.authorName ? <span className={styles.quoteName}>{c.testimonial.authorName}</span> : null}
                    <span className={styles.quoteBiz}>{c.testimonial?.authorBusiness ?? c.name}</span>
                  </span>
                </figcaption>
              </figure>
            ) : null}
          </div>
        ) : null}

        {c.outcomes?.length ? (
          <ul className={styles.outcomes}>
            {c.outcomes.map((o) => (
              <li key={o._key} className={styles.outcome}>
                <p className={styles.outcomeMetric}>
                  {o.metric}
                  {o.isEstimated ? <span className={styles.estimate}>{copy.results.estimated}</span> : null}
                </p>
                <dl className={styles.outcomeCompare}>
                  {o.before ? (
                    <div>
                      <dt>{copy.results.before}</dt>
                      <dd>{o.before}</dd>
                    </div>
                  ) : null}
                  {o.after ? (
                    <div>
                      <dt>{copy.results.after}</dt>
                      <dd>{o.after}</dd>
                    </div>
                  ) : null}
                </dl>
                {o.delta ? <p className={styles.outcomeDelta}>{o.delta}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {gallery.length ? (
          <div className={styles.gallery}>
            <h3 className={styles.galleryHeading}>{copy.results.galleryHeading}</h3>
            <ul>
              {gallery.map((g, i) => (
                <li key={`${g.src}-${i}`}>
                  <figure>
                    <Image src={g.src} alt={g.alt} width={g.width} height={g.height} sizes="(min-width: 900px) 50vw, 100vw" />
                    {c.gallery?.[i]?.caption ? <figcaption>{c.gallery[i].caption}</figcaption> : null}
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Takeaways({ study: c }: { study: CaseStudyDetail }) {
  const hood = Boolean(c.underTheHood?.length || c.systemBuilt?.length || c.techStack?.length);
  const stack = [...new Set((c.techStack ?? []).map((t) => t.trim()).filter(Boolean))];

  return (
    <section className={styles.section} aria-labelledby={c.takeaways?.length ? "takeaways-heading" : undefined} aria-label={c.takeaways?.length ? undefined : copy.takeaways.hood}>
      <div className="container">
        {c.takeaways?.length ? (
          <>
            <SectionHead id="takeaways-heading" eyebrow={copy.takeaways.eyebrow} heading={copy.takeaways.heading(c.takeaways.length)} />
            <ol className={styles.takeaways}>
              {c.takeaways.map((t, i) => (
                <li key={t._key}>
                  <Reveal className={styles.takeaway} index={i}>
                    <span className={styles.takeawayNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className={styles.takeawayTitle}>{t.title}</span>
                      {t.text ? <span className={styles.takeawayText}>{t.text}</span> : null}
                    </span>
                  </Reveal>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {hood ? (
          <details className={styles.hood}>
            <summary>
              {copy.takeaways.hood}
              <TbChevronDown aria-hidden="true" />
            </summary>
            <div className={styles.hoodBody}>
              {c.underTheHood?.length ? (
                <ul>
                  {c.underTheHood.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : c.systemBuilt?.length ? (
                <PortableBody value={c.systemBuilt} />
              ) : null}
              {stack.length ? (
                <p className={styles.stack}>
                  <span className={styles.stackLabel}>{copy.takeaways.stack}</span>
                  {stack.map((t) => (
                    <span key={t} className={styles.stackChip}>
                      {t}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}
