import { getLogger } from "../../services";
import { logPrefix } from "../../utils";

const log = getLogger("ata.headless.cms.heartcore.tools.processRawUrlsOnServer");

export function extractComponentsFromSanityData(
  data: any,
  typename: string,
  logger = log,
  lookupPageAndHomepage: boolean = true,
  lookupTypeStructure: string = ''
) {
  if (!data) {
    logger.error(`${logPrefix()}[extractComponentsFromSanityData] no data found for typename: ${typename}`)
    return []
  }

  const foundComponents: any[] = []

  function pushFoundComponents(source: string, collection: any[]) {
    if (!collection?.length) return
    logger.trace(`${logPrefix()}[extractComponentsFromSanityData] found ${collection.length} items in ${source} for typename: ${typename}`)
    collection.forEach((page) => {
      if (!page?.components?.length) return
      page.components.forEach((component: any, index: number) => {
        const typeNameRoot = typename?.toLowerCase() + (data?.sortOrder || 0);
        const typeNameToMatch = component.__typename?.toLowerCase() + index;
        if (typeNameToMatch === typeNameRoot) {
          log.trace(`${logPrefix()}[extractComponentsFromSanityData] found component for typename: ${typename} ::: ${component?.globalComponentSource?.__typename}`, component)
          if(component?.globalComponentSource?.__typename?.toLowerCase() === typename?.toLowerCase()) {
            foundComponents.push(component.globalComponentSource);
            log.trace(`${logPrefix()}[extractComponentsFromSanityData] GLOBAL COMPONENT MATCHED :::: ${typename}`)
          }else{
            foundComponents.push(component);
            log.trace(`${logPrefix()}[extractComponentsFromSanityData]  Local component MATCHED ${typename}`)
          }
        }
      })
    })
  }

  log.trace(`${logPrefix()}[extractComponentsFromSanityData] looking for ${typename} in lookupPageAndHomepage ::: ${lookupPageAndHomepage}`)
  if(lookupPageAndHomepage){
    pushFoundComponents("allPage", data.allPage as any[])
    pushFoundComponents("allHomepage", data.allHomepage as any[])
  }else if (lookupTypeStructure != ''){
    return data[lookupTypeStructure];
    // log.info(`${logPrefix()}[extractComponentsFromSanityData] looking for ${typename} in data[lookupTypeStructure] ::: ${data[lookupTypeStructure]}`)
  }

  if (!foundComponents.length) {
    log.warn(`${logPrefix()}[motto][sanity-mapping] no motto components found`)
    return {}
  }

  let desiredSortOrder = 0;
  if (desiredSortOrder < 0 || desiredSortOrder >= foundComponents.length) {
    log.warn(`${logPrefix()}[motto][sanity-mapping] sortOrder out of range: ${desiredSortOrder}`)
    desiredSortOrder = 0
  }

  const matchingComponent = foundComponents[desiredSortOrder]

  return matchingComponent
}