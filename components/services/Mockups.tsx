import Image from "next/image";
import type { CSSProperties, JSX } from "react";
import {
  TbBell,
  TbBolt,
  TbCalendarEvent,
  TbCheck,
  TbCircleCheck,
  TbCircleCheckFilled,
  TbDirections,
  TbLock,
  TbMapPin,
  TbMapPinFilled,
  TbMessage,
  TbMessageCircle,
  TbPhone,
  TbPhoneCall,
  TbSearch,
  TbSend,
  TbShieldCheck,
  TbStarFilled,
  TbWorld,
} from "react-icons/tb";
import { mockups as copy } from "@/content/services";
import type { MockupName } from "@/content/services/types";
import { ctaBg } from "@img/home";
import styles from "./Mockups.module.css";

/* Decorative pictures of what each service does, drawn in code. Every one sits in a warm panel and is
   hidden from screen readers: the copy beside it says the same thing in words. Animations wait until
   the panel scrolls into view (Reveal sets data-reveal="pending" until then). */

const stagger = (n: number) => ({ "--n": n }) as CSSProperties;
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("");

const Example = () => <span className={styles.example}>{copy.example}</span>;

const Stars = () => (
  <span className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) => (
      <TbStarFilled key={i} />
    ))}
  </span>
);

const pictures: Record<MockupName, () => JSX.Element> = {
  makeover: Makeover,
  phone: Phone,
  alerts: Alerts,
  timeline: Timeline,
  booking: Booking,
  maps: Maps,
  reviews: Reviews,
  application: Application,
  leads: () => <List data={copy.leads} />,
  applicants: () => <List data={copy.applicants} />,
  automation: Automation,
  care: Care,
  report: Report,
};

export function Mockup({ name }: { name: MockupName }) {
  const Picture = pictures[name];
  return (
    <div className={styles.stage} data-mockup={name} aria-hidden="true">
      <Picture />
    </div>
  );
}

/* ---------- A phone on the lock screen as the lead lands ---------- */

const noteIcons = [TbMessageCircle, TbSend];

