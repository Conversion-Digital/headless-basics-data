import { DynamicFileModuleDetails } from "../../interfaces/DynamicFileModuleDetails"
import { logPrefix } from "../../utils/logPrefix"

import { lookupComponentVariant } from "../components/pageSubComponentDataService"
import { getLogger } from "../logging/LogConfig"
import { ComponentMetaData, SubComponentOutline } from "../../interfaces/PageDefinition"

const log = getLogger("headless.services.components.componentMetaDataService")
export function getComponentMetaData(): ComponentMetaData {
  const result: ComponentMetaData = {
    variant: "",
    name: "",
    queryFileLocation: "",
    query: "",
    rendering: "",
    id: "",
    url: "",
    typeName: "",
    // dataProvided: {},
    liveDocumentation: "",
    youtubeVideo: "",
    lastUpdated: "",
    renderingExportFunction: "",
    isInsideGrid: false,
    isClientSide: false,
  }
  return result
}

export function populateGraphqlMetaData(
  graphqlQuery: DynamicFileModuleDetails,
  item: SubComponentOutline
) {
  const componentMetaData = getComponentMetaData()
  componentMetaData.queryFileLocation = graphqlQuery.matchingPath
  componentMetaData.query = graphqlQuery.queryString
  componentMetaData.id = item.id
  componentMetaData.name = item.name
  componentMetaData.typeName = item.__typename
  componentMetaData.url = item.url
  componentMetaData.variant = lookupComponentVariant(
    graphqlQuery,
    item?.sortOrder
  ) as string
  log.trace(
    `${logPrefix()} populateGraphqlMetaData > typeName: ${
      componentMetaData.typeName
    } || Variant:`,
    componentMetaData.variant
  )

  if (graphqlQuery?.result?.componentDocumentation) {
    componentMetaData.liveDocumentation = graphqlQuery.result.componentDocumentation
  }
  if (graphqlQuery?.result?.youtubeVideo) {
    componentMetaData.youtubeVideo = graphqlQuery.result.youtubeVideo
  }
  if (graphqlQuery?.result?.lastUpdated) {
    componentMetaData.lastUpdated = graphqlQuery.result.lastUpdated
  }
  return componentMetaData
}
