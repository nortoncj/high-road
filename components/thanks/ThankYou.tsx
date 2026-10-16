import Link from "next/link";
import { TbArrowRight, TbCalendarCheck, TbMailCheck, TbPhone, TbTarget, TbWorldWww } from "react-icons/tb";
import { thanks, thanksLink, type ThanksVariant } from "@/content/thanks";
import { site } from "@/content/home";
import styles from "./ThankYou.module.css";

const badgeIcon = { booked: TbCalendarCheck, message: TbMailCheck } as const;
const readyIcons = [TbWorldWww, TbTarget];

/** Confirmation card shown after a booking or a contact form submission. */
export function ThankYou({ variant }: { variant: ThanksVariant }) {
  const copy = thanks[variant];
  const Badge = badgeIcon[variant];

  return (
    <section className={styles.section} aria-labelledby="thanks-heading">
      <div className="container">
        <div className={styles.card}>
          <span className={styles.badge} aria-hidden="true">
            <Badge />
          </span>

          <h1 id="thanks-heading" className={styles.headline}>
            {copy.headline}
          </h1>

          <p className={styles.intro}>
            {copy.intro}
            {copy.help ? (
              <>
                {" "}
                {copy.help}{" "}
                <a href={site.phoneHref} className={styles.phone}>
                  <TbPhone aria-hidden="true" />
                  {site.phone}
                </a>
                .
              </>
            ) : null}
          </p>

          <div className={styles.ready}>
            <p className={styles.readyLead}>{copy.readyLead}</p>
            <ul className={styles.list}>
              {copy.ready.map((item, i) => {
                const Icon = readyIcons[i] ?? TbTarget;
                return (
                  <li key={item.strong}>
                    <span className={styles.itemIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span>
                      <strong>{item.strong}</strong> {item.rest}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className={styles.signoff}>{copy.signoff}</p>

          <div className={styles.linkBlock}>
            <p className={styles.linkLead}>{thanksLink.lead}</p>
            <Link href={thanksLink.href} className={styles.link}>
              {thanksLink.label}
              <TbArrowRight className={styles.arrow} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
