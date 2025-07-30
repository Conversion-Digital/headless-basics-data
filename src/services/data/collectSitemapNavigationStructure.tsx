import { logPrefix } from "../../utils";
import { GetCMS } from "../cmsContextService";
import { getLogger } from "../logging/LogConfig";
import { getDynamicCmsDataViaCmsSelector } from "./graphqlDataService";
import { initializeComponentProps } from "../components/componentConstructionPropsService";
import { IndividualComponentProps, PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";
import { PageIdentifier } from "../../interfaces/PageIdentifier";
import { SitemapQueryResult } from "../../interfaces/DynamicFileModuleDetails";

const log = getLogger("headless.pageDataProvider");

export async function collectSitemapNavigationStructure(identifier: string = "sitemap", source: string = ""): Promise<SitemapQueryResult[]> {
  source += "> collectSitemapNavigationStructure";

  const cmsVariant = GetCMS();
  log.trace(`${logPrefix()} collectSitemapNavigationStructure > cmsVariant > `, cmsVariant);

  const component: IndividualComponentProps = initializeComponentProps(identifier);
  const pageIdentifier: PageIdentifier = {
    pageVariant: "homepage",
    cmsType: "sitemap",
    isFixedLayout: true,
  }
  component.variableForQuery = "robots.txt";
  const page: PageAndSingleComponentDetails = {
    component,
    page: { pageIdentifier: pageIdentifier, isDynamic: false, source },
  }

  try {
    const navItems = await getDynamicCmsDataViaCmsSelector(page);
    return (navItems.result || []) as SitemapQueryResult[];
  } catch (error) {
    log.error(`${logPrefix()} collectSitemapNavigationStructure error:`, error);
    // Return empty array as fallback to prevent app from crashing
    return [];
  }
}