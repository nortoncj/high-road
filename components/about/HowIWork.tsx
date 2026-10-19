import Link from "next/link";
import { TbArrowRight, TbCircleCheck } from "react-icons/tb";
import { howIWork } from "@/content/about";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./HowIWork.module.css";

/** The promises, set like a signed pledge card. */
export function HowIWork() {
  return (
    <section className={styles.section} aria-labelledby="how-heading">
      <div className="container">
        <div className={styles.card}>
          <header className={styles.header}>
            <Eyebrow>{howIWork.eyebrow}</Eyebrow>
            <h2 id="how-heading" className={styles.heading}>
              {howIWork.heading}
            </h2>
          </header>

          <ul className={styles.list}>
            {howIWork.promises.map((p) => (
              <li key={p.title} className={styles.item}>
                <TbCircleCheck className={styles.check} aria-hidden="true" />
                <div>
                  <p className={styles.title}>{p.title}</p>
                  <p className={styles.body}>
                    {p.body}
                    {p.link ? (
                      <>
                        {" "}
                        <Link href={p.link.href} className={styles.link}>
                          {p.link.label}
                          <TbArrowRight aria-hidden="true" />
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.signoff}>
            <span className={styles.signLine} aria-hidden="true" />
            <span className={styles.sign}>{howIWork.signoff}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
