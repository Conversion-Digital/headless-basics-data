import { GetMainSiteLanguage } from "../../cms/tools/urlTools";
import { IndividualComponentProps, PageAndSingleComponentDetails, PageDefinition } from "../../interfaces/PageDefinition";
import { replaceString } from "../../utils/replaceString";
import { initializeComponentProps } from "../components/componentConstructionPropsService";
import { GetSite } from "../siteContextService";
import { getDynamicCmsDataViaCmsSelector } from "./graphqlDataService";
import { QueryResult } from "../../interfaces/DynamicFileModuleDetails";
import { INavItem } from "../../interfaces/nav";
import { SeoItems } from "../../interfaces/SeoServices";
import { getLogger } from "../logging/LogConfig";
import { logPrefix } from "../../utils/logPrefix";

const log = getLogger("packages.headless-data-lib.src.services.data.commonData.ts")

/**
 * Fetches the layout for a given page variant.
 *
 * @param pageVariant - The identifier for the page variant.
 * @returns The layout configuration or undefined if no match is found.
 */
export function getLayoutForPageVariant(pageVariant: string) {
  return GetSite().getSiteComponents().layouts.find(
    (layout) => layout.identifier === pageVariant
  );
}

/**
 * Utility function to initialize component props with caching enabled.
 *
 * @param identifier - name of the component
 * @param pageProps - Details about the page construction.
 * @param variableForQuery - Optional variable for query.
 * @param backEndSlug - Optional backend slug for the page.
 * @returns Initialized IndividualComponentProps object.
 */
function initializeComponentWithCache(
  identifier: string,
  pageProps: PageDefinition,
  variableForQuery?: string,
  backEndSlug?: string
): IndividualComponentProps {
  const componentProps = initializeComponentProps(identifier, pageProps);
  componentProps.useCache = true;
  componentProps.pageDefinition = pageProps;

  if (variableForQuery) componentProps.variableForQuery = variableForQuery;
  if (backEndSlug) componentProps.pageDefinition.pageIdentifier.backEndSlug = backEndSlug;

  return componentProps;
}

/**
 * Fetches data from CMS for a given component location.
 *
 * @param identifier - Component identifier.
 * @param pageProps - Details about the page construction.
 * @param variableForQuery - Optional variable for query.
 * @param backEndSlug - Optional backend slug for the page.
 * @returns Fetched data from the CMS.
 */
async function fetchDataFromCMS(
  identifier: string,
  pageProps: PageDefinition,
  variableForQuery?: string,
  backEndSlug?: string
): Promise<QueryResult[]> {
  const componentProps = initializeComponentWithCache(identifier, pageProps, variableForQuery, backEndSlug);
  const page: PageAndSingleComponentDetails = { component: componentProps, page: pageProps };
  const result = await getDynamicCmsDataViaCmsSelector(page);
  return (result.result || []) as QueryResult[];
}

/**
 * Loads child navigation items for a given nav item.
 *
 * @param identifier - Component identifier for navigation children.
 * @param navItem - The parent navigation item.
 * @param pageProps - Details about the page construction.
 */
async function loadChildNavItems(identifier: string, navItem: INavItem, pageProps: PageDefinition) {
  const childNavItems = await fetchDataFromCMS(identifier, pageProps, navItem.id);
  const filteredNavItems = (childNavItems as unknown as INavItem[]).filter((item: INavItem) => !item.name.includes('_'));

  if (filteredNavItems.length === 0) return;

  navItem.children = filteredNavItems;
  await Promise.all(filteredNavItems.map((childNavItem: INavItem) => loadChildNavItems(identifier, childNavItem, pageProps)));
}

/**
 * Deeply searches and loads navigation children for a given nav item.
 *
 * @param navItems - Array of navigation items.
 * @param componentProps - Component properties for the navigation.
 */
async function deepSearchNavigation(navItems: INavItem[], componentProps: IndividualComponentProps) {
  for (const navItem of navItems) {
    if (navItem.name.includes('_')) continue;

    if (navItem.children) {
      // eslint-disable-next-line no-await-in-loop
      await deepSearchNavigation(navItem.children, componentProps);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await loadChildNavItems("navigationChildren", navItem, componentProps.pageDefinition as PageDefinition);
    }
  }
}

/**
 * Fetches structured data for a given ID and location variable name.
 *
 * @param id - Identifier for the data type (e.g., "footer").
 * @param locationVariableName - Site config variable name for the location.
 * @param pageProps - Details about the page construction.
 * @returns Fetched structured data.
 */
async function getDataStructures(identifier: string, locationVariableName: string, pageProps: PageDefinition): Promise<QueryResult[]> {
  pageProps.source += `> getDataStructures > ${identifier}`;

  const siteConfig = GetSite().getSiteSettings().siteConfig;
  let itemSlug = siteConfig[locationVariableName as keyof typeof siteConfig] || pageProps.preliminarySlug;

  if (pageProps.languageSite) {
    itemSlug = replaceString(itemSlug, await GetMainSiteLanguage(), pageProps.languageSite.countryCode);
  }

  log.trace(`${logPrefix()}[getDataStructures][${identifier}] Fetching structures for ${itemSlug}`);

  return await fetchDataFromCMS(identifier, pageProps, undefined, itemSlug);
}

/**
 * Fetches breadcrumb data structures.
 *
 * @param pageProps - Details about the page construction.
 * @returns Breadcrumb items.
 */
export async function getBreadcrumbStructures(pageProps: PageDefinition): Promise<QueryResult[]> {
  return await fetchDataFromCMS('breadcrumb', pageProps);
}

/**
 * Fetches footer data structures.
 *
 * @param pageProps - Details about the page construction.
 * @returns Footer items.
 */
export async function getFooterStructures(pageProps: PageDefinition): Promise<QueryResult[]> {
  log.trace(`${logPrefix()}[getFooterStructures] Fetching footer structures`);
  const footerData = await getDataStructures("footer", "footerLocation", pageProps);
  log.trace(`${logPrefix()}[getFooterStructures] Footer structures fetched ${JSON.stringify(footerData)}`);
  return footerData;
}

/**
 * Fetches sticky navigation data structures.
 *
 * @param pageProps - Details about the page construction.
 * @returns Sticky navigation items.
 */
export async function getStickNavTopStructures(pageProps: PageDefinition): Promise<QueryResult[]> {
  return await getDataStructures("stickynavigation", "stickyNavLocation", pageProps);
}

/**
 * Fetches SEO data for the page.
 *
 * @param pageProps - Details about the page construction.
 * @returns SEO items.
 */
export async function getSeoData(pageProps: PageDefinition): Promise<SeoItems> {
  const seoItems = await fetchDataFromCMS('seo', pageProps);
  return seoItems as SeoItems;
}

/**
 * Fetches navigation items and performs deep search if necessary.
 *
 * @param pageProps - Details about the page construction.
 * @returns Navigation items.
 */
export async function getNavItems(pageProps: PageDefinition): Promise<QueryResult[]> {
  const navItems = await fetchDataFromCMS('navigation', pageProps);

  if (GetSite().getSiteSettings().deepSearchNavigation) {
    const componentProps = initializeComponentWithCache('navigation', pageProps);
    await deepSearchNavigation(navItems as unknown as INavItem[], componentProps);
  }

  return navItems;
}
