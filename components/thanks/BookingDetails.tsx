"use client";

import { useSearchParams } from "next/navigation";
import { TbClock, TbUser } from "react-icons/tb";
import styles from "./BookingDetails.module.css";

/**
 * Shows the booked time if Calendly passed it along.
 *
 * Calendly only sends these when its event type is set to "Redirect to an external site" with
 * "Pass event details to your redirected page" turned on. Without them this renders nothing,
 * and the page still reads fine. Names are Calendly's own query parameters.
 */
export function BookingDetails() {
  const params = useSearchParams();
  const start = params.get("event_start_time");
  const first = params.get("invitee_first_name") ?? params.get("invitee_full_name")?.split(" ")[0];

  if (!start) return null;
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return null;

  // Shown in the visitor's own time zone, same as Calendly showed them.
  const day = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  return (
    <div className={styles.details}>
      {first ? (
        <p className={styles.row}>
          <TbUser aria-hidden="true" />
          <span>
            See you then, <strong>{first}</strong>.
          </span>
        </p>
      ) : null}
      <p className={styles.row}>
        <TbClock aria-hidden="true" />
        <span>
          <strong>{day}</strong> at <strong>{time}</strong>
        </span>
      </p>
    </div>
  );
}
