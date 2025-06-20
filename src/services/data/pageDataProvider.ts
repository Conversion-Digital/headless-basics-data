// --------------------------------------------------
// REDUNDANT CODE NOTICE:
// This file is part of the old page building pipeline.
// Now replaced by pageDataBuilderService.ts
// Keep code intact for backward compatibility. DO NOT EDIT.
// --------------------------------------------------

import { LanguageSite } from "../../interfaces/LanguageSite";
import { getPageTypeBySlug } from "../model/getPageTypeBySlug";
import { buildPageData } from "./buildPageData";
import { GetLanguageSiteByURL } from "../languageService";
import { getLogger } from "../logging/LogConfig";
import { collectSitemapNavigationStructure } from "./collectSitemapNavigationStructure";
import { notFound } from "next/navigation";
import { logPrefix } from "../../utils";
import { PageBlueprint, PageDefinition } from "../../interfaces/PageDefinition";
import { SitemapQueryResult } from "../../interfaces/DynamicFileModuleDetails";
import { BrowserUrl } from "../../interfaces/BrowserUrl";

const log = getLogger("headless.pageDataProvider");


// This function accepts the path segment of the Browser URL.
// It will return the correct slug for the CMS and the language site.
// browserSlug:  Is the browser URL not the CMS Url
// Please Read: https://expiadev.atlassian.net/wiki/spaces/HP/pages/3692363790/Language+Sites+and+URL+Construction
export async function browserUrlToCmsUrlConverter(browserSlug: string) : Promise<BrowserUrl> {

  log.info(`${logPrefix()}[browserUrlToCmsUrlConverter][Point1][${browserSlug}]`);
  const languageSite: LanguageSite = await GetLanguageSiteByURL(browserSlug);
  log.info(`${logPrefix()}[browserUrlToCmsUrlConverter][Point2][${browserSlug}] languageSite = `, languageSite);
  const sitemapStructure = await collectSitemapNavigationStructure("sitemap", `pageDataProvider.browserUrlToCmsUrlConverter(${browserSlug})`);
  log.info(`${logPrefix()}[browserUrlToCmsUrlConverter][Point3][${browserSlug}] sitemapStructure = `, sitemapStructure);
  const match = sitemapStructure.find(
    (page: SitemapQueryResult) => page.superAlias === "/" + browserSlug || page.url === "/" + browserSlug
  );

  if (typeof (match) !== 'undefined') { // We have a super alias match
    browserSlug = match.slug as string;
  }else{
    log.info(`${logPrefix()}[browserUrlToCmsUrlConverter][Point4][${browserSlug}] No match found in sitemapStructure for slug: ${browserSlug}`);
  }
  return { cmsUrl: browserSlug, languageSite };
}

export async function collectDynamicPageData(pageConstruction: PageDefinition): Promise<PageBlueprint | null> {
  log.trace(`${logPrefix()} collectDynamicPageData > slug > `, pageConstruction.preliminarySlug);
  const { cmsUrl, languageSite }: BrowserUrl = await browserUrlToCmsUrlConverter(pageConstruction.preliminarySlug as string);
  
  
  pageConstruction.pageIdentifier.backEndSlug = cmsUrl;
  pageConstruction.languageSite = languageSite; // Override the default language site with the one found in the URL
  pageConstruction.source += ` > pageDataProvider.collectDynamicPageData(${cmsUrl})`;

  log.info(`${logPrefix()} collectDynamicPageData > pageConstruction.pageIdentifier.backEndSlug > `, cmsUrl);

  const pageTypeResult = (await getPageTypeBySlug(pageConstruction));

  // Handle 404 if no page type is found
  if(!pageTypeResult || !pageTypeResult.contentTypeAlias){
    log.error("collectDynamicPageData > pageTypeResult or pageTypeResult.contentTypeAlias is undefined >> ", pageConstruction);
    notFound();
  }

  const pageType = pageTypeResult?.contentTypeAlias;
  pageConstruction.pageIdentifier.pageVariant = pageType;
  log.trace(`${logPrefix()}[collectDynamicPageData][${cmsUrl}][pageType] > `, pageType);

  const blueprint: PageBlueprint | null = await buildPageData(pageConstruction);

  log.trace(`${logPrefix()}[collectDynamicPageData][${cmsUrl}][pageData] > recieved a result`);
  return blueprint;
}