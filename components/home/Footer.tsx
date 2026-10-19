import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { footer, navLinks, site } from "@/content/home";
import styles from "./Footer.module.css";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* The Luxury Coastal gradient, demoted to a thin rule */}
        <div className={styles.rule} aria-hidden="true" />

        <div className={styles.columns}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <Image src={site.logo.onDark} alt="" width={30} height={38} className={styles.mark} />
              <span className={styles.wordmark}>{site.name}</span>
            </Link>
            <p className={styles.oneLiner}>{site.oneLiner}</p>
          </div>

          <nav aria-label="Footer" className={styles.col}>
            <p className={styles.colTitle}>Quick links</p>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href={site.bookHref}>Book a free call</Link>
              </li>
            </ul>
          </nav>

          <div className={styles.col}>
            <p className={styles.colTitle}>Service areas</p>
            <ul>
              {footer.serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Contact</p>
            <ul>
              {/* <li>
                <a href={site.phoneHref} className={styles.mono}>
                  {site.phone}
                </a>
              </li> */}
              <li>
                <a href={site.emailHref}>{site.email}</a>
              </li>
              <li>{site.city}</li>
            </ul>
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Legal</p>
            <ul>
              {footer.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p className={styles.tagline}>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
