import { saveErrorData, savePromiseData } from "./helpers/db.js";
import { sendWebhookNotification } from "./helpers/webhook.js";
import { createResponse } from "./helpers/response.js";

interface EventRecord {
  body: string;
}

interface LambdaEvent {
  Records: EventRecord[];
}

export const handler = async (event: LambdaEvent) => {
  for (const record of event.Records) {
    const { data } = JSON.parse(record.body);

    if (data.error) {
      const { success, result } = await saveErrorData(data);
      
      if (success) {
        sendWebhookNotification(); // fire-and-forget
        return createResponse(200, { message: 'Error data received and logged to PostgreSQL' });
      } else {
        return createResponse(500, { message: 'Error saving error data to PostgreSQL' });
      }
    } else {
      const { success, result } = await savePromiseData(data);
      console.log('PostgreSQL insert result:', result);

      if (success) {
        sendWebhookNotification(); // fire-and-forget
        return createResponse(200, { message: 'Promise data received and logged to PostgreSQL' });
      } else {
        return createResponse(500, { message: 'Error saving promise data to PostgreSQL' });
      }
    }
  }
};