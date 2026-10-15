import type { IconType } from "react-icons";
import {
  TbChartBar,
  TbClipboardCheck,
  TbDeviceMobile,
  TbEye,
  TbPencil,
  TbPhoneCall,
  TbSearch,
  TbUsers,
} from "react-icons/tb";
import { included, type IncludedItem } from "@/content/services";
import { SectionHeader } from "./SectionHeader";
import styles from "./IncludedGrid.module.css";

const icons: Record<IncludedItem["icon"], IconType> = {
  pencil: TbPencil,
  phone: TbDeviceMobile,
  eye: TbEye,
  call: TbPhoneCall,
  careers: TbClipboardCheck,
  chart: TbChartBar,
  search: TbSearch,
  people: TbUsers,
};

export function IncludedGrid() {
  return (
    <section className={styles.section} aria-labelledby="included-heading">
      <div className="container">
        <SectionHeader id="included-heading" eyebrow={included.eyebrow} heading={included.heading} />
        <ul className={styles.grid}>
          {included.items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.title} className={styles.card}>
                <span className={styles.iconTile} aria-hidden="true">
                  <Icon />
                </span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.body}>{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
