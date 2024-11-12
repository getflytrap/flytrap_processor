import axios from 'axios';

const url = process.env.WEBHOOK_ENDPOINT;

export const sendWebhookNotification = async () => {
  if (url) {
    axios.post(url, { data: 'New error data'});
  }
}