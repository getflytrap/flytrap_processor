import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SourceMapConsumer } from "source-map";
import { extractCodeContext } from "./context";
import { streamToString } from "./stream";
import { CodeContext } from "./types";

// * Development
// import { readFileSync } from 'fs';
// import { join } from 'path';
// import dotenv from 'dotenv';
// dotenv.config();

const s3 = new S3Client({
  region: process.env.REGION,
});

/**
 * Fetches a source map from an S3 bucket for a given project and file name.
 *
 * @param projectUuid - The unique identifier for the project.
 * @param fileName - The name of the source map file.
 * @returns A promise that resolves to the source map content or null if not found.
 */
export const fetchSourceMap = async (projectUuid: string, fileName: string) => {
  const bucketName = process.env.S3_BUCKET_NAME as string;
  const key = `${projectUuid}/${fileName}`;

  try {
    // * Development
    // const filePath = join(__dirname, '..', 'sourcemaps', projectUuid, fileName);
    // const sourceMapContent = readFileSync(filePath, 'utf-8');
    // return sourceMapContent;

    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3.send(command);

    if (response.Body) {
      const content = await streamToString(
        response.Body as NodeJS.ReadableStream,
      );
      return content;
    } else {
      console.error(`No data returned from S3 for key: ${key}`);
      return null;
    }
  } catch (e) {
    console.error(`Error fetching source map from S3: ${e}`);
    return null;
  }
};

/**
 * Maps stack trace entries to corresponding code contexts using a source map.
 *
 * @param stackTrace - The stack trace to map.
 * @param sourceMapContent - The source map content for mapping.
 * @returns A promise that resolves to an array of code contexts.
 */
export const mapCodeContexts = async (
  stackTrace: string,
  sourceMapContent: string,
): Promise<CodeContext[]> => {
  const consumer = await new SourceMapConsumer(sourceMapContent);
  const codeContexts: CodeContext[] = [];

  const stackFrames = stackTrace.split("\n");
  for (const frame of stackFrames) {
    const match = /at\s+.+\((.+):(\d+):(\d+)\)/.exec(frame);
    if (match) {
      const [, sourceFile, lineStr, columnStr] = match;
      const line = parseInt(lineStr, 10);
      const column = parseInt(columnStr, 10);

      const sourceContent = consumer.sourceContentFor(sourceFile, true);

      if (sourceContent) {
        const context = extractCodeContext(sourceContent, line);

        codeContexts.push({
          file: sourceFile,
          line,
          column,
          context,
        });
      } else {
        console.warn(`Source content not found for file: ${sourceFile}`);
      }
    }
  }

  consumer.destroy();
  return codeContexts;
};

/**
 * Maps a minified stack trace to its original source positions using a source map.
 *
 * @param stackTrace - The stack trace to map.
 * @param sourceMapContent - The source map content for mapping.
 * @returns A promise that resolves to the mapped stack trace.
 */
export const mapStackTrace = async (
  stackTrace: string,
  sourceMapContent: string,
) => {
  const consumer = await new SourceMapConsumer(sourceMapContent);
  const mappedStack = [];

  const stackFrames = stackTrace.split("\n");
  for (const frame of stackFrames) {
    const match = /at\s+.+\((.+):(\d+):(\d+)\)/.exec(frame);
    if (match) {
      const [, , lineNumber, columnNumber] = match;

      const original = consumer.originalPositionFor({
        line: parseInt(lineNumber, 10),
        column: parseInt(columnNumber, 10),
      });

      if (original.source) {
        mappedStack.push(
          `at ${original.name || "anonymous"} (${original.source}:${original.line}:${original.column})`,
        );
      } else {
        mappedStack.push(frame);
      }
    } else {
      mappedStack.push(frame);
    }
  }

  consumer.destroy();
  return mappedStack.join("\n");
};

/**
 * Extracts original stack frame details from a source map.
 *
 * @param sourceMapContent - The source map content.
 * @param line - The minified source line number.
 * @param column - The minified source column number.
 * @returns A promise that resolves to the original stack frame details.
 */
export const extractSourceStackFrameDetails = async (
  sourceMapContent: string,
  line: number,
  column: number,
) => {
  const consumer = await new SourceMapConsumer(sourceMapContent);

  try {
    const original = consumer.originalPositionFor({
      line,
      column,
    });

    return {
      fileName: original.source || null,
      lineNumber: original.line || null,
      colNumber: original.column || null,
    };
  } finally {
    consumer.destroy();
  }
};
