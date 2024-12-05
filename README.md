![Organization Logo](https://raw.githubusercontent.com/getflytrap/.github/main/profile/flytrap_logo.png)

# Flytrap Processor
The Flytrap Processor is the serverless backend component responsible for processing error and rejection payloads sent from the Flytrap SDK. It runs as an AWS Lambda function, ensuring efficient and scalable handling of error data, including stack trace parsing and source map integration.

This repository contains the Lambda function code and allows you to mock its behavior locally using a simple Express server. If you want to use Flytrap in a production environment, refer to the [Flytrap Installation Guide](https://getflytrap.github.io/) for complete setup instructions.

## 🛠️ What Does It Do?
The Flytrap Processor:

- **Processes error and rejection events:** Extracts information from payloads and parses stack traces.
- **Supports source maps:** Maps minified stack traces to original code locations for better debugging.
- **Stores data:** Writes processed error data to a database for analysis and dashboard display.
- **Scales effortlessly:** Runs as a serverless function on AWS Lambda.

## 🚀 Running Locally
To test the Flytrap Processor locally, you can mock the API Gateway using an Express server.

### Prerequisites
- Node.js installed on your machine.
- Inline source maps for your minified code (if testing minified stack trace resolution).

### Steps
1. Clone the repository:

    ```bash
    git clone https://github.com/getflytrap/flytrap-processor.git
    cd flytrap-processor
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the mock Express server: Create a new file `mockGateway.ts` with the following code:

    ```javascript
    import express from 'express';
    import { handler } from "./src/processor";
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
      };
      try {
        await handler(event);
        console.log('Successfully processed error.');
        res.status(200).send({ message: 'Error successfully processed '});
      } catch (e) {
        console.error('Error: ', e);
        res.status(500).send({ message: 'Error processing the request' });
      }
    });

    app.post('/api/rejections', async (req, res) => {
      const event = { 
        Records: [
          { 
            body: JSON.stringify(req.body),
          },
        ]
      };
      try {
        await handler(event);
        console.log('Successfully processed rejection.');
        res.status(200).send({ message: 'Rejection successfully processed '});
      } catch (e) {
        console.error('Error: ', e);
        res.status(500).send({ message: 'Error processing the request' });
      }
    });

    app.listen(port, () => console.log('Mock server running on port', port));
    ```

4. Run the mock server:

    ```bash
    npm run dev
    ```

    The server will start on http://localhost:3000 and mimic the API Gateway.

## 🖥️ End-to-End Testing with the Flytrap Architecture
To test the Flytrap Processor locally as part of the complete Flytrap architecture, integrate one of the Flytrap SDKs into an application where you want to collect error data. Visit the relevant SDK repository for installation instructions:

[Flytrap React SDK](https://github.com/getflytrap/flytrap_react)  
[Flytrap Vanilla JavaScript SDK](https://github.com/getflytrap/flytrap_javascript)  
[Flytrap Express SDK](https://github.com/getflytrap/flytrap_express)  
[Flytrap Flask SDK](https://github.com/getflytrap/flytrap_flask)  

### Prerequisite: Install the Flytrap API
Before testing the Flytrap Processor, ensure that the [Flytrap API](https://github.com/getflytrap/flytrap_api) is installed and running. The API handles project, user, and issue management. Follow the instructions in the [Flytrap API Repository](https://github.com/getflytrap/flytrap_api) to set it up.

### Generating Errors
Trigger errors or promise rejections in your application integrated with the Flytrap SDK.
The SDK will send error payloads to the mock server (e.g., `http://localhost:3000/api/errors` or `/api/rejections`).

### Verifying Processing
Check the logs in the mock server to confirm that errors are being processed successfully by the Flytrap Processor.
Open the [Flytrap Dashboard](https://github.com/getflytrap/flytrap_ui) to view processed error data.

## 🗺️ Testing Source Maps
To test the source maps feature:

1. Create a directory for source maps: Inside the src directory, create a folder called `sourcemaps`.
2. Create a subdirectory named after your project ID: `src/sourcemaps/<project-id>`.
3. Place your app's inline source map in this subdirectory. The source map file name must match the minified file name with the `.map` extension. Example: `src/sourcemaps/<project-id>/app.min.js.map``
4. Trigger Errors in Your Application: The processor will save the error data into the database and perform any necessary processing or unminifying to make debugging easier.

## 🔍 Notes
- **Event Structure:** The processor expects error and rejection payloads to be formatted as SQS events with records containing the payload in the body field.
- **Mock Environment:** Running locally is ideal for debugging and developing new features before deploying to AWS.

For questions or issues, feel free to open an issue in this repository or contact the Flytrap team. 🚀