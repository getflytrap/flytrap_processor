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
    const response = await handler(event);
    console.log('Response: ', response);
    res.status(response.statusCode).send(response.body);
  } catch (e) {
    console.error('Error: ', e);
    res.status(500).send({ message: 'Error processing the request' });
  }
});

app.listen(port, () => console.log('Mock lambda running on port', port));