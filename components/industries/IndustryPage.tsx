import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { TbArrowRight, TbCheck, TbChevronDown, TbExternalLink, TbQuote } from "react-icons/tb";
import { industryPage as copy } from "@/content/industries";
import { CaseStudyRow, Thumb } from "@/components/blog";
import { caseStudyHref, toCaseStudyCardView } from "@/components/blog/views";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { toImg } from "@/lib/sanity/image";
import type { IndustryCaseStudy, IndustryDetail } from "@/lib/sanity/types";
import { industryHref } from "./views";
import styles from "./IndustryPage.module.css";

export function industryCrumbs(it: IndustryDetail): Crumb[] {
  return [copy.crumbs.home, { label: it.name }];
}

/** Which sections have content. Empty ones are skipped so a half-written industry still reads well. */
export function industrySections(it: IndustryDetail) {
  return {
    stats: Boolean(it.stats?.length),
    problems: Boolean(it.problems?.length),
    solutions: Boolean(it.solutions?.length),
    proof: Boolean(it.caseStudies?.length),
    faqs: Boolean(it.faqs?.length),
  };
}

function SectionHead({ id, eyebrow, heading, children }: { id: string; eyebrow: string; heading: string; children?: ReactNode }) {
  return (
    <header className={styles.sectionHead}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className={styles.heading}>
        {heading}
      </h2>
      {children}
    </header>
  );
}

/* ---------- Hero ---------- */

export function IndustryHero({ industry: it }: { industry: IndustryDetail }) {
  const image = toImg(it.image, { width: 720, aspect: 4 / 5, alt: "" });
  const has = industrySections(it);
  return (
    <PageHero
      id="industry-heading"
      crumbs={<Breadcrumbs items={industryCrumbs(it)} />}
      eyebrow={it.eyebrow || copy.eyebrow(it.name)}
      headline={it.headline || it.name}
      body={it.intro || it.line || ""}
      art={
        <div className={styles.heroArt} aria-hidden="true">
          <span className={styles.heroFacet} />
          <span className={styles.heroPhoto}>
            <Thumb image={image} sizes="(min-width: 1080px) 420px, 0px" priority />
          </span>
          {it.clientWork || has.proof ? (
            <span className={styles.heroBadge}>
              <TbCheck />
              {copy.clientWork}
            </span>
          ) : null}
        </div>
      }
    >
      <div className={styles.heroActions}>
        <Button href={copy.primaryCta.href} arrow>
          {copy.primaryCta.label}
        </Button>
        {has.proof ? (
          <Button href="#proof" variant="secondary">
            {copy.proofLink}
          </Button>
        ) : null}
      </div>
    </PageHero>
  );
}

/* ---------- Numbers ---------- */

