import { TbCoin } from "react-icons/tb";
import { addOns, usd } from "@/content/pricing";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./AddOns.module.css";

/** Add-on price list beside the "smaller budget?" card. */
export function AddOns() {
  return (
    <section className={styles.section} aria-labelledby="addons-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.listCol}>
          <header className={styles.header}>
            <Eyebrow>{addOns.eyebrow}</Eyebrow>
            <h2 id="addons-heading" className={styles.heading}>
              {addOns.heading}
            </h2>
            <p className={styles.lead}>{addOns.body}</p>
          </header>

          <dl className={styles.list}>
            {addOns.items.map((a) => (
              <div key={a.name} className={styles.row}>
                <dt>
                  {a.name}
                  {a.note ? <span className={styles.note}>{a.note}</span> : null}
                </dt>
                <dd>{usd(a.price)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className={styles.budget} aria-labelledby="budget-heading">
          <span className={styles.iconTile} aria-hidden="true">
            <TbCoin />
          </span>
          <h3 id="budget-heading" className={styles.budgetHeading}>
            {addOns.budget.heading}
          </h3>
          <p className={styles.budgetBody}>{addOns.budget.body}</p>
          <Button href={addOns.budget.cta.href} variant="secondary" arrow>
            {addOns.budget.cta.label}
          </Button>
        </aside>
      </div>
    </section>
  );
}
