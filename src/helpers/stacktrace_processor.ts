export const extractLineAndColNumbers = (stack: string | undefined) => {
  if (stack) {
    // const regex = /:\d+:\d+/g;
    const regex = /(\S+?):(\d+):(\d+)/;
    const match = stack.match(regex);

    console.log('Match:')
    console.log(match);
  
    if (match) {
      const [, fileName, line, col] = match;
      return {
        fileName,
        lineNumber: parseInt(line, 10),
        colNumber: parseInt(col, 10),
      };
    }
  }

  return { fileName: null, lineNumber: null, colNumber: null };
}