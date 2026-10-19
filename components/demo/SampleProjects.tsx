import Image from "next/image";
import Link from "next/link";
import { TbCheck, TbHammer } from "react-icons/tb";
import { samples } from "@/content/work";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { BrowserFrame } from "./BrowserFrame";
import { DemoHeading } from "./DemoHeading";
import styles from "./SampleProjects.module.css";

/** Shows sample agency sites, or an "in progress" card until the first one is live. */
export function SampleProjects() {
  return (
    <section
      id="samples"
      className={styles.section}
      aria-labelledby="samples-heading"
    >
      <div className="container">
        <DemoHeading
          id="samples-heading"
          eyebrow={samples.eyebrow}
          heading={samples.heading}
        >
          {samples.intro}
        </DemoHeading>

        {samples.items.length === 0 ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon} aria-hidden="true">
              <TbHammer />
            </span>
            <div className={styles.placeholderText}>
              <h3>{samples.placeholder.heading}</h3>
              <p>{samples.placeholder.body}</p>
            </div>
            <Button href={site.bookHref} variant="secondary">
              {samples.placeholder.cta}
            </Button>
          </div>
        ) : (
          <ul className={styles.grid}>
            {samples.items.map((s) => (
              <li key={s.name} className={styles.card}>
                <BrowserFrame>
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    sizes="(min-width: 1080px) 560px, 100vw"
                    style={{ objectFit: "cover" }}
                  />
                </BrowserFrame>
                <p className={styles.label}>{samples.label}</p>
                <h3 className={styles.name}>{s.name}</h3>
                <p className={styles.package}>Package shown: {s.packageName}</p>
                <p className={styles.oneLine}>{s.oneLine}</p>
                <ul className={styles.lookAt}>
                  {s.lookAt.map((l) => (
                    <li key={l}>
                      <TbCheck aria-hidden="true" />
                      {l}
                    </li>
                  ))}
                </ul>
                <div className={styles.actions}>
                  <Button href={s.siteHref} size="sm">
                    View the sample site
                  </Button>
                  <Link href={s.packageHref} className={styles.textLink}>
                    See this package
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