export function IndustryStats({ stats }: { stats: NonNullable<IndustryDetail["stats"]> }) {
  return (
    <section className={styles.stats} aria-labelledby="stats-heading">
      <div className="container">
        <SectionHead id="stats-heading" eyebrow={copy.stats.eyebrow} heading={copy.stats.heading} />
        <ul className={styles.statGrid} data-count={stats.length}>
          {stats.map((s, i) => (
            <li key={s._key}>
              <Reveal className={styles.stat} index={i}>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
                {s.source ? (
                  <p className={styles.statSource}>
                    <span className="visually-hidden">{copy.stats.source}: </span>
                    {s.sourceUrl ? (
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {s.source}
                        <TbExternalLink aria-hidden="true" />
                      </a>
                    ) : (
                      s.source
                    )}
                  </p>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Problems and solutions ---------- */

export function IndustryProblems({ industry: it }: { industry: IndustryDetail }) {
  return (
    <section id="problems" className={styles.section} aria-labelledby="problems-heading">
      <div className="container">
        <SectionHead id="problems-heading" eyebrow={copy.problems.eyebrow} heading={it.problemsHeading || copy.problems.heading} />
        <ol className={styles.problems}>
          {it.problems?.map((p, i) => (
            <li key={p._key}>
              <Reveal className={styles.problem} index={i}>
                <span className={styles.problemSlash} aria-hidden="true" />
                <h3 className={styles.problemTitle}>{p.title}</h3>
                {p.body ? <p className={styles.problemBody}>{p.body}</p> : null}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function IndustrySolutions({ industry: it }: { industry: IndustryDetail }) {
  return (
    <section id="solutions" className={`${styles.section} ${styles.sunken}`} aria-labelledby="solutions-heading">
      <div className="container">
        <SectionHead id="solutions-heading" eyebrow={copy.solutions.eyebrow} heading={it.solutionsHeading || copy.solutions.heading(it.name)} />
        <ol className={styles.solutions}>
          {it.solutions?.map((s, i) => (
            <li key={s._key}>
              <Reveal className={styles.solution} index={i % 2}>
                <span className={styles.solutionNum} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.solutionCopy}>
                  <h3 className={styles.solutionTitle}>{s.title}</h3>
                  {s.body ? <p className={styles.solutionBody}>{s.body}</p> : null}
                  {s.points?.length ? (
                    <ul className={styles.points}>
                      {s.points.map((pt) => (
                        <li key={pt}>
                          <TbCheck aria-hidden="true" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Proof ---------- */

function ProofCard({ study, index }: { study: IndustryCaseStudy; index: number }) {
  const meta = [study.sector, study.location].filter((m): m is string => Boolean(m?.trim()));
  const image = toImg(study.image, { width: 900, aspect: 16 / 10, alt: "" });
  const quote = study.testimonial?.quote?.trim();
  const { label, value } = study.highlight ?? {};
  return (
    <Reveal className={styles.proof} index={index}>
      <span className={styles.proofMedia}>
        <Thumb image={image} sizes="(min-width: 900px) 520px, 100vw" />
      </span>
      <div className={styles.proofBody}>
        {meta.length ? <p className={styles.proofMeta}>{meta.join(" · ")}</p> : null}
        <h3 className={styles.proofName}>
          {/* Stretched over the whole card, so it's the one link a keyboard or screen reader meets */}
          <Link href={caseStudyHref(study.slug)} className={styles.proofLink}>
            {study.name}
          </Link>
        </h3>
        {study.excerpt?.trim() ? <p className={styles.proofText}>{study.excerpt.trim()}</p> : null}
        {value ? (
          <p className={styles.highlight}>
            {label ? <span className={styles.highlightLabel}>{label}</span> : null}
            <span className={styles.highlightValue}>{value}</span>
          </p>
        ) : null}
        {quote ? (
          <figure className={styles.proofQuote}>
            <TbQuote className={styles.quoteMark} aria-hidden="true" />
            <blockquote>{quote}</blockquote>
            <figcaption>{[study.testimonial?.authorName, study.testimonial?.authorBusiness ?? study.name].filter(Boolean).join(", ")}</figcaption>
          </figure>
        ) : null}
        <span className={styles.go} aria-hidden="true">
          {copy.proof.read}
          <TbArrowRight />
        </span>
      </div>
    </Reveal>
  );
}

/** The industry's own case studies, or recent work from other industries when it has none yet. */
export function IndustryProof({ industry: it }: { industry: IndustryDetail }) {
  if (!it.caseStudies?.length) {
    if (!it.otherCaseStudies.length) return null;
    return (
      <div className={styles.fallbackProof}>
        <CaseStudyRow
          id="proof-heading"
          eyebrow={copy.proof.otherEyebrow}
          heading={copy.proof.otherHeading}
          cards={it.otherCaseStudies.map(toCaseStudyCardView)}
          linkLabel={copy.proof.read}
        />
      </div>
    );
  }
  return (
    <section id="proof" className={styles.section} aria-labelledby="proof-heading">
      <div className="container">
        <SectionHead id="proof-heading" eyebrow={copy.proof.eyebrow} heading={copy.proof.heading}>
          <Link href="/work" className={styles.all}>
            {copy.proof.all}
            <TbArrowRight aria-hidden="true" />
          </Link>
        </SectionHead>
        <div className={styles.proofs}>
          {it.caseStudies.map((c, i) => (
            <ProofCard key={c._id} study={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Questions ---------- */

export function IndustryFaqs({ faqs }: { faqs: NonNullable<IndustryDetail["faqs"]> }) {
  return (
    <section id="faqs" className={styles.section} aria-labelledby="faqs-heading">
      <div className="container">
        <SectionHead id="faqs-heading" eyebrow={copy.faqs.eyebrow} heading={copy.faqs.heading} />
        <div className={styles.faqs}>
          {faqs.map((f) => (
            <details key={f._key} className={styles.faq}>
              <summary>
                <span>{f.question}</span>
                <TbChevronDown className={styles.chevron} aria-hidden="true" />
              </summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Other industries ---------- */

/** Same group first, so a roofer sees HVAC and plumbing before restaurants. */
export function OtherIndustries({ industry: it }: { industry: IndustryDetail }) {
  if (!it.others.length) return null;
  const sorted = [...it.others].sort((a, b) => Number(b.group === it.group) - Number(a.group === it.group));
  return (
    <nav className={styles.others} aria-labelledby="others-heading">
      <div className="container">
        <h2 id="others-heading" className={styles.othersHeading}>
          {copy.others.label}
        </h2>
        <ul className={styles.chips}>
          {sorted.map((o, i) => (
            <li key={o.slug} className="settle" style={{ "--i": i % 8 } as CSSProperties}>
              <Link href={industryHref(o.slug)} className={styles.chip}>
                {o.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={copy.crumbs.home.href} className={`${styles.chip} ${styles.chipAll}`}>
              {copy.others.all}
              <TbArrowRight aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
