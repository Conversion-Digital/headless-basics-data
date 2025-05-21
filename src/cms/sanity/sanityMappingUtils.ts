import { getLogger } from "../../services";
import { logPrefix } from "../../utils";

const log = getLogger("ata.headless.cms.heartcore.tools.processRawUrlsOnServer");

export function extractComponentsFromSanityData(
  data: any,
  typename: string,
  logger = log,
  lookupPageAndHomepage: boolean = true,
  lookupTypeStructure: string = '',
  desiredComponentToRetrieveSortOrder: number = 0,
) {
  if (!data) {
    logger.error(`${logPrefix()}[extractComponentsFromSanityData] no data found for typename: ${typename}`)
    return []
  }

  const foundComponents: any[] = []

  function pushFoundComponents(source: string, collection: any[], desiredIndex: number = 0) {
  if (!collection?.length) return;

  collection.forEach(page => {
    const filtered = (page.components || [])
      .filter((c: { __typename: string; }) => c.__typename?.toLowerCase() === typename.toLowerCase());

    if (filtered[desiredIndex]) {
      const comp = filtered[desiredIndex];
      foundComponents.push(
        comp.globalComponentSource?.__typename?.toLowerCase() === typename.toLowerCase()
          ? comp.globalComponentSource
          : comp
      );
    }
  });
}

  log.trace(`${logPrefix()}[extractComponentsFromSanityData] looking for ${typename} in lookupPageAndHomepage ::: ${lookupPageAndHomepage}`)
  if(lookupPageAndHomepage){
    pushFoundComponents("allPage", data.allPage as any[], desiredComponentToRetrieveSortOrder)
    pushFoundComponents("allHomepage", data.allHomepage as any[], desiredComponentToRetrieveSortOrder)
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
  log.trace(`${logPrefix()}[motto][sanity-mapping] found length of components: ${foundComponents.length} for typename: ${typename}`)
  return matchingComponent
}