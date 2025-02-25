import * as cheerio from 'cheerio';

export function parseHeadingTags(html: string): string {
  const $ = cheerio.load(html);
  const tagPriority = ["h1", "h2", "h3", "h4", "h5", "h6", "strong"];

  for (let i = 0; i < tagPriority.length; i++) {
    const tag = tagPriority[i];
    const element = $(tag).first();
    if (element && element.text()) {
      return element.text();
    }
  }

  return "";
}
