import Image from "next/image";
import { report } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatTile } from "@/components/ui/StatTile";
import { TrendChart } from "@/components/ui/TrendChart";
import styles from "./ReportPreview.module.css";

/** The monthly report, shown with example data on a dark photo. Charts run in true Monokai here. */
export function ReportPreview() {
  return (
    <section className={styles.section} aria-labelledby="report-heading">
      <div className={styles.media} aria-hidden="true">
        <Image src={report.image.src} alt="" fill sizes="100vw" className={styles.bg} />
        <div className={styles.shade} />
      </div>

      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <Eyebrow>{report.eyebrow}</Eyebrow>
            <h2 id="report-heading" className={styles.heading}>
              {report.heading}
            </h2>
          </div>
          <p className={styles.lead}>{report.body}</p>
        </header>

        <div className={styles.panel}>
          <div className={styles.panelTop}>
            <p className={styles.panelTitle}>{report.title}</p>
            <span className={styles.badge}>{report.badge}</span>
          </div>
          <div className={styles.stats}>
            {report.stats.map((s) => (
              <StatTile key={s.label} {...s} />
            ))}
          </div>
          <TrendChart
            title={report.chart.title}
            subtitle={report.chart.subtitle}
            labels={report.chart.labels}
            series={report.chart.series}
            height={220}
          />
        </div>
      </div>
    </section>
  );
}
