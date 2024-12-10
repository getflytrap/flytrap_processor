import { saveErrorData, saveRejectionData } from "./utils/database";
import { sendWebhookNotification } from "./utils/webhook";
import { CodeContext } from "./utils/types";
interface EventRecord {
  body: string; // Represents the body of a record, typically a JSON string.
}

interface LambdaEvent {
  Records: EventRecord[]; // Contains an array of records received by the Lambda.
}

/**
 * AWS Lambda handler to process event records, save error or rejection data to PostgreSQL,
 * and send webhook notifications if successful.
 *
 * @param event - The event object containing an array of records.
 */
export const handler = async (event: LambdaEvent): Promise<void> => {
  for (const record of event.Records) {
    const { data } = JSON.parse(record.body);

    if (data.codeContexts) {
      data.codeContexts = data.codeContexts.map(
        (contextEntry: CodeContext) => ({
          ...contextEntry,
          context: JSON.parse(contextEntry.context),
        }),
      );
    }

    try {
      if (data.error) {
        // Save error data to PostgreSQL and send webhook notification on success.
        const { success } = await saveErrorData(data);

        if (success) {
          sendWebhookNotification(data.project_id); // fire-and-forget
        } else {
          console.error("Error saving error data to PostgreSQL");
        }
      } else {
        // Save rejection data to PostgreSQL and send webhook notification on success.
        const { success } = await saveRejectionData(data);

        if (success) {
          sendWebhookNotification(data.project_id); // fire-and-forget
        } else {
          console.error("Error saving rejection data to PostgreSQL");
        }
      }
    } catch (e) {
      // Log unexpected errors during processing.
      console.error("Error processing record:", e);
    }
  }
};
