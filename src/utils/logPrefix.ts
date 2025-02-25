
// Helper function to extract metadata from stack trace
const extractMetadata = (stackLine: string) => {
  const regex =
    /\s*at\s(?:(?<fnName>\S+)\s)?\(?(.+?):(?<line>\d+):(?<col>\d+)\)?/;
  const match = stackLine.match(regex);

  return {
    fnName: match?.groups?.fnName ? `[${match.groups.fnName}]` : '',
    file: match?.[2]?.split('/').pop() || 'unknown-file',
    line: match?.groups?.line || 'unknown-line',
  };
};

export const logPrefix = (): string => {
  // Capture the stack trace by creating an error object
  const stack = new Error().stack?.split('\n') || [];

  // Adjust index to get caller's stack trace (3rd line usually contains the caller info)
  const callerLine = stack[2] || ''; 

  const metadata = extractMetadata(callerLine);

  return `[${metadata.file}:${metadata.line}]${metadata.fnName} >`;
};

