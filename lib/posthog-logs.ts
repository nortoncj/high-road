import "server-only";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "@/instrumentation";

const logger = loggerProvider?.getLogger("posthog_export_only");

type LeadSource = "contact" | "book" | "home";

export function logLeadSubmissionAccepted(source: LeadSource) {
  logger?.emit({
    body: "lead submission accepted",
    severityNumber: SeverityNumber.INFO,
    attributes: {
      event_name: "lead_submission_accepted",
      source,
    },
  });
}

export function logLeadSubmissionProcessed({
  source,
  emailAlertDelivered,
  databaseRecordSaved,
}: {
  source: LeadSource;
  emailAlertDelivered: boolean;
  databaseRecordSaved: boolean;
}) {
  const delivered = emailAlertDelivered || databaseRecordSaved;

  logger?.emit({
    body: "lead submission processed",
    severityNumber: delivered ? SeverityNumber.INFO : SeverityNumber.ERROR,
    attributes: {
      event_name: "lead_submission_processed",
      source,
      email_alert_delivered: emailAlertDelivered,
      database_record_saved: databaseRecordSaved,
      delivery_succeeded: delivered,
    },
  });
}

export async function flushPostHogLogs() {
  try {
    await loggerProvider?.forceFlush();
  } catch {
    // Observability delivery must not interrupt a visitor's form submission.
  }
}
