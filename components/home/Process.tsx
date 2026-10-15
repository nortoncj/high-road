import type { IconType } from "react-icons";
import {
  TbArrowRight,
  TbBrowser,
  TbCalendarCheck,
  TbCheck,
  TbClipboardCheck,
  TbUsers,
} from "react-icons/tb";
import { processSection, type ProcessStep } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Process.module.css";

const icons: Record<ProcessStep["icon"], IconType> = {
  browser: TbBrowser,
  users: TbUsers,
  apply: TbClipboardCheck,
  calendar: TbCalendarCheck,
};

export function Process() {
  const { steps } = processSection;

  return (
    <section className={styles.section} aria-labelledby="process-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{processSection.eyebrow}</Eyebrow>
          <h2 id="process-heading" className={styles.heading}>
            {processSection.heading}
          </h2>
          <p className={styles.lead}>{processSection.body}</p>
        </header>

        <ol className={styles.steps}>
          {steps.map((step, i) => {
            const Icon = icons[step.icon];
            const isLast = i === steps.length - 1;
            return (
              <li key={step.title} className={styles.step}>
                <div className={styles.stepTop}>
                  <span className={styles.number} aria-hidden="true">
                    {i + 1}
                  </span>
                  <Icon className={styles.icon} aria-hidden="true" />
                  {!isLast ? (
                    <TbArrowRight
                      className={styles.connector}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <h3 className={styles.title}>
                  <span className="visually-hidden">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className={styles.body}>{step.body}</p>
                <ul className={styles.checklist}>
                  {step.checklist.map((line) => (
                    <li key={line}>
                      <TbCheck aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
