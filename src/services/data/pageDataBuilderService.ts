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
import { PageDefinition, PageBlueprint, IndividualComponentProps } from "../../interfaces/PageDefinition";
import { cleanSlug, isIgnoredSlug } from "../../utils/slugHelper";
import { GetSite } from "../siteContextService";
import { logPrefix } from "../../utils/logPrefix";
import { GetLanguageSiteByCode, GetMainSiteLanguage } from "../../cms/tools/urlTools";
import {
  getSeoData,
  getNavItems,
  getFooterStructures,
  getStickNavTopStructures,
  getBreadcrumbStructures,
} from "./commonData";
import { collectFixedLayoutPageComponentData, collectDynamicLayoutPageComponentData } from "./collectPageComponentData";

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
 * Utility function to strip functions from objects for client-side serialization
 */
function stripFunctions(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripFunctions);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] !== 'function') {
        newObj[key] = stripFunctions(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * Builds page data with the new pipeline approach, including collecting any fixed or dynamic
 * subcomponent data that is relevant to the page.
 */
export async function buildPageDataWithNewPipeline(
  params: INewPageDataParams
): Promise<PageBlueprint | null> {

  log.trace(`${logPrefix()} ::: Slug on entry: ${params.slug}`);

  const slugString = cleanSlug(params.slug);
  if (isIgnoredSlug(slugString)) {
    log.debug(`${logPrefix()} Slug is ignored: ${slugString}`);
    return null;
  }

  // (2) Determine if slug is homepage or dynamic
  const siteLanguage = await GetMainSiteLanguage();
  const languageSite = await GetLanguageSiteByCode(siteLanguage);

  log.info(`${logPrefix()} ::: Slug: ${slugString}`);

  // We'll create a basic PageDefinition
  const pageConstruction: PageDefinition = {
    preliminarySlug: slugString,
    languageSite: languageSite || undefined,
    isDynamic: slugString !== "/",
    pageIdentifier: {
      pageVariant: slugString === "/" ? "home" : "subComponentsPage",
      isFixedLayout: false,
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

  // Deep clone pageConstruction to avoid side effects for each function call
  const clonedPageConstruction = JSON.parse(JSON.stringify(pageConstruction));
  const navItems = await getNavItems(clonedPageConstruction);
  const seoItems = await getSeoData(clonedPageConstruction);
  const footerItems = await getFooterStructures(clonedPageConstruction);

  log.trace(`${logPrefix()}[footerItems] ::: footerItems: ${JSON.stringify(footerItems)}`);

  const stickyNavItems = await getStickNavTopStructures(clonedPageConstruction);
  const breadcrumbItems = await getBreadcrumbStructures(clonedPageConstruction);

  let components: IndividualComponentProps[] = [];
  const isFixedLayout = pageConstruction.pageIdentifier.isFixedLayout;

  if (isFixedLayout) {
    log.debug(`${logPrefix()} Using fixed layout for slug: ${slugString}`);
    const fixedComponents = await collectFixedLayoutPageComponentData(pageConstruction);
    components.push(...fixedComponents);
  }

  // Even if it's a fixed layout, we can still gather dynamic subcomponents
  log.debug(`${logPrefix()} Collecting dynamic layout for slug: ${slugString}`);
  log.trace(`${logPrefix()} PageConstruction ::: pageConstruction.pageIdentifier.backEndSlug: ${pageConstruction.pageIdentifier.backEndSlug}`);
  const dynamicComponents = await collectDynamicLayoutPageComponentData(pageConstruction);
  components.push(...dynamicComponents);

  // Sort all components by their sortOrder
  components.sort((a, b) => a.sortOrder - b.sortOrder);

  // (5) Return final blueprint with serializable siteSettings
  const pageBlueprint: PageBlueprint = {
    navItems: navItems as any,
    seoItems,
    footerItems: footerItems as any,
    stickyNavItems,
    breadcrumbItems,
    components,
    siteSettings: stripFunctions(GetSite()),
    pageData: pageConstruction,
  };
  return pageBlueprint;
}