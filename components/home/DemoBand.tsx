import { TbCheck, TbDeviceLaptop } from "react-icons/tb";
import { demo, site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./DemoBand.module.css";

/** "See it in action": the demo is your proof until the first home care case study exists. */
export function DemoBand() {
  return (
    <section className={styles.section} aria-labelledby="demo-heading">
      <div className="container">
        <div className={styles.band}>
          <div className={styles.intro}>
            <span className={styles.iconTile} aria-hidden="true">
              <TbDeviceLaptop />
            </span>
            <div className={styles.introText}>
              <h2 id="demo-heading" className={styles.heading}>
                {demo.heading}
              </h2>
              <p className={styles.body}>{demo.body}</p>
              <Button href={site.demoHref} arrow className={styles.cta}>
                {demo.cta}
              </Button>
            </div>
          </div>

          <ul className={styles.features}>
            {demo.features.map((f) => (
              <li key={f}>
                <TbCheck aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          <DeviceMock />
        </div>
      </div>
    </section>
  );
}

/** Decorative laptop and phone. Swap for a real screenshot of /demo once it's built. */
function DeviceMock() {
  return (
    <div className={styles.devices} aria-hidden="true">
      <div className={styles.laptop}>
        <div className={styles.screen}>
          <span className={styles.screenTitle}>Apply to be a caregiver</span>
          <span className={styles.track}>
            <span className={styles.fill} />
          </span>
          <span className={styles.row} />
          <span className={`${styles.row} ${styles.rowOn}`} />
          <span className={styles.row} />
          <span className={styles.next} />
        </div>
        <div className={styles.base} />
      </div>
      <div className={styles.mini}>
        <span className={styles.miniTitle}>Apply to be a caregiver</span>
        <span className={styles.miniRow} />
        <span className={`${styles.miniRow} ${styles.rowOn}`} />
        <span className={styles.miniRow} />
        <span className={styles.miniNext} />
      </div>
    </div>
  );
}