function Alerts() {
  const a = copy.alerts;
  return (
    <>
      <div className={styles.phone}>
        <div className={styles.screen}>
          <Image src={ctaBg} alt="" fill sizes="240px" className={styles.wallpaper} />
          <div className={styles.lock}>
            <TbLock />
            <span className={styles.clock}>{a.clock}</span>
            <span className={styles.date}>{a.date}</span>
          </div>
          <ul className={styles.notes}>
            {a.notifications.map((n, i) => {
              const Icon = noteIcons[i % noteIcons.length];
              return (
                <li key={n.title} className={styles.note} style={stagger(i)}>
                  <span className={styles.noteIcon}>
                    <Icon />
                  </span>
                  <span className={styles.noteText}>
                    <span className={styles.noteApp}>
                      {n.app}
                      <span>{a.now}</span>
                    </span>
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <span className={styles.callChip}>
        <TbPhoneCall />
        {a.call}
      </span>
    </>
  );
}

/* ---------- The lead, minute by minute ---------- */

const eventIcons = [TbBell, TbMessage, TbSend, TbMapPin];

function Timeline() {
  const t = copy.timeline;
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardLabel}>{t.label}</span>
        <Example />
      </div>
      <ol className={styles.events}>
        {t.events.map((e, i) => {
          const Icon = eventIcons[i % eventIcons.length];
          return (
            <li key={e.title} className={styles.event} style={stagger(i)}>
              <span className={styles.eventIcon} data-first={i === 0 || undefined}>
                <Icon />
              </span>
              <span className={styles.eventText}>
                <span className={styles.eventRow}>
                  <strong>{e.title}</strong>
                  <span className={styles.time}>{e.time}</span>
                </span>
                <span>{e.meta}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- A dated DIY page behind a real site I built ---------- */

function Makeover() {
  const { before, after } = copy.makeover;
  return (
    <div className={styles.makeover}>
      <div className={styles.before}>
        <span className={styles.tag}>{before.label}</span>
        <div className={styles.oldBar}>
          {before.nav.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div className={styles.oldBody}>
          <p className={styles.oldTitle}>{before.title}</p>
          <span className={styles.oldImg} />
          <p className={styles.oldText}>{before.body}</p>
          <span className={styles.oldLines} />
        </div>
      </div>

      <div className={styles.after}>
        <span className={`${styles.tag} ${styles.tagAfter}`}>{after.label}</span>
        <div className={styles.browserBar}>
          <span className={styles.dots}>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.address}>
            <TbLock />
            {new URL(after.project.href).hostname.replace(/^www\./, "")}
          </span>
        </div>
        <div className={styles.shotWrap}>
          <Image src={after.project.image.src} alt="" fill sizes="(min-width: 1080px) 440px, 90vw" className={styles.shot} />
        </div>
      </div>
    </div>
  );
}

/* ---------- A real client site on a phone, call button up top ---------- */

function Phone() {
  return (
    <>
      <div className={styles.phone}>
        <div className={styles.siteScreen}>
          <Image src={copy.phone.image} alt="" sizes="220px" className={styles.siteShot} />
        </div>
      </div>
      <span className={styles.callChip}>
        <TbPhoneCall />
        {copy.phone.call}
      </span>
    </>
  );
}

/* ---------- Where the leads came from ---------- */

function Report() {
  const r = copy.report;
  const max = Math.max(...r.sources.map((s) => s.value));
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>{r.title}</span>
        <Example />
      </div>
      <p className={styles.reportTotal}>{r.total}</p>
      <ul className={styles.bars}>
        {r.sources.map((s, i) => (
          <li key={s.name} style={{ "--w": `${(s.value / max) * 100}%`, "--n": i } as CSSProperties}>
            <span className={styles.barLabel}>
              {s.name}
              <strong>{s.value}</strong>
            </span>
            <span className={styles.barTrack}>
              <span className={styles.barFill} data-series={i} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Your listing on the map ---------- */

const actionIcons = [TbPhone, TbDirections, TbWorld];

function Maps() {
  const m = copy.maps;
  return (
    <div className={styles.maps}>
      <div className={styles.map}>
        <span className={styles.search}>
          <TbSearch />
          {m.search}
        </span>
        <span className={styles.pin} style={{ left: "18%", top: "64%" }} />
        <span className={styles.pin} style={{ left: "76%", top: "30%" }} />
        <span className={styles.pin} style={{ left: "84%", top: "72%" }} />
        <span className={styles.pinMain}>
          <TbMapPinFilled />
        </span>
      </div>
      <div className={styles.listing}>
        <div className={styles.listingTop}>
          <strong className={styles.listingName}>{copy.business}</strong>
          <Example />
        </div>
        <p className={styles.rating}>
          <strong>{m.rating}</strong>
          <Stars />
          <span>({m.reviews})</span>
        </p>
        <p className={styles.listingMeta}>{m.category}</p>
        <p className={styles.open}>{m.hours}</p>
        <div className={styles.actions}>
          {m.actions.map((label, i) => {
            const Icon = actionIcons[i % actionIcons.length];
            return (
              <span key={label} className={styles.action} data-primary={i === 0 || undefined}>
                <Icon />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- A review request by text, and the review it brings back ---------- */

function Reviews() {
  const r = copy.reviews;
  return (
    <div className={styles.reviews}>
      <div className={styles.chat}>
        <p className={styles.bubbleOut} style={stagger(0)}>
          {r.message} <span className={styles.chatLink}>{r.link}</span>
        </p>
        <p className={styles.bubbleIn} style={stagger(1)}>
          {r.reply}
        </p>
      </div>
      <div className={`${styles.card} ${styles.reviewCard}`} style={stagger(2)}>
        <div className={styles.reviewTop}>
          <span className={styles.avatar}>{initials(r.review.name)}</span>
          <span className={styles.reviewWho}>
            <strong>{r.review.name}</strong>
            <span>{r.review.when}</span>
          </span>
          <Example />
        </div>
        <Stars />
        <p className={styles.reviewText}>{r.review.text}</p>
      </div>
    </div>
  );
}

/* ---------- Picking a time online ---------- */

function Booking() {
  const b = copy.booking;
  return (
    <div className={styles.bookingWrap}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>
            <TbCalendarEvent />
            {b.title}
          </span>
          <Example />
        </div>
        <p className={styles.bookingService}>
          {copy.business} · {b.service}
        </p>
        <ul className={styles.days}>
          {b.days.map((d, i) => (
            <li key={d.date} data-picked={i === b.pickedDay || undefined}>
              <span>{d.day}</span>
              <strong>{d.date}</strong>
            </li>
          ))}
        </ul>
        <ul className={styles.times}>
          {b.times.map((t, i) => (
            <li key={t} data-picked={i === b.pickedTime || undefined}>
              {t}
            </li>
          ))}
        </ul>
        <span className={styles.bookButton}>{b.button}</span>
      </div>
      <span className={styles.toast}>
        <TbCircleCheckFilled />
        {b.confirm}
      </span>
    </div>
  );
}

/* ---------- A job application on a phone, and the text it sends you ---------- */

function Application() {
  const a = copy.application;
  return (
    <>
      <div className={styles.phone}>
        <div className={styles.formScreen}>
          <div className={styles.formHead}>
            <strong>{a.title}</strong>
            <span>{a.role}</span>
            <span className={styles.formMeta}>{a.meta}</span>
          </div>
          <div className={styles.progress}>
            <span>{a.step}</span>
            <span className={styles.progressTrack}>
              <span />
            </span>
          </div>
          <ul className={styles.fields}>
            {a.fields.map((f) => (
              <li key={f.label}>
                <span className={styles.fieldLabel}>{f.label}</span>
                <span className={styles.fieldValue}>
                  {f.value}
                  <TbCheck />
                </span>
              </li>
            ))}
          </ul>
          <span className={styles.formButton}>{a.button}</span>
        </div>
      </div>
      <span className={`${styles.note} ${styles.floatNote}`} style={stagger(0)}>
        <span className={styles.noteIcon}>
          <TbMessageCircle />
        </span>
        <span className={styles.noteText}>
          <span className={styles.noteApp}>
            {a.alert.app}
            <span>{copy.alerts.now}</span>
          </span>
          <strong>{a.alert.title}</strong>
          <span>{a.alert.body}</span>
        </span>
      </span>
    </>
  );
}

/* ---------- Leads or applicants in one list ---------- */

type ListData = { title: string; rows: { name: string; detail: string; status: string; tone: string }[] };

function List({ data }: { data: ListData }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>{data.title}</span>
        <Example />
      </div>
      <ul className={styles.rows}>
        {data.rows.map((r, i) => (
          <li key={r.name} className={styles.row} style={stagger(i)}>
            <span className={styles.avatar}>{initials(r.name)}</span>
            <span className={styles.rowText}>
              <strong>{r.name}</strong>
              <span>{r.detail}</span>
            </span>
            <span className={styles.status} data-tone={r.tone}>
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- One thing happens, the next runs on its own ---------- */

const stepIcons = [TbCircleCheck, TbMessage, TbStarFilled];

function Automation() {
  const a = copy.automation;
  return (
    <div className={styles.flow}>
      <div className={styles.flowTop}>
        <span className={styles.flowLabel}>
          <TbBolt />
          {a.label}
        </span>
        <Example />
      </div>
      <ol className={styles.steps}>
        {a.steps.map((s, i) => {
          const Icon = stepIcons[i % stepIcons.length];
          return (
            <li key={s.title} className={styles.step} style={stagger(i)} data-last={i === a.steps.length - 1 || undefined}>
              <span className={styles.stepIcon}>
                <Icon />
              </span>
              <span className={styles.stepText}>
                <strong>{s.title}</strong>
                <span>{s.body}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- Everything checked, nothing to do ---------- */

function Care() {
  const c = copy.care;
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>
          <TbShieldCheck />
          {c.title}
        </span>
        <Example />
      </div>
      <p className={styles.careSite}>
        <span className={styles.careHost}>
          <TbLock />
          {c.site}
        </span>
        <span className={styles.careStatus}>{c.status}</span>
      </p>
      <ul className={styles.careRows}>
        {c.rows.map((r, i) => (
          <li key={r.label} style={stagger(i)}>
            <TbCircleCheckFilled />
            <span>{r.label}</span>
            <strong>{r.value}</strong>
          </li>
        ))}
      </ul>
      <div className={styles.uptime}>
        <span className={styles.uptimeLabel}>{c.uptime}</span>
        <span className={styles.uptimeBars}>
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} style={stagger(i)} />
          ))}
        </span>
      </div>
    </div>
  );
}
