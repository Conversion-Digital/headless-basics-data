import { IndividualComponentProps, PageAndSingleComponentDetails } from "../interfaces/PageDefinition";
import { PageIdentifier } from "../interfaces/PageIdentifier";
import { initializeComponentProps } from "./components/componentConstructionPropsService";
import { getDynamicCmsDataViaCmsSelector } from "./data/graphqlDataService";
import { getLogger } from "./logging/LogConfig";

getLogger("headless.services.robots");

export async function collectRobotsTxtData() {

  const component: IndividualComponentProps = initializeComponentProps('robotstxt');
  const pageIdentifier: PageIdentifier = { backEndSlug: undefined, frontEndSlug: undefined, pageVariant: "special-case", cmsType: "robotstxt", isFixedLayout: false };
  component.variableForQuery = "robots.txt";
  const page : PageAndSingleComponentDetails = { component, page: { preliminarySlug: "robots.txt", pageIdentifier: pageIdentifier, isDynamic: false, source: "collectRobotsTxtData" } }

  const navItems = await getDynamicCmsDataViaCmsSelector(page);

  return navItems.result || [];
}

