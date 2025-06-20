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


/**
 * Normalise a path so it *always* starts with a single “/”
 * and has no trailing “/”. Example:
 *   ""  → "/"
 *   "/foo/" → "/foo"
 *   "bar/baz" → "/bar/baz"
 */
const normalisePath = (value = "") =>
  `/${value.replace(/^\/+|\/+$/g, "")}`;

/**
 * Search the sitemap for a matching entry and return its CMS slug
 * (or `undefined` if nothing matches).
 */
function findCmsSlug(
  browserSlug: string,
  sitemap: SitemapQueryResult[],
): string | undefined {
  const target = normalisePath(browserSlug);

  const match = sitemap.find(
    (p) =>
      normalisePath(p.superAlias) === target ||
      normalisePath(p.url) === target,
  );

  return match?.slug as string | undefined;
}

/**
 * Convert a browser URL slug into its CMS-side URL, plus the
 * `LanguageSite` it belongs to.
 */
export async function browserUrlToCmsUrlConverter(
  browserSlug: string,
): Promise<BrowserUrl> {
  log.info(
    `${logPrefix()}[browserUrlToCmsUrlConverter][P1][${browserSlug}]`,
  );

  const languageSite: LanguageSite = await GetLanguageSiteByURL(
    browserSlug,
  );
  log.info(
    `${logPrefix()}[browserUrlToCmsUrlConverter][P2][${browserSlug}] languageSite = `,
    languageSite,
  );

  const sitemap = await collectSitemapNavigationStructure(
    "sitemap",
    `pageDataProvider.browserUrlToCmsUrlConverter(${browserSlug})`,
  );
  log.info(
    `${logPrefix()}[browserUrlToCmsUrlConverter][P3][${browserSlug}] sitemap = `,
    sitemap,
  );

  const cmsSlug = findCmsSlug(browserSlug, sitemap);

  if (!cmsSlug) {
    log.info(
      `${logPrefix()}[browserUrlToCmsUrlConverter][P4][${browserSlug}] No sitemap match`,
    );
  }

  return { cmsUrl: cmsSlug ?? browserSlug, languageSite };
}

export async function collectDynamicPageData(pageConstruction: PageDefinition): Promise<PageBlueprint | null> {
  log.trace(`${logPrefix()} collectDynamicPageData > slug > `, pageConstruction.preliminarySlug);
  const { cmsUrl, languageSite }: BrowserUrl = await browserUrlToCmsUrlConverter(pageConstruction.preliminarySlug as string);
  
  
  pageConstruction.pageIdentifier.backEndSlug = cmsUrl;
  pageConstruction.languageSite = languageSite; // Override the default language site with the one found in the URL
  pageConstruction.source += ` > pageDataProvider.collectDynamicPageData(${cmsUrl})`;

  log.trace(`${logPrefix()} collectDynamicPageData > pageConstruction.pageIdentifier.backEndSlug > `, cmsUrl);

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