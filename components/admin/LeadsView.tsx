import Link from "next/link";
import { TbAlertTriangle, TbExternalLink, TbLogout, TbMail, TbPhone } from "react-icons/tb";
import { LEAD_STATUSES, STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/leads";
import { StatusSelect } from "./StatusSelect";
import { signOut } from "./actions";
import styles from "./Admin.module.css";

type Props = {
  leads: Lead[];
  counts: Record<LeadStatus | "all", number>;
  active: LeadStatus | "all";
};

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

const siteHref = (w: string) => (/^https?:\/\//i.test(w) ? w : `https://${w}`);

/** Pure layout for /admin/leads. Data comes from the page. */
export function LeadsView({ leads, counts, active }: Props) {
  const tabs: (LeadStatus | "all")[] = ["all", ...LEAD_STATUSES];

  return (
    <section className={styles.page} aria-labelledby="leads-heading">
      <div className={`container ${styles.inner}`}>
        <header className={styles.top}>
          <h1 id="leads-heading" className={styles.title}>
            Leads
          </h1>
          <form action={signOut}>
            <button type="submit" className={styles.quiet}>
              <TbLogout aria-hidden="true" />
              Sign out
            </button>
          </form>
        </header>

        <nav className={styles.tabs} aria-label="Filter by status">
          {tabs.map((t) => (
            <Link
              key={t}
              href={t === "all" ? "/admin/leads" : `/admin/leads?status=${t}`}
              className={styles.tab}
              aria-current={t === active ? "page" : undefined}
            >
              {t === "all" ? "All" : STATUS_LABEL[t]}
              <span className={styles.count}>{counts[t]}</span>
            </Link>
          ))}
        </nav>

        {leads.length === 0 ? (
          <p className={styles.empty}>
            {active === "all" ? "No leads yet. They'll show up here the moment someone sends the form." : "Nothing here."}
          </p>
        ) : (
          <ul className={styles.list}>
            {leads.map((l) => (
              <li key={l.id} className={styles.lead} data-status={l.status}>
                <div className={styles.leadTop}>
                  <div className={styles.who}>
                    <h2 className={styles.name}>{l.name}</h2>
                    <p className={styles.meta}>
                      <time dateTime={l.created_at}>{fmt.format(new Date(l.created_at))}</time>
                      <span aria-hidden="true">·</span>
                      <span>{l.source === "book" ? "From /book" : "From /contact"}</span>
                    </p>
                  </div>
                  <StatusSelect id={l.id} status={l.status} label={`Status for ${l.name}`} />
                </div>

                <div className={styles.reach}>
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className={styles.reachLink} data-preferred={l.contact_method === "email" || undefined}>
                      <TbMail aria-hidden="true" />
                      {l.email}
                    </a>
                  ) : null}
                  {l.phone ? (
                    <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className={styles.reachLink} data-preferred={l.contact_method === "phone" || undefined}>
                      <TbPhone aria-hidden="true" />
                      {l.phone}
                    </a>
                  ) : null}
                  {l.website ? (
                    <a href={siteHref(l.website)} target="_blank" rel="noopener noreferrer" className={styles.reachLink}>
                      <TbExternalLink aria-hidden="true" />
                      {l.website}
                    </a>
                  ) : null}
                </div>

                <p className={styles.message}>{l.message}</p>

                {!l.email_sent ? (
                  <p className={styles.warn}>
                    <TbAlertTriangle aria-hidden="true" />
                    The email alert failed for this one. Check your Brevo setup.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
