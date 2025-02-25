import { LanguageSite } from "../../interfaces/LanguageSite";
import { filterAndUpdateTags, removeHeadBodyTag } from "./filterAndUpdateClass";
import { processURLForNavigationServer } from "../../services/urlServiceServer";
import * as cheerio from "cheerio";

export async function processAnchorTagsServer($: cheerio.CheerioAPI, languageSite: LanguageSite) {
  const anchorElements = Array.from($("a"));

  await Promise.all(
    anchorElements.map(async (element) => {
      const href = $(element).attr("href");
      if (href) {
        const processedHref = await processURLForNavigationServer(href, languageSite);
        $(element).attr("href", processedHref as string);
        $(element).addClass("underline text-my-yellow font-medium pb-2 inline-block");
      }
    }),
  );
}

export async function filterAndUpdateHrefServer(html: string, languageSite: LanguageSite) {
  if (!html && typeof html !== "string") {
    return "";
  }

  const $ = cheerio.load(html);

  // Process anchor tags' href attribute
  await processAnchorTagsServer($, languageSite);

  return $.html();
}

export async function filterAndUpdateClassServer(html: string, languageSite: LanguageSite) {
  const passOne = filterAndUpdateTags(html);
  const passTwo = await filterAndUpdateHrefServer(passOne, languageSite);
  const finalHtml = removeHeadBodyTag(passTwo);
  return finalHtml;
}
