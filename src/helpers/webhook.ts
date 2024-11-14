import axios from 'axios';

const url = process.env.WEBHOOK_ENDPOINT;

export const sendWebhookNotification = async (projectId: string) => {
  if (url) {
    axios.post(url, { message: 'New issue', project_id: projectId });
  }
}