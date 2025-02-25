import { LanguageSite } from "../interfaces/LanguageSite";
import { PageIdentifier } from "../interfaces/PageIdentifier";
import { GetLanguageSiteByURL } from "./languageService";
import { getLogger } from "./logging/LogConfig";
import { GetSite } from "./siteContextService";
import { processURLForNavigation } from "./urlService";
import { Metadata } from "next";
import { processURLForNavigationServer } from "./urlServiceServer";
import { processUrlEndWith } from "../utils/filterTools";
import { logPrefix } from "../utils/logPrefix";
import { PageDefinition } from "../interfaces/PageDefinition";
import { browserUrlToCmsUrlConverter } from "./data/pageDataProvider";
import { getSeoData } from "./data/commonData";
import { AlternateUrl, AlternateUrlResponse, OGImage, SeoItems } from "../interfaces/SeoServices";
import { BrowserUrl } from "../interfaces/BrowserUrl";

const log = getLogger("headless.seoRendererServiceTSX");

function titleExtractor(siteName: string, languageSite: LanguageSite, slug: string, seoItems: SeoItems) {
  const siteNameCountry = `${siteName} ${languageSite?.countryCode?.toUpperCase()}`;
  let pageTitle = "";
  if (seoItems?.seoTitle) {
    pageTitle = seoItems.seoTitle;
  } else if (seoItems?.name) {
    pageTitle = seoItems.name;
  }
  const title = `${pageTitle} - ${siteNameCountry}`;
  return { title, siteNameCountry };
}

export async function getAlternateURLs(alternateUrls: AlternateUrl[] = [], friendlyUrl: string, currentLanguageSite: LanguageSite) {
  const response: AlternateUrlResponse = { "x-default": processUrlEndWith(`${process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN}${friendlyUrl}`) };

  const key1 = `en-${currentLanguageSite?.countryCode}`.toLowerCase() as `${Lowercase<string>}-${string}`;
  response[key1] = processUrlEndWith(`${process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN}${friendlyUrl}`);

  // Handle case when alternateUrls is null, undefined or empty
  if (!alternateUrls || alternateUrls.length === 0) {
    return response;
  }

  await Promise.all(
    alternateUrls.map(async (alternateUrl) => {
      try {
        const url = alternateUrl.url;

        if (alternateUrl.type === "CONTENT") {
          const languageSite = await GetLanguageSiteByURL(url);
          let friendlyPageUrl = await processURLForNavigationServer(url, languageSite);
          friendlyPageUrl = (friendlyPageUrl as string).replace("//", "/");
          const fullUrl = `${process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN}${friendlyPageUrl}`;

          const key2 = `en-${languageSite?.countryCode}`.toLowerCase() as `${Lowercase<string>}-${string}`;
          response[key2] = processUrlEndWith(fullUrl);
        }
        // else {
        //   let friendlyPageUrl = await processURLForNavigationServer(slug, currentLanguageSite);
        //   response[`en-${currentLanguageSite?.countryCode}`] = friendlyPageUrl;
        // }
      } catch (error) {
        console.error("Failed to process alternateUrl: ", alternateUrl, " Error: ", error);
        return null;
      }
    }),
  );

  return response;
}

export async function generateMetadataJSON(slug: string, seoItems: SeoItems, languageSite: LanguageSite): Promise<Metadata> {
  let friendlyUrl;
  slug = String(slug).startsWith("/") ? slug : "/" + slug;
  friendlyUrl = await processURLForNavigationServer(slug, languageSite);
  friendlyUrl = String(friendlyUrl).startsWith("/") ? friendlyUrl : "/" + friendlyUrl;

  log.trace(`${logPrefix()} -- Generating metadata for ${slug} with friendlyUrl >> ${friendlyUrl}`);

  // Construct the canonical URL
  let canonicalURL;
  if (seoItems?.canonicalURLContentItem?.url) {
    canonicalURL = `${process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN}${processURLForNavigation(
      seoItems.canonicalURLContentItem.url,
      languageSite,
    )}`;
  } else if (seoItems?.canonicalURLAbsolute) {
    canonicalURL = seoItems.canonicalURLAbsolute;
  } else {
    canonicalURL = `${process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN}${friendlyUrl}`;
  }

  log.trace(`${logPrefix()} -- [${slug}] >> canonicalURL >> ${canonicalURL}`);

  // Check if page should be no indexed
  let pageIndex = true;
  if (seoItems?.noIndexPage && seoItems?.noIndexPage == true) {
    pageIndex = false;
  }

  //fomating Alternate URLs
  const alternateUrls: AlternateUrlResponse = await getAlternateURLs(seoItems?.alternateMultiURLs, friendlyUrl as string, languageSite);

  const { title, siteNameCountry } = titleExtractor(GetSite().name, languageSite, slug, seoItems);
  const ogDefaultImage = process.env.NEXT_PUBLIC_CMS_MAIN_DOMAIN + "/showcase/logo.png";
  const ogImageUrl = seoItems?.ogImage?.url ? seoItems.ogImage.url : ogDefaultImage;
  const ogDescription = seoItems?.ogDescription ? seoItems.ogDescription : seoItems?.seoDescription ? seoItems?.seoDescription : title;

  log.trace(`${logPrefix()} -- [${slug}] >> title >> ${title}`);
  log.trace(`${logPrefix()} -- [${slug}] >> ogDescription >> ${ogDescription}`);
  log.trace(`${logPrefix()} -- [${slug}] >> ogImageUrl >> ${ogImageUrl}`);

  const ogImage: OGImage = {
    url: ogImageUrl,
    width: 200,
    height: 200,
  };

  return {
    title: title,
    description: `${seoItems?.seoDescription}`,
    openGraph: {
      title: title,
      description: ogDescription,
      images: ogImage,
      url: canonicalURL,
      siteName: siteNameCountry,
      type: "website",
    },
    alternates: {
      canonical: canonicalURL,
      languages: alternateUrls,
    },
    ...(!pageIndex ? { robots: { index: pageIndex } } : {}),
    // jsonLd: seoItems?.structuredData ? JSON.stringify(seoItems.structuredData) : undefined
  };
}

export async function seoExtractor(slug: string, pageIdentifier: PageIdentifier): Promise<Metadata> {
  const { cmsUrl, languageSite }: BrowserUrl = await browserUrlToCmsUrlConverter(slug);
  // const languageSite = await GetLanguageSiteByURL(slug);
  // const site = await GetSiteConfig();
  log.trace(`${logPrefix()} -- Extracting SEO for ${slug} with languageSite >> ${languageSite?.countryCode}`);

  const pageConstruction: PageDefinition = {
    languageSite,
    pageIdentifier: pageIdentifier,
    isDynamic: undefined,
    preliminarySlug: slug,
    source: `seoExtractor(${slug})`,
  };

  log.trace(`${logPrefix()} -- Extracting SEO for ${slug} ${cmsUrl} with pageConstruction`);
  pageConstruction.pageIdentifier.backEndSlug = cmsUrl;

  const seoItems = await getSeoData(pageConstruction);
  return await generateMetadataJSON(slug, seoItems, languageSite);
}

export async function staticPageSeoExtractor(slug: string, seoItems: SeoItems): Promise<Metadata> {
  const languageSite = await GetLanguageSiteByURL(slug);
  // const site = await GetSiteConfig();
  return await generateMetadataJSON(slug, seoItems, languageSite);
}
