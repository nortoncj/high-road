import Image from "next/image";
import { TbMail, TbMapPin, TbPhone } from "react-icons/tb";
import { about, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./About.module.css";

/** Closing section: the ask, plus the person who answers the phone. */
export function About() {
  return (
    <section
      id="contact"
      className={styles.section}
      aria-labelledby="about-heading"
    >
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <h2 id="about-heading" className={styles.heading}>
            {about.heading}
          </h2>
          <p className={styles.body}>{about.body}</p>
          <div className={styles.actions}>
            <Button href={site.bookHref} arrow>
              {about.primaryCta}
            </Button>
            <Button href={site.demoHref} variant="secondary">
              {about.secondaryCta}
            </Button>
          </div>
          <p className={styles.fine}>
            Website packages start at{" "}
            <span className={styles.price}>{site.priceFloor}</span>. Se habla
            español.
          </p>
        </div>

        <div className={styles.person}>
          <div className={styles.photo}>
            <Image
              src={about.photo.src}
              alt={about.photo.alt}
              fill
              sizes="(min-width: 640px) 240px, 100vw"
              className={styles.photoImg}
            />
          </div>
          <div className={styles.card}>
            <div>
              <p className={styles.name}>{about.name}</p>
              <p className={styles.role}>{about.role}</p>
            </div>
            <p className={styles.bio}>{about.bio}</p>
            <ul className={styles.contact}>
              <li>
                <TbMail aria-hidden="true" />
                <a href={site.emailHref}>{site.email}</a>
              </li>
              <li>
                <TbPhone aria-hidden="true" />
                <a href={site.phoneHref} className={styles.mono}>
                  {site.phone}
                </a>
              </li>
              <li>
                <TbMapPin aria-hidden="true" />
                <span>{site.city}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
