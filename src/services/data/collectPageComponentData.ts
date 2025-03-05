// --------------------------------------------------
// REDUNDANT CODE NOTICE:
// This file is part of the old page building pipeline.
// Now replaced by pageDataBuilderService.ts
// Keep code intact for backward compatibility. DO NOT EDIT.
// --------------------------------------------------

import { SUB_COMPONENT_CONTENT } from "../../cms/constants";
import { IndividualComponentProps, PageDefinition, SubComponentOutline } from "../../interfaces/PageDefinition";
import { logPrefix } from "../../utils";
import { initializeComponentProps } from "../components/componentConstructionPropsService";
import { LoadAllSubComponentData } from "../components/pageSubComponentDataService";
import { GetSite } from "../siteContextService";
import { getLayoutForPageVariant } from "./commonData";
import { getDynamicCmsDataViaCmsSelector, log } from "./graphqlDataService";

/**
 * Fetches and initializes component data for a given component location and page.
 *
 * @param componentLocation - The location configuration of the component in CMS.
 * @param isSiteComponent - Whether the component belongs to the site structure.
 * @param pageProps - Details about the page construction.
 * @returns An object containing the fully initialized component and optional components outline.
 */
async function fetchAndInitializeComponentData(
  identifier: string,
  pageProps: PageDefinition
): Promise<{ component: IndividualComponentProps; componentsOutline: SubComponentOutline[] }> {
  log.trace(`${logPrefix()}[${pageProps.preliminarySlug}][${identifier}] Started`);
  // Initialize the component with page properties
  const component = initializeComponentProps(identifier, pageProps);
  
  // Build the page context and fetch data from CMS
  const pageContext = { component, page: pageProps };
  const cmsResult = await getDynamicCmsDataViaCmsSelector(pageContext);

  // Assign fetched data to the component
  component.data = cmsResult.result;

  // Return the component and optional outline data
  const componentsOutline = cmsResult.result as unknown as SubComponentOutline[];
  return { component, componentsOutline };
}

/**
 * Collects component data for a fixed-layout page based on the page construction properties.
 *
 * @param pageProps - Details about the page including layout and slug information.
 * @returns An array of IndividualComponentProps containing the fixed layout component data.
 */
export async function collectFixedLayoutPageComponentData(pageProps: PageDefinition): Promise<IndividualComponentProps[]> {
  log.trace(`${logPrefix()}[${pageProps.preliminarySlug}][${pageProps?.pageIdentifier?.pageVariant}] Started`, GetSite().getSiteComponents().layouts);

  const layout = getLayoutForPageVariant(pageProps.pageIdentifier?.pageVariant);
  if (!layout) {
    log.warn(`${logPrefix()}[${pageProps.preliminarySlug}] No matching layout found`, pageProps.pageIdentifier?.pageVariant);
    return [];
  }

  log.debug(`${logPrefix()}[${pageProps.preliminarySlug}] Processing layout components`);

  const components: IndividualComponentProps[] = [];

  const componentPromises = layout.components.map(componentName =>
    fetchAndInitializeComponentData(componentName, pageProps)
  );
  const results = await Promise.all(componentPromises);
  results.forEach(({ component }) => components.push(component));

  log.debug(`${logPrefix()}[${pageProps.pageIdentifier?.pageVariant}] Fixed layout component data collection completed`);
  return components;
}

/**
 * Collects component data for a dynamic-layout page based on the page construction properties.
 *
 * @param pageProps - Details about the page including layout and slug information.
 * @returns An array of IndividualComponentProps containing the dynamic layout component data.
 */
export async function collectDynamicLayoutPageComponentData(pageProps: PageDefinition): Promise<IndividualComponentProps[]> {
  pageProps.source += ` > collectDynamicLayoutPageComponentData > ${pageProps.preliminarySlug}`;
  log.trace(`${logPrefix()}[collectDynamicLayoutPageComponentData][${pageProps.preliminarySlug}]`);

  if (!pageProps.preliminarySlug) {
    throw new Error(`${logPrefix()}[collectDynamicLayoutPageComponentData] Page slug is undefined`);
  }
  const { componentsOutline } = await fetchAndInitializeComponentData(SUB_COMPONENT_CONTENT, pageProps);

  // get the components related
  const components = await LoadAllSubComponentData(componentsOutline, pageProps);

  log.trace(`${logPrefix()}[${pageProps.preliminarySlug}] Dynamic layout component data collection completed - ${components.length} components`);
  return components;
}
