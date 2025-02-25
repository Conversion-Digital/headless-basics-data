import { getDynamicCmsDataViaCmsSelector, log } from "../data/graphqlDataService";
import { DynamicFileModuleDetails } from "../../interfaces/DynamicFileModuleDetails";
import { logPrefix } from "../../utils";
import { PageDefinition, IndividualComponentProps, PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";
import { initializeComponentProps } from "../components/componentConstructionPropsService";


export async function getPageTypeBySlug(page: PageDefinition, isUdiLookup:boolean = false, udi?:string) : Promise<any> {
  const component: IndividualComponentProps = initializeComponentProps("model", page);
  if (isUdiLookup) {
    component.variableForQuery = component.udi = udi;
    page.source += " > getPageTypeBySlug(Udi)";
    log.trace(`${logPrefix()}[graphqlDataService][getPageTypeBySlug] > Udi = ${udi}`);
  } else {
    component.variableForQuery = page.pageIdentifier.backEndSlug;
    // page.pageIdentifier.backEndSlug = page.pageIdentifier.backEndSlug;
    page.source += ` > getPageTypeBySlug(variableForQuery) = ${page?.pageIdentifier?.backEndSlug}`;
    log.trace(`${logPrefix()}[graphqlDataService][getPageTypeBySlug] > variableForQuery = ${page?.pageIdentifier?.backEndSlug}`);
  }

  const pageAndSingleComponentDetails : PageAndSingleComponentDetails = { component, page: page }

  const pageType:DynamicFileModuleDetails = (await getDynamicCmsDataViaCmsSelector(pageAndSingleComponentDetails)) || undefined;
  if (!pageType?.result?.contentTypeAlias) {
    log.trace(`${logPrefix()}[graphqlDataService][getPageTypeBySlug][${component.identifier}] > contentTypeAlias is not present ::: RESULT :::> `, JSON.stringify(pageType?.result));
  }

  log.trace(`${logPrefix()}[graphqlDataService][getPageTypeBySlug] > pageType > `, pageType?.result?.contentTypeAlias);
  return pageType?.result;
}
