import { trades } from "@/content/home";
import styles from "./TradeMarquee.module.css";

/** Slow-scrolling list of trades. The list is duplicated so the loop is seamless. */
export function TradeMarquee() {
  return (
    <section className={styles.strip} aria-labelledby="trades-line">
      <ul className="visually-hidden">
        {trades.list.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {[...trades.list, ...trades.list].map((t, i) => (
            <span key={`${t}-${i}`} className={styles.item}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <p id="trades-line" className={`container ${styles.line}`}>
        {trades.line}
      </p>
    </section>
  );
}
