import axios from "axios";

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  import('dotenv').then((dotenv) => dotenv.config());
}

/**
 * Sends a webhook notification for a specific project.
*
* @param projectId - The ID of the project for which the notification is being sent.
* @returns A promise that resolves if the request is successful, logs errors otherwise.
*/
export const sendWebhookNotification = async (projectId: string) => {
  const url = process.env.WEBHOOK_ENDPOINT;

  if (!url) {
    console.warn("Webhook endpoint URL is not defined.");
    return;
  }

  try {
    await axios.post(`${url}/api/notifications/webhook`, {
      message: "New issue",
      project_id: projectId,
    });
    console.log("Webhook notification sent successfully.");
  } catch (error) {
    console.error("Error sending webhook notification:", error);
  }
};
