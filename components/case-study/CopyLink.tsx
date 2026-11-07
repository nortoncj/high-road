"use client";

import { useState } from "react";
import { TbCheck, TbLink } from "react-icons/tb";
import { caseStudyPage } from "@/content/case-study";
import styles from "./CaseStudy.module.css";

const copy = caseStudyPage.cta;

/** "Send this page to whoever does your website." Copies the URL; says so out loud for screen readers. */
export function CopyLink() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard blocked: select-and-copy fallback isn't worth it; the address bar works.
    }
  };

  return (
    <div className={styles.share}>
      <p className={styles.shareTitle}>{copy.shareTitle}</p>
      <p className={styles.shareBody}>{copy.shareBody}</p>
      <button type="button" className={styles.copy} onClick={onCopy} data-copied={copied}>
        {copied ? <TbCheck aria-hidden="true" /> : <TbLink aria-hidden="true" />}
        {copied ? copy.copied : copy.copy}
      </button>
      <p className={styles.shareStatus} role="status">
        {copied ? copy.copiedStatus : ""}
      </p>
    </div>
  );
}
