export const checkPrefetchAvailability = (url?: string) => {
  // Get the environment variable
  const envVariable = process.env.NEXT_PUBLIC_RESERVED_PREFETCH_WORDS;
  
  // If the environment variable is not set, we should return true
  if (!envVariable) return true;
  
  // Convert the environment variable into an array of words
  const words = envVariable.split('|');
  
  // If the link or the url of the link is not provided, return true
  if (typeof(url) === 'undefined') return true;

  // Check if the url includes any of the words
  for (const word of words) {
      if (url.includes(word)) {
          return false;
      }
  }
  
  // If none of the words were found in the url, return true
  return true;
};