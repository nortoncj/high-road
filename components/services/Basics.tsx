import Image from "next/image";
import type { IconType } from "react-icons";
import {
  TbChartBar,
  TbChecklist,
  TbDeviceMobile,
  TbForms,
  TbPhoneCall,
  TbSearch,
  TbUserCheck,
} from "react-icons/tb";
import { about } from "@/content/home";
import { basics, type Basic } from "@/content/services/website-design";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./Basics.module.css";

const icons: Record<Basic["icon"], IconType> = {
  phone: TbDeviceMobile,
  call: TbPhoneCall,
  form: TbForms,
  approve: TbChecklist,
  search: TbSearch,
  chart: TbChartBar,
  person: TbUserCheck,
};

export function Basics() {
  return (
    <section className={styles.section} aria-labelledby="basics-heading">
      <div className="container">
        <header className={styles.header}>
          <Eyebrow>{basics.eyebrow}</Eyebrow>
          <h2 id="basics-heading" className={styles.heading}>
            {basics.heading}
          </h2>
        </header>
        <ul className={styles.grid}>
          {basics.items.map((b) => {
            const Icon = icons[b.icon];
            return (
              <li key={b.title} className={styles.item}>
                {b.icon === "person" ? (
                  <Image src={about.photo.src} alt="" width={64} height={64} className={styles.avatar} />
                ) : (
                  <span className={styles.iconTile} aria-hidden="true">
                    <Icon />
                  </span>
                )}
                <div>
                  <p className={styles.title}>{b.title}</p>
                  <p className={styles.body}>{b.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
