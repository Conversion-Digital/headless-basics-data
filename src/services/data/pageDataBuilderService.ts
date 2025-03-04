/**
 * pageDataBuilderService.ts
 * 
 * NEW ENTRY POINT for building page data with a simplified, single-file approach.
 * 
 * -------------
 * NUMBERED STEPS OVERVIEW:
 * -------------
 * (1) Clean/normalize the slug from the input params
 * (2) Determine if slug is homepage or dynamic
 * (3) Build up a PageDefinition object
 * (4) Retrieve or assemble data needed: 
 *     - SEO items
 *     - Navigation
 *     - Footer
 *     - Components, etc.
 * (5) Return the final PageBlueprint
 * 
 * This is the new recommended pipeline. The old pipeline is now marked as "REDUNDANT"
 */

import { getLogger } from "../logging/LogConfig";
import { PageDefinition, PageBlueprint } from "../../interfaces/PageDefinition";
import { cleanSlug, isIgnoredSlug } from "../../utils/slugHelper";
import { GetSite } from "../siteContextService";
import { logPrefix } from "../../utils/logPrefix";
import { GetLanguageSiteByCode, GetMainSiteLanguage } from "../../cms/tools/urlTools";
import { getSeoData, getNavItems, getFooterStructures, getStickNavTopStructures, getBreadcrumbStructures } from "./commonData";

const log = getLogger("headless.new.pageDataBuilderService");

/**
 * IPageDataParams:
 * Repeats the same interface from pageDataFetcher, simplified for demonstration.
 */
export interface INewPageDataParams {
  slug: string[];
  source: string;
}

/**
 * The new unified function that orchestrates
 * fetching all data for building a PageBlueprint.
 */
export async function buildPageDataWithNewPipeline(params: INewPageDataParams): Promise<PageBlueprint | null> {
  // (1) Clean/normalize slug
  const slugString = cleanSlug(params.slug);
  if (isIgnoredSlug(slugString)) {
    log.debug(`${logPrefix()} Slug is ignored: ${slugString}`);
    return null;
  }

  // (2) Determine if slug is homepage or dynamic
  const siteLanguage = await GetMainSiteLanguage();
  const languageSite = await GetLanguageSiteByCode(siteLanguage);

  // We'll create a basic PageDefinition
  const pageConstruction: PageDefinition = {
    preliminarySlug: slugString,
    languageSite: languageSite || undefined,
    isDynamic: slugString !== "/",
    pageIdentifier: {
      pageVariant: slugString === "/" ? "home" : "subComponentsPage",
      isFixedLayout: slugString === "/",
      backEndSlug: slugString,
      frontEndSlug: slugString,
      cmsType: slugString === "/" ? "homepage" : "dynamic",
    },
    source: `NEW PIPELINE => ${params.source}`,
  };

  // (3) Optionally check if we are skipping pages
  if (!GetSite().shouldRenderAllPages()) {
    log.debug(`${logPrefix()} The site is not rendering all pages. Return null.`);
    return null;
  }

  // (4) Collect all data we want in a single place
  const navItems = await getNavItems(pageConstruction);
  const seoItems = await getSeoData(pageConstruction);
  const footerItems = await getFooterStructures(pageConstruction);
  const stickyNavItems = await getStickNavTopStructures(pageConstruction);
  const breadcrumbItems = await getBreadcrumbStructures(pageConstruction);

  // We can do any advanced logic for dynamic components here
  // For example, calling a "collectComponentsNew" function or similar

  // For demonstration, let's create a blank array of components
  const components: never[] = [];

  // (5) Return final blueprint
  const pageBlueprint: PageBlueprint = {
    navItems: navItems as any,
    seoItems,
    footerItems: footerItems as any,
    stickyNavItems,
    breadcrumbItems,
    components,
    siteSettings: GetSite(),
    pageData: pageConstruction,
  };
  return pageBlueprint;
}