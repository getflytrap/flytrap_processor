/**
 * Extracts a portion of the source code around a specific line.
 *
 * @param sourceContent - The full source code as a string.
 * @param line - The target line number (1-based) for context extraction.
 * @param linesBefore - The number of lines to include before the target line. Default is 5.
 * @param linesAfter - The number of lines to include after the target line. Default is 5.
 * @returns The extracted code context as a string.
 */

export const extractCodeContext = (
  sourceContent: string,
  line: number,
  linesBefore: number = 5,
  linesAfter: number = 5,
): string => {
  const sourceLines = sourceContent.split("\n");
  const start = Math.max(0, line - linesBefore - 1);
  const end = Math.min(sourceLines.length, line + linesAfter);

  return sourceLines.slice(start, end).join("\n");
};
