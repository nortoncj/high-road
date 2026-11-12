import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  TbArrowBackUp,
  TbArrowRight,
  TbBell,
  TbBrandGoogle,
  TbBrandGoogleAnalytics,
  TbBrandGoogleMaps,
  TbBrandNextjs,
  TbBrandWordpress,
  TbBriefcase,
  TbCalendarEvent,
  TbChartBar,
  TbCheck,
  TbChevronDown,
  TbCloud,
  TbCode,
  TbDatabase,
  TbDeviceMobile,
  TbFileAnalytics,
  TbFiles,
  TbGauge,
  TbHistory,
  TbListDetails,
  TbLock,
  TbMailCheck,
  TbMapPin,
  TbMessage,
  TbPhoneCall,
  TbPlugConnected,
  TbQuote,
  TbRoute,
  TbShieldCheck,
  TbStar,
} from "react-icons/tb";
import { serviceHref, servicePage as copy, services } from "@/content/services";
import type { Faq, Service, ToolIcon } from "@/content/services/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { serviceIcons } from "./icons";
import { Mockup } from "./Mockups";
import styles from "./ServiceSections.module.css";

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

/* ---------- Sound familiar? ---------- */

export function ServicePains({ service: s }: { service: Service }) {
  return (
    <section className={styles.section} aria-labelledby="pains-heading">
      <div className="container">
        <SectionHead id="pains-heading" eyebrow={copy.pains.eyebrow} heading={s.pains.heading} />
        <ul className={styles.pains}>
          {s.pains.items.map((line, i) => (
            <li key={line}>
              <Reveal className={styles.pain} index={i}>
                <TbQuote className={styles.quoteMark} aria-hidden="true" />
                <p className={styles.painText}>{line}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- What you get: a picture beside each feature, alternating sides ---------- */

export function ServiceFeatures({ service: s }: { service: Service }) {
  return (
    <section id="what-you-get" className={styles.section} aria-labelledby="features-heading">
      <div className="container">
        <SectionHead id="features-heading" eyebrow={copy.features.eyebrow} heading={s.features.heading} />
        <ol className={styles.features}>
          {s.features.items.map((f, i) => {
            const headingId = `feature-${i + 1}`;
            return (
              <li key={f.title} className={styles.feature} aria-labelledby={headingId}>
                <Reveal className={styles.visual}>
                  {"photo" in f.visual ? (
                    <span className={styles.photo}>
                      <Image
                        src={f.visual.photo.src}
                        alt={f.visual.photo.alt}
                        fill
                        placeholder="blur"
                        sizes="(min-width: 1080px) 560px, 100vw"
                        className={styles.img}
                      />
                    </span>
                  ) : (
                    <Mockup name={f.visual.mockup} />
                  )}
                </Reveal>

                <div className={styles.featureCopy}>
                  <span className={styles.featureNum} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 id={headingId} className={styles.featureTitle}>
                    {f.title}
                  </h3>
                  <p className={styles.featureBody}>{f.body}</p>
                  <ul className={styles.points}>
                    {f.points.map((point) => (
                      <li key={point}>
                        <span className={styles.tick} aria-hidden="true">
                          <TbCheck />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  {f.link ? (
                    <Link href={f.link.href} className={styles.more}>
                      {f.link.label}
                      <TbArrowRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        {s.features.note ? <p className={styles.note}>{s.features.note}</p> : null}
      </div>
    </section>
  );
}

/* ---------- What it's built with ---------- */

const toolIcons: Record<ToolIcon, IconType> = {
  wordpress: TbBrandWordpress,
  nextjs: TbBrandNextjs,
  speed: TbGauge,
  lock: TbLock,
  google: TbBrandGoogle,
  maps: TbBrandGoogleMaps,
  chart: TbChartBar,
  code: TbCode,
  pin: TbMapPin,
  pages: TbFiles,
  star: TbStar,
  phone: TbPhoneCall,
  database: TbDatabase,
  mail: TbMailCheck,
  message: TbMessage,
  calendar: TbCalendarEvent,
  reply: TbArrowBackUp,
  briefcase: TbBriefcase,
  mobile: TbDeviceMobile,
  bell: TbBell,
  list: TbListDetails,
  report: TbFileAnalytics,
  automation: TbRoute,
  plug: TbPlugConnected,
  analytics: TbBrandGoogleAnalytics,
  cloud: TbCloud,
  backup: TbHistory,
  shield: TbShieldCheck,
};

export function ServiceTools({ service: s }: { service: Service }) {
  return (
    <section id="built-with" className={`${styles.section} ${styles.sunken}`} aria-labelledby="tools-heading">
      <div className="container">
        <SectionHead id="tools-heading" eyebrow={copy.tools.eyebrow} heading={copy.tools.heading}>
          <p className={styles.lead}>{copy.tools.body}</p>
        </SectionHead>
        <ul className={styles.tools}>
          {s.tools.items.map((t, i) => {
            const Icon = toolIcons[t.icon];
            return (
              <li key={t.name}>
                <Reveal className={styles.tool} index={i % 3}>
                  <span className={styles.toolIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <h3 className={styles.toolName}>{t.name}</h3>
                    <p className={styles.toolWhat}>{t.what}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- What it costs ---------- */

export function ServicePricing({ service: s }: { service: Service }) {
  const p = s.pricing;
  return (
    <section id="pricing" className={styles.section} aria-labelledby="pricing-heading">
      <div className={`container ${styles.pricing}`}>
        <div className={styles.pricingCopy}>
          <Eyebrow>{copy.pricing.eyebrow}</Eyebrow>
          <h2 id="pricing-heading" className={styles.heading}>
            {p.heading}
          </h2>
          <p className={styles.lead}>{p.body}</p>
          <Link href={copy.pricing.link.href} className={styles.more}>
            {copy.pricing.link.label}
            <TbArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.priceCard}>
          <dl className={styles.prices}>
            {p.lines.map((line) => (
              <div key={line.label} className={styles.priceRow}>
                <dt>
                  <span className={styles.priceLabel}>{line.label}</span>
                  {line.note ? <span className={styles.priceNote}>{line.note}</span> : null}
                </dt>
                <dd className={styles.price}>{line.price}</dd>
              </div>
            ))}
          </dl>
          {p.note ? <p className={styles.priceFine}>{p.note}</p> : null}
        </div>
      </div>
    </section>
  );
}

/* ---------- Questions (here and on /services) ---------- */

type FaqsProps = {
  id?: string;
  eyebrow: string;
  heading: string;
  items: Faq[];
  /** Drop the top padding when the section above (from another module) already left the gap. */
  flush?: boolean;
};

export function ServiceFaqs({ id = "faqs", eyebrow, heading, items, flush = false }: FaqsProps) {
  return (
    <section id={id} className={`${styles.section} ${flush ? styles.flush : ""}`} aria-labelledby={`${id}-heading`}>
      <div className="container">
        <SectionHead id={`${id}-heading`} eyebrow={eyebrow} heading={heading} />
        <div className={styles.faqs}>
          {items.map((f) => (
            <details key={f.q} className={styles.faq}>
              <summary>
                <span>{f.q}</span>
                <TbChevronDown className={styles.chevron} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- The other five ---------- */

export function OtherServices({ current }: { current: Service }) {
  const others = services.filter((s) => s.slug !== current.slug);
  return (
    <nav className={styles.others} aria-labelledby="others-heading">
      <div className="container">
        <header className={styles.othersHead}>
          <div className={styles.othersTitles}>
            <Eyebrow>{copy.others.eyebrow}</Eyebrow>
            <h2 id="others-heading" className={styles.othersHeading}>
              {copy.others.heading}
            </h2>
          </div>
          <Link href={copy.crumbs.home.href} className={styles.more}>
            {copy.others.all}
            <TbArrowRight aria-hidden="true" />
          </Link>
        </header>
        <ul className={styles.otherGrid}>
          {others.map((o) => {
            const Icon = serviceIcons[o.icon];
            return (
              <li key={o.slug}>
                <Link href={serviceHref(o.slug)} className={styles.otherCard}>
                  <span className={styles.otherMedia}>
                    <Image src={o.image.src} alt="" fill placeholder="blur" sizes="(min-width: 1080px) 230px, (min-width: 720px) 33vw, 96px" className={styles.img} />
                  </span>
                  <span className={styles.otherBody}>
                    <span className={styles.otherLabel}>
                      <Icon aria-hidden="true" />
                      {o.label}
                    </span>
                    <span className={styles.otherTitle}>{o.title}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
