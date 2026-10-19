import { TbCalendarDollar } from "react-icons/tb";
import { packages, payMonthly, usd } from "@/content/pricing";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./PayMonthly.module.css";

export function PayMonthly() {
  return (
    <section className={styles.section} aria-labelledby="monthly-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.intro}>
            <span className={styles.iconTile} aria-hidden="true">
              <TbCalendarDollar />
            </span>
            <div className={styles.introText}>
              <Eyebrow>{payMonthly.eyebrow}</Eyebrow>
              <h2 id="monthly-heading" className={styles.heading}>
                {payMonthly.heading}
              </h2>
              <p className={styles.body}>{payMonthly.body}</p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">Package prices, paid once or monthly</caption>
              <thead>
                <tr>
                  <th scope="col">{payMonthly.columns.pkg}</th>
                  <th scope="col" className={styles.num}>
                    {payMonthly.columns.once}
                  </th>
                  <th scope="col" className={styles.num}>
                    {payMonthly.columns.monthly}
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.items.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">{p.name}</th>
                    <td className={styles.num}>{usd(p.once)}</td>
                    <td className={styles.num}>
                      {usd(p.monthly)}
                      <span className={styles.per}>/mo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
