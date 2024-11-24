/**
 * Converts a readable stream into a string.
 *
 * @param stream - A readable stream (either a web `ReadableStream` or Node.js `ReadableStream`).
 * @returns A promise that resolves to the concatenated string content of the stream.
 */

export const streamToString = async (
  stream: ReadableStream | NodeJS.ReadableStream,
): Promise<string> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};
