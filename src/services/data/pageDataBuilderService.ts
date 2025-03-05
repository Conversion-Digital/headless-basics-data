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
 * Builds page data with the new pipeline approach, including collecting any fixed or dynamic
 * subcomponent data that is relevant to the page.
 */
export async function buildPageDataWithNewPipeline(
  params: INewPageDataParams
): Promise<PageBlueprint | null> {
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

  // (4) Collect all data we want in a single place
  const navItems = await getNavItems(pageConstruction);
  const seoItems = await getSeoData(pageConstruction);
  const footerItems = await getFooterStructures(pageConstruction);
  const stickyNavItems = await getStickNavTopStructures(pageConstruction);
  const breadcrumbItems = await getBreadcrumbStructures(pageConstruction);

  // Gather all components, both fixed layout and dynamic
  let components: IndividualComponentProps[] = [];
  const isFixedLayout = pageConstruction.pageIdentifier.isFixedLayout;

  if (isFixedLayout) {
    log.debug(`${logPrefix()} Using fixed layout for slug: ${slugString}`);
    const fixedComponents = await collectFixedLayoutPageComponentData(pageConstruction);
    components.push(...fixedComponents);
  }

  // Even if it's a fixed layout, we can still gather dynamic subcomponents
  log.info(`${logPrefix()} Collecting dynamic layout for slug: ${slugString}`);
  log.info(`${logPrefix()} PageConstruction ::: pageConstruction.pageIdentifier.backEndSlug: ${pageConstruction.pageIdentifier.backEndSlug}`);
  const dynamicComponents = await collectDynamicLayoutPageComponentData(pageConstruction);
  components.push(...dynamicComponents);

  // Sort all components by their sortOrder
  components.sort((a, b) => a.sortOrder - b.sortOrder);

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