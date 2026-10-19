import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { pillars } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Pillars.module.css";

/** "What you get": the three things the site does for the owner. */
export function Pillars() {
  return (
    <section id="what" className={styles.section} aria-labelledby="pillars-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{pillars.eyebrow}</Eyebrow>
          <h2 id="pillars-heading" className={styles.heading}>
            {pillars.heading}
          </h2>
          <p className={styles.lead}>{pillars.body}</p>
        </header>

        <ul className={styles.grid}>
          {pillars.items.map((item, i) => (
            <li key={item.title} className={styles.card}>
              <div className={styles.media}>
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1080px) 380px, (min-width: 720px) 50vw, 100vw"
                  className={styles.img}
                />
                <span className={styles.tag}>
                  {String(i + 1).padStart(2, "0")} · {item.tag}
                </span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.text}>{item.body}</p>
                {item.link ? (
                  <Link href={item.link.href} className={styles.more}>
                    {item.link.label}
                    <TbArrowRight aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
