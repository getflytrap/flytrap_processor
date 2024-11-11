import express from 'express';
import { handler } from "./processor";
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post('/api/errors', async (req, res) => {
  const event = { 
    Records: [
      { 
        body: JSON.stringify(req.body),
      },
    ]
  }

  try {
    await handler(event);
  } catch (e) {
    console.error('Error projecessing error data: ', e);
  }
});

app.post('/api/rejections', async (req, res) => {
  const event = { 
    Records: [
      { 
        body: JSON.stringify(req.body),
      },
    ]
  }

  try {
    const response = await handler(event);
  } catch (e) {
    console.error('Error processing rejection data: ', e);
  }
});

app.listen(port, () => console.log('Mock lambda running on port', port));