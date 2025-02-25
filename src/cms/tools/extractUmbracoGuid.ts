export function extractUmbracoGuid(udi: string): string | null {
  if (!udi) {
    return null;
  }

  // Regular expression to match the Umbraco GUID pattern
  const guidPattern = /umb:\/\/document\/([a-fA-F0-9]{32})/;

  // Test the input string against the regular expression
  const match = udi.match(guidPattern);

  // If a match is found, return the matched GUID, otherwise return null
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}
