// --------------------------------------------------
// REDUNDANT CODE NOTICE:
// This file is part of the old page building pipeline.
// Now replaced by pageDataBuilderService.ts
// Keep code intact for backward compatibility. DO NOT EDIT.
// --------------------------------------------------

import { log } from "./graphqlDataService";
import { PageBlueprint, PageDefinition } from "../../interfaces/PageDefinition";
import { PageIdentifier } from "../../interfaces/PageIdentifier";
import { GetSite } from "../siteContextService";
import { collectAllPageData } from "./pageLayoutDataCollector";
import { logPrefix } from "../../utils/logPrefix";
import { GetPageIdentifier } from "../cmsContextService";
import { notFound } from "next/navigation";

/**
 * Retrieves and configures the page identifier with appropriate page variant.
 * @param pageConstruction - The definition of the page.
 * @returns A Promise resolving to the updated PageIdentifier.
 */
async function getPageIdentifierWithVariant(pageConstruction: PageDefinition): Promise<PageIdentifier> {
  const pageIdentifier = await GetPageIdentifier(pageConstruction.pageIdentifier.pageVariant);

  if (!pageIdentifier) {
    log.error(`${logPrefix()}[buildPageData] >>> Page identifier is null`);
    notFound();
  }

  if (pageConstruction.isDynamic && pageConstruction.preliminarySlug) {
      pageIdentifier.frontEndSlug = pageConstruction.preliminarySlug;
      pageIdentifier.backEndSlug = pageConstruction.pageIdentifier.backEndSlug;
  }

  return pageIdentifier;
}

/**
 * Main function to build page data based on the provided page definition.
 * @param pageConstruction - The definition of the page.
 * @returns A Promise resolving to the page blueprint.
 */
export async function buildPageData(pageConstruction: PageDefinition): Promise<PageBlueprint | null> {
  const site = GetSite();

  if (typeof site === "undefined") {
    throw new Error(`${logPrefix()} buildPageData -  Site is not defined`);
  }

  if (GetSite().shouldAbortPageDataCollection()) {
    log.trace(`${logPrefix()}[buildPageData][${pageConstruction.preliminarySlug}] > no page data is needed for this site`);
    return null;
  }

  //set page identifier with variant for page construction again
  pageConstruction.pageIdentifier = await getPageIdentifierWithVariant(pageConstruction);

  log.trace(`${logPrefix()}[buildPageData][${pageConstruction.preliminarySlug}] > cmsType >  `, pageConstruction.pageIdentifier?.cmsType);
  log.trace(`${logPrefix()}[buildPageData][${pageConstruction.preliminarySlug}] > pageVariant >  `, pageConstruction.pageIdentifier?.pageVariant);
  log.trace(`${logPrefix()}[buildPageData][${pageConstruction.preliminarySlug}] > isDynamic > ${pageConstruction.isDynamic}`);

  return await collectAllPageData(pageConstruction);
}
