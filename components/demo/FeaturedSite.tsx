import type { IconType } from "react-icons";
import { TbBell, TbChartBar, TbClipboardCheck, TbDeviceMobile, TbEye, TbPencil } from "react-icons/tb";
import { applySection, featuredSite } from "@/content/demo";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ApplyDemo } from "./ApplyDemo";
import { BrowserFrame } from "./BrowserFrame";
import styles from "./FeaturedSite.module.css";

type FeatureIcon = (typeof featuredSite.features)[number]["icon"];

const icons: Record<FeatureIcon, IconType> = {
  apply: TbClipboardCheck,
  bell: TbBell,
  phone: TbDeviceMobile,
  eye: TbEye,
  edit: TbPencil,
  chart: TbChartBar,
};

/** Project 01 is the site itself, followed by the live application demo. */
export function FeaturedSite() {
  return (
    <>
      <section id="this-site" className={styles.section} aria-labelledby="this-site-heading">
        <div className={`container ${styles.grid}`}>
          <div className={styles.media}>
            <BrowserFrame url="webtechninjas.com">
              <HomepageMock />
            </BrowserFrame>
          </div>

          <div className={styles.copy}>
            <Eyebrow>{featuredSite.eyebrow}</Eyebrow>
            <h2 id="this-site-heading" className={styles.heading}>
              {featuredSite.heading}
            </h2>
            <ul className={styles.badges}>
              {featuredSite.badges.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className={styles.intro}>{featuredSite.intro}</p>
            <ul className={styles.features}>
              {featuredSite.features.map((f) => {
                const Icon = icons[f.icon];
                return (
                  <li key={f.title}>
                    <span className={styles.iconTile} aria-hidden="true">
                      <Icon />
                    </span>
                    <span>
                      <strong>{f.title}</strong> {f.body}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={styles.builtWith}>{featuredSite.builtWith}</p>
          </div>
        </div>
      </section>

      <section id="apply" className={styles.applySection} aria-labelledby="apply-heading">
        <div className={`container ${styles.applyGrid}`}>
          <div className={styles.applyCopy}>
            <Eyebrow>{applySection.eyebrow}</Eyebrow>
            <h2 id="apply-heading" className={styles.heading}>
              {applySection.heading}
            </h2>
            <p className={styles.intro}>{applySection.body}</p>
          </div>
          <div className={styles.widget}>
            <p className={styles.widgetLabel}>{applySection.demoLabel}</p>
            {/* No onSubmit: the demo never sends or stores anything. */}
            <ApplyDemo />
          </div>
          <div className={styles.afterNote}>
            <p>{applySection.doneNote}</p>
            <Button href={site.bookHref} arrow>
              Book a free call
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/** A small drawing of the homepage hero, so this card needs no screenshot. */
function HomepageMock() {
  return (
    <div className={styles.mock} aria-hidden="true">
      <div className={styles.mockNav}>
        <span className={styles.mockMark}>WN</span>
        <span className={styles.mockBrand}>WebTech Ninjas</span>
        <span className={styles.mockCta}>Book a free call</span>
      </div>
      <div className={styles.mockHero}>
        <div className={styles.mockCopy}>
          <span className={styles.mockRule} />
          <span className={styles.mockTitle}>Short on caregivers? Let your website do the hiring.</span>
          <span className={styles.mockLine} />
          <span className={styles.mockLine} style={{ width: "70%" }} />
          <span className={styles.mockButton} />
        </div>
        <div className={styles.mockVisual}>
          <div className={styles.mockPhone}>
            <span className={styles.mockPhoneTitle}>Apply to be a caregiver</span>
            <span className={styles.mockField} />
            <span className={`${styles.mockField} ${styles.mockFieldOn}`} />
            <span className={styles.mockField} />
            <span className={styles.mockPhoneButton} />
          </div>
        </div>
      </div>
    </div>
  );
}
