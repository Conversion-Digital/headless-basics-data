import { CheerioAPI, load } from "cheerio";

import { LanguageSite } from "../../interfaces/LanguageSite";
import { processURLForNavigation } from "../../services/urlService";

// Original function with the anchor tags processing removed
export function filterAndUpdateTags(html: string) {
  if (!html && typeof html !== "string") {
    return "";
  }

  const $ = load(html);

  for (let i = 1; i <= 5; i++) {
    if (i == 2) {
      $(`h${i}`).addClass(`text-center text-my-brown-grey font-urbanist font-800 text-3xl leading-12 md:text-h3 md:leading-h3 mb-14`);
    } else {
      $(`h${i}`).addClass(`text-my-blue pb-2 text-h${i}`);
    }
  }

  // Modify h4 tags
  $("h4").addClass("font-extrabold");

  // Modify h5 tags
  $("h5").addClass("font-extrabold");

  // Add 'list-disc' class to each ul tag
  $("ul").addClass("list-none");

  $("ul li").addClass(
    "relative pl-3.5 before:block before:absolute before:left-0 before:top-3 before:rounded-full before:w-1 before:h-1 before:bg-black text-my-blue",
  );

  // Add 'list-decimal' class to each ol tag
  $("ol").addClass("list-decimal pl-4");

  $("ol li").addClass("text-my-blue mb-2");

  // Add 'list-inside' class to ul li and ol li tags with text-align property
  $("ul li, ol li").each((index, element) => {
    const style = $(element).attr("style");
    if (style && style.includes("text-align")) {
      $(element).addClass("list-inside");
    }
  });

  // Add 'my-4' class to each p tag
  $("p").each(function () {
    $(this).addClass("my-6 text-my-black text-base");
    $(this).find("strong").addClass("font-extrabold");
    if ($(this).find("img").length > 0) {
      if ($(this).css("text-align") === "center") {
        $(this).addClass("flex justify-center");
        $(this).css("text-align", "");
      } else if ($(this).css("text-align") === "right") {
        $(this).addClass("flex justify-end");
        $(this).css("text-align", "");
      }
    }
  });

  return $.html();
}


// New function for processing anchor tags
function processAnchorTags($: CheerioAPI, languageSite: LanguageSite) {
  $("a").each(function (this) {
    const href = $(this).attr("href");
    if (href) {
      $(this).attr("href", processURLForNavigation(href, languageSite));
      $(this).addClass("underline text-my-yellow font-medium pb-2");
    }
  });
}

export function filterAndUpdateHref(html: string, languageSite: LanguageSite) {
  if (!html && typeof html !== "string") {
    return "";
  }

  const $ = load(html);

  // Process anchor tags' href attribute
  processAnchorTags($, languageSite);

  return $.html();
}

export function formatHeading(heading: string): string | null {
  if (!heading || typeof heading !== "string") {
    return "";
  }

  const $ = load(heading);
  $("br").each(function () {
    $(this).addClass("hidden md:block");
  });

  return $("body").html();
}

export function removeHeadBodyTag(htmlString: string) {
  let formattedHtmlString = htmlString.replace(/<head>/gi, "");
  formattedHtmlString = formattedHtmlString.replace(/<\/head>/gi, "");
  formattedHtmlString = formattedHtmlString.replace(/<body>/gi, "");
  formattedHtmlString = formattedHtmlString.replace(/<\/body>/gi, "");
  formattedHtmlString = formattedHtmlString.replace(/<html>/gi, "");
  formattedHtmlString = formattedHtmlString.replace(/<\/html>/gi, "");
  return formattedHtmlString;
}

export function filterAndUpdateClass(html: string, languageSite: LanguageSite) {
  const passOne = filterAndUpdateTags(html);
  const passTwo = filterAndUpdateHref(passOne, languageSite);
  const finalHtml = removeHeadBodyTag(passTwo);
  return finalHtml;
}