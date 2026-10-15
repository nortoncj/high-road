import type { IconType } from "react-icons";
import {
  TbChartBar,
  TbDeviceMobile,
  TbHeartHandshake,
  TbLanguage,
  TbMapPin,
} from "react-icons/tb";
import { trustHeading, trustItems, type TrustItem } from "@/content/home";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./TrustStrip.module.css";

const icons: Record<TrustItem["icon"], IconType> = {
  heart: TbHeartHandshake,
  language: TbLanguage,
  phone: TbDeviceMobile,
  chart: TbChartBar,
  pin: TbMapPin,
};

export function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Why agencies trust this">
      <div className={`container ${styles.inner}`}>
        <Eyebrow align="center">{trustHeading}</Eyebrow>
        <ul className={styles.list}>
          {trustItems.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.label} className={styles.item}>
                <Icon className={styles.icon} aria-hidden="true" />
                <div>
                  <p className={styles.label}>{item.label}</p>
                  <p className={styles.detail}>{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
