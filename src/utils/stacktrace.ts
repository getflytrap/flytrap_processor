import { basename } from "path";
import {
  extractSourceStackFrameDetails,
  fetchSourceMap,
  mapStackTrace,
  mapCodeContexts,
} from "./sourcemaps";
import { ErrorData, CodeContext } from "./types";

/**
 * Extracts file name, line number, and column number from a stack trace.
 *
 * @param stack - The error stack trace.
 * @param platform - The platform where the error occurred (e.g., Flask, Express.js).
 * @returns An object containing `fileName`, `lineNumber`, and `colNumber`.
 */
export const extractStackFrameDetails = (
  stack: string | undefined,
  platform: string,
): {
  fileName: string | null;
  lineNumber: number | null;
  colNumber: number | null;
} => {
  if (stack) {
    let regex;

    if (platform === "Flask") {
      regex = /^\s*File\s+"([^"]+)",\s+line\s+(\d+)(?:,\s+in\s+(.+))?/;
      const stackLines = stack.split("\n").reverse();
      const match = stackLines[3].match(regex);

      if (match) {
        const fileName = basename(match[1]);
        const line = parseInt(match[2], 10);
        return {
          fileName,
          lineNumber: line,
          colNumber: null,
        };
      }
    } else if (platform === "Express.js") {
      regex = /(\S+?):(\d+):(\d+)/;
      const match = stack.match(regex);

      if (match) {
        const [, fullPath, line, col] = match;
        const fileName = basename(fullPath);
        return {
          fileName,
          lineNumber: parseInt(line, 10),
          colNumber: parseInt(col, 10),
        };
      }
    } else {
      regex = /(?:at\s+)?(?:.*?\s+)?(?:\()?(.+?):(\d+):(\d+)/;
      const match = stack.match(regex);

      if (match) {
        const [, fullPath, line, col] = match;
        const fileName = basename(fullPath);

        return {
          fileName,
          lineNumber: parseInt(line, 10),
          colNumber: parseInt(col, 10),
        };
      }
    }
  }

  return { fileName: null, lineNumber: null, colNumber: null };
};

/**
 * Processes the stack trace for an error, attempts to map minified details to original source details,
 * and extracts code contexts if a source map is available.
 *
 * @param data - The error data containing stack trace and other details.
 * @param projectPlatform - The platform (e.g., Flask, Express.js) of the project.
 * @returns A promise that resolves to an object containing updated file, line, column, stack trace, and code contexts.
 */
export const processStackTrace = async (
  data: ErrorData,
  projectPlatform: string,
): Promise<{
  fileName: string | null;
  lineNumber: number | null;
  colNumber: number | null;
  updatedStack: string | undefined;
  updatedContexts: CodeContext[] | undefined;
}> => {
  let fileName: string | null = null;
  let lineNumber: number | null = null;
  let colNumber: number | null = null;
  let updatedStack: string | undefined = undefined;
  let updatedContexts: CodeContext[] | undefined;

  if (data.error.stack?.includes(".min.js")) {
    const minifiedDetails = extractStackFrameDetails(
      data.error.stack,
      projectPlatform,
    );
    fileName = minifiedDetails.fileName;
    lineNumber = minifiedDetails.lineNumber;
    colNumber = minifiedDetails.colNumber;

    if (fileName) {
      const mapFileName = `${basename(fileName)}.map`;
      const sourceMapContent = await fetchSourceMap(
        data.project_id,
        mapFileName,
      );

      if (sourceMapContent) {
        updatedStack = await mapStackTrace(data.error.stack, sourceMapContent);
        const unminifiedDetails = await extractSourceStackFrameDetails(
          sourceMapContent,
          lineNumber ?? 0,
          colNumber ?? 0,
        );
        fileName = unminifiedDetails.fileName;
        lineNumber = unminifiedDetails.lineNumber;
        colNumber = unminifiedDetails.colNumber;

        updatedContexts = await mapCodeContexts(updatedStack, sourceMapContent);
      } else {
        updatedStack = data.error.stack;
        updatedContexts = data.codeContexts;
      }
    }
  } else {
    const unminifiedDetails = extractStackFrameDetails(
      data.error.stack,
      projectPlatform,
    );
    fileName = unminifiedDetails.fileName;
    lineNumber = unminifiedDetails.lineNumber;
    colNumber = unminifiedDetails.colNumber;
    updatedStack = data.error.stack;
    updatedContexts = data.codeContexts;
  }

  return { fileName, lineNumber, colNumber, updatedStack, updatedContexts };
};
