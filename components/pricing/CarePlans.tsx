import { TbCheck, TbMinus } from "react-icons/tb";
import { care, usd, type CarePlan } from "@/content/pricing";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./CarePlans.module.css";

function Cell({ value }: { value: boolean | string | undefined }) {
  if (typeof value === "string") return <span className={styles.limit}>{value}</span>;
  if (value)
    return (
      <span className={styles.yes}>
        <TbCheck aria-hidden="true" />
        <span className="visually-hidden">Included</span>
      </span>
    );
  return (
    <span className={styles.no}>
      <TbMinus aria-hidden="true" />
      <span className="visually-hidden">Not included</span>
    </span>
  );
}

function PlanHead({ plan }: { plan: CarePlan }) {
  return (
    <>
      <span className={styles.planName}>{plan.name}</span>
      <span className={styles.planPrice}>
        {usd(plan.price)}
        <span className={styles.per}>/month</span>
      </span>
      {plan.featured ? <span className={styles.note}>{care.includedNote}</span> : null}
    </>
  );
}

/**
 * Phones get one card per plan; 900px and up get a comparison table.
 * Same data, two layouts, only one ever displayed.
 */
export function CarePlans() {
  return (
    <section id="care" className={styles.section} aria-labelledby="care-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{care.eyebrow}</Eyebrow>
          <h2 id="care-heading" className={styles.heading}>
            {care.heading}
          </h2>
          <p className={styles.lead}>{care.body}</p>
        </header>

        <ul className={styles.cards}>
          {care.plans.map((plan) => (
            <li key={plan.id} className={styles.card} data-featured={plan.featured ?? false}>
              <div className={styles.cardHead}>
                <PlanHead plan={plan} />
              </div>
              <ul className={styles.cardRows}>
                {care.rows.map((row) => (
                  <li key={row.label} data-on={Boolean(row.values[plan.id])}>
                    <Cell value={row.values[plan.id]} />
                    <span>{row.label}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="visually-hidden">Care plans compared</caption>
            <thead>
              <tr>
                <td />
                {care.plans.map((plan) => (
                  <th key={plan.id} scope="col" data-featured={plan.featured ?? false}>
                    <div className={styles.thInner}>
                      <PlanHead plan={plan} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {care.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {care.plans.map((plan) => (
                    <td key={plan.id} data-featured={plan.featured ?? false}>
                      <Cell value={row.values[plan.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.fine}>{care.fine}</p>
      </div>
    </section>
  );
}
