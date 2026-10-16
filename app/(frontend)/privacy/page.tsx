import type { Metadata } from "next";
import { LegalContact, LegalPage } from "@/components/legal";
import { privacy, privacyMeta } from "@/content/privacy";
import { site } from "@/content/home";

export const metadata: Metadata = {
  title: { absolute: privacyMeta.title },
  description: privacyMeta.description,
  alternates: { canonical: privacyMeta.path },
};

export default function PrivacyPage() {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <LegalPage
      eyebrow={privacy.eyebrow}
      headline={privacy.headline}
      effectiveDate={privacyMeta.effectiveDate}
      intro={privacy.intro}
      summary={{ title: privacy.shortVersionTitle, items: privacy.shortVersion }}
      tocLabel={privacy.tocLabel}
      sections={privacy.sections}
      draftNotice={privacy.draftNotice}
      draftReminder={privacy.draftReminder}
      contact={
        <LegalContact
          email={site.email}
          emailHref={site.emailHref}
          phone={site.phone}
          phoneHref={site.phoneHref}
          mailingAddress={privacy.contact.mailingAddress}
          labels={{
            email: privacy.contact.emailLabel,
            phone: privacy.contact.phoneLabel,
            mail: privacy.contact.mailLabel,
          }}
          footnote={privacy.contact.spanish}
          markPlaceholders={isDev}
        />
      }
    />
  );
}
