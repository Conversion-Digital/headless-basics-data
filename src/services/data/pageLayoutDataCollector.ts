// --------------------------------------------------
// REDUNDANT CODE NOTICE:
// This file is part of the old page building pipeline.
// Now replaced by pageDataBuilderService.ts
// Keep code intact for backward compatibility. DO NOT EDIT.
// --------------------------------------------------

import { PageBlueprint, PageDefinition } from "../../interfaces/PageDefinition";
import { logPrefix } from "../../utils";
import { getLogger } from "../logging/LogConfig";
import { GetSite } from "../siteContextService";
import { collectDynamicLayoutPageComponentData, collectFixedLayoutPageComponentData } from "./collectPageComponentData";
import { getBreadcrumbStructures, getFooterStructures, getNavItems, getSeoData, getStickNavTopStructures } from "./commonData";
import { INavItem } from "../../interfaces/nav";


const log = getLogger("headless.pageLayoutDataCollector");

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

/*
  The purpose of this function is to gather the required data from the GraphQL layer for a particular page.
  We need to support two page layout types.
  1) Fixed Layout -   These pages have a pre-determined layout as per a design. The data they try to collect is fixed.
  2) Dynamic Layout - These pages have multiple components as determined by the data passed in.
                      Usually a single field in the CMS will contain multiple references.  We need to loop over the references and collect all the data for display.


    On top of the page layout types we have common data that all pages will require.
    We need to support two types of common data.
    1) Individual Page Data       - This is unique to each page. Each page can have Meta Data, Breadcrumbs, Redirects, Structured DAta.
    2) Global Data          - This is commmon to all pages. Includes Naviation, Footer
*/
export async function collectAllPageData(pageConstructionProps: PageDefinition): Promise<PageBlueprint> {
  log.trace(`${logPrefix()}[collectAllPageData][${pageConstructionProps.preliminarySlug}] Starting data collection...`);

  // Collecting component data
  const isFixedLayout = pageConstructionProps.pageIdentifier.isFixedLayout;
  if(isFixedLayout){
    log.info(`${logPrefix()}[${pageConstructionProps.preliminarySlug}] Fixed layout page`);
  }else{
    log.trace(`${logPrefix()}[${pageConstructionProps.preliminarySlug}] Dynamic layout page`);
  }
  const fixedComponents = isFixedLayout ? await collectFixedLayoutPageComponentData(pageConstructionProps) : [];
  log.trace(`${logPrefix()}[collectAllPageData][${pageConstructionProps.preliminarySlug}] Fixed components: ${fixedComponents.length}`);
  const dynamicComponents = await collectDynamicLayoutPageComponentData(pageConstructionProps);
  log.trace(`${logPrefix()}[collectAllPageData][${pageConstructionProps.preliminarySlug}] Dynamic components: ${dynamicComponents.length}`);
  const components = [...fixedComponents, ...dynamicComponents].sort((a, b) => a.sortOrder - b.sortOrder);
  
  return {
      navItems: await getNavItems(pageConstructionProps) as unknown as INavItem[],
      seoItems: await getSeoData(pageConstructionProps),
      components,
      breadcrumbItems: await getBreadcrumbStructures(pageConstructionProps) as any,
      footerItems: await getFooterStructures(pageConstructionProps),
      stickyNavItems: await getStickNavTopStructures(pageConstructionProps),
      siteSettings: stripFunctions(GetSite()),
      pageData: pageConstructionProps
  };
}
