/**
 * Cleans and joins a slug array into a string.
 * @param slugArray - Array of slug parts.
 * @returns Cleaned slug string.
 */
export const cleanSlug = (slugArray: string[] | undefined): string => {
  if (!slugArray || slugArray.length === 0) return '/';
  return slugArray.join('/');
};

/**
 * Determines if a slug should be ignored based on specific patterns.
 * @param slug - Slug string.
 * @returns Whether the slug should be ignored.
 */
export const isIgnoredSlug = (slug: string): boolean => {
  const ignoredPatterns = ['favicon.ico', '.js', 'slick-theme.min.css.map'];
  return ignoredPatterns.some((pattern) => slug.includes(pattern)) || !slug || slug === 'undefined';
};
