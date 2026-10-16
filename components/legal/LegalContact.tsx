import { TbMail, TbMailbox, TbPhone } from "react-icons/tb";
import { RichText } from "./RichText";
import styles from "./LegalPage.module.css";

type Props = {
  email: string;
  emailHref: string;
  phone: string;
  phoneHref: string;
  mailingAddress: string;
  labels: { email: string; phone: string; mail: string };
  footnote?: string;
  markPlaceholders?: boolean;
};

/** Contact card used inside a legal page's "contact me" section. */
export function LegalContact({ email, emailHref, phone, phoneHref, mailingAddress, labels, footnote, markPlaceholders }: Props) {
  return (
    <div className={styles.contact}>
      <dl className={styles.contactList}>
        <div className={styles.contactRow}>
          <dt>
            <TbMail aria-hidden="true" />
            {labels.email}
          </dt>
          <dd>
            <a href={emailHref} className={styles.inlineLink}>
              <RichText text={email} markPlaceholders={markPlaceholders} />
            </a>
          </dd>
        </div>
        <div className={styles.contactRow}>
          <dt>
            <TbPhone aria-hidden="true" />
            {labels.phone}
          </dt>
          <dd>
            <a href={phoneHref} className={styles.inlineLink}>
              <RichText text={phone} markPlaceholders={markPlaceholders} />
            </a>
          </dd>
        </div>
        <div className={styles.contactRow}>
          <dt>
            <TbMailbox aria-hidden="true" />
            {labels.mail}
          </dt>
          <dd>
            <RichText text={mailingAddress} markPlaceholders={markPlaceholders} />
          </dd>
        </div>
      </dl>
      {footnote ? <p className={styles.contactNote}>{footnote}</p> : null}
    </div>
  );
}
