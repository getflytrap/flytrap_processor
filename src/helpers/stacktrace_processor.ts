export const extractLineAndColNumbers = (stack: string | undefined, platform: string) => {
  if (stack) {
    // const regex = /:\d+:\d+/g;
    let regex;
    
    if (platform === 'Flask') {
      regex = /^\s*File\s+"([^"]+)",\s+line\s+(\d+)(?:,\s+in\s+(.+))?/;
      const stackLines = stack.split("\n").reverse(); 
      const match = stackLines[3].match(regex);
      
      if (match) {
        const fileName = match[1];
        const line = parseInt(match[2], 10);
        return {
          fileName,
          lineNumber: line,
          colNumber: null,
        };
      }

    } else if (platform === 'Express.js') {
      regex = /(\S+?):(\d+):(\d+)/;
      const match = stack.match(regex);
    
      if (match) {
        const [, fileName, line, col] = match;
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
        const [, fileName, line, col] = match;
        return {
          fileName,
          lineNumber: parseInt(line, 10),
          colNumber: parseInt(col, 10),
        };
      }
    }
  }

  return { fileName: null, lineNumber: null, colNumber: null };
}