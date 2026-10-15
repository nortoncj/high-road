import { TbPhone } from "react-icons/tb";
import { site } from "@/content/home";
import { Button } from "@/components/ui/Button";
import styles from "./MobileCtaBar.module.css";

/** Sticky Call and Book bar for phones and small tablets. Hidden at 960px and up. */
export function MobileCtaBar() {
  return (
    <div className={styles.bar}>
      <a href={site.phoneHref} className={styles.call}>
        <TbPhone aria-hidden="true" />
        Call
      </a>
      <div className={styles.book}>
        <Button href={site.bookHref} block>
          Book a free call
        </Button>
      </div>
    </div>
  );
}
