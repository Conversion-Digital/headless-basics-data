import { getLogger } from "../../services";
import { logPrefix } from "../../utils";

const log = getLogger("ata.headless.cms.heartcore.tools.processRawUrlsOnServer");

export function extractComponentsFromSanityData(
  data: any,
  typename: string,
  logger = log
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
      page.components.forEach((component: any) => {
        if (component.__typename === typename) {
          foundComponents.push(component)
        }
      })
    })
  }

  pushFoundComponents("allPage", data.allPage as any[])
  pushFoundComponents("allHomepage", data.allHomepage as any[])

  
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