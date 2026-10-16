"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from "@/lib/leads";
import { updateLeadStatus } from "./actions";
import styles from "./Admin.module.css";

/** Saves as soon as you pick a new status. Rolls back if the save fails. */
export function StatusSelect({ id, status, label }: { id: string; status: LeadStatus; label: string }) {
  const [value, setValue] = useState<LeadStatus>(status);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.statusWrap}>
      <select
        aria-label={label}
        className={styles.status}
        data-status={value}
        value={value}
        disabled={pending}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const next = e.target.value as LeadStatus;
          const prev = value;
          setValue(next);
          setFailed(false);
          startTransition(async () => {
            try {
              await updateLeadStatus(id, next);
            } catch {
              setValue(prev);
              setFailed(true);
            }
          });
        }}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {failed ? (
        <span className={styles.saveError} role="alert">
          Didn't save
        </span>
      ) : null}
    </div>
  );
}
