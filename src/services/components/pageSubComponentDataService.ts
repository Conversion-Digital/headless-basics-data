// --------------------------------------------------
// REDUNDANT CODE NOTICE:
// This file is part of the old page building pipeline.
// Now replaced by pageDataBuilderService.ts
// Keep code intact for backward compatibility. DO NOT EDIT.
// --------------------------------------------------

import { IndividualComponentProps, PageAndSingleComponentDetails, PageDefinition, SubComponentOutline } from "../../interfaces/PageDefinition";
import { populateGraphqlMetaData } from "../data/componentMetaDataService";
import { getDynamicCmsDataViaCmsSelector } from "../data/graphqlDataService";
import { getLogger } from "../logging/LogConfig";
import { DynamicFileModuleDetails } from "../../interfaces/DynamicFileModuleDetails";
import { logPrefix } from "../../utils/logPrefix";
import { initializeComponentProps } from "./componentConstructionPropsService";


const log = getLogger("headless.services.components.pageSubComponentDataService");

export async function loadSingleComponentGraphQLData(item: SubComponentOutline, pageConstructionProps: PageDefinition, urlOverride?: string):Promise<IndividualComponentProps | undefined>{
  // Deep clone pageConstructionProps
  const pageConstructionPropsClone:PageDefinition = JSON.parse(JSON.stringify(pageConstructionProps));

  if (urlOverride) {
    log.trace(`${logPrefix()}[loadSingleComponentGraphQLData][0][${pageConstructionPropsClone.preliminarySlug}] Overriding URL with ${urlOverride}`);
    pageConstructionPropsClone.pageIdentifier.backEndSlug = urlOverride;
  }

  if(typeof item?.__typename === "undefined"){
    log.error(`${logPrefix()}[loadSingleComponentGraphQLData][error][${pageConstructionPropsClone.preliminarySlug}] __typename is undefined`);
    return undefined;
  }else{
    log.trace(`${logPrefix()}[loadSingleComponentGraphQLData][0][${pageConstructionPropsClone.preliminarySlug}] Loading data for `, item?.__typename?.toLowerCase());
  }

  const identifier = item?.__typename?.toLowerCase();
  const component: IndividualComponentProps = initializeComponentProps(identifier, pageConstructionPropsClone);
  component.sortOrder = item.sortOrder;
  log.info(`${logPrefix()}[loadSingleComponentGraphQLData][1][${pageConstructionPropsClone.preliminarySlug}] about to set variableForQuery `, item?.__typename?.toLowerCase());
  component.variableForQuery = pageConstructionPropsClone.pageIdentifier.backEndSlug;
  component.id = item?._key || item.id;

  const pageAndSingleComponentDetails : PageAndSingleComponentDetails = { component, page: pageConstructionPropsClone }

  const lookupComponentResult = await getDynamicCmsDataViaCmsSelector(pageAndSingleComponentDetails);

  log.trace(`${logPrefix()}[${pageConstructionPropsClone.preliminarySlug}] > ${lookupComponentResult.matchingPath}`);

  component.metaData = populateGraphqlMetaData(lookupComponentResult, item);
  component.data = lookupComponentResult.result;
  component.subComponentOutline = item;
  component.view = lookupComponentResult?.view;

  log.trace(`${logPrefix()}[${pageConstructionPropsClone.preliminarySlug}] found component for `, item?.__typename?.toLowerCase());
  return component;
}

export function lookupComponentVariant(lookupComponentResult: DynamicFileModuleDetails, sortOrder: number): unknown {

  let itemToSearch = null;
  let result = "Unknown";

  if (Array.isArray(lookupComponentResult?.result))
  {
    if (Array.isArray(lookupComponentResult?.result) && lookupComponentResult?.result.length === 1) {
      log.trace(`${logPrefix()} lookupComponentVariant > only one entry `, lookupComponentResult.result[0]);
      itemToSearch = lookupComponentResult.result[0];

    } else if (Array.isArray(lookupComponentResult?.result) && lookupComponentResult?.result.length > 1) {
      // Search inside the array for a matching sortOrder
      log.trace(`${logPrefix()} lookupComponentVariant > multiple entries `, lookupComponentResult.result);
      itemToSearch = lookupComponentResult.result.find((item) => {
          return sortOrder && item?.sortOrder === sortOrder;
        }
      );
    }
  }

  if(typeof(itemToSearch) === "undefined" || itemToSearch === null){
    itemToSearch = lookupComponentResult?.result;
  }

  if(itemToSearch?.selectableVariant)
  {
    result = itemToSearch?.selectableVariant;
  }
  log.trace(`${logPrefix()} lookupComponentVariant > `, result);
  return result;
}


// [{"name":"US Search","id":"05f9c8db-818d-4d00-b1ba-0401925c4212","url":"/us-homepage/search/_components/us-search/","__typename":"SiteSearch"}]
export async function LoadAllSubComponentData(subComponentsListing: SubComponentOutline[], pageConstructionProps: PageDefinition) {
  log.debug(`${logPrefix()}[LoadAllSubComponentData][${pageConstructionProps.preliminarySlug}] started Components: ${subComponentsListing?.length}`);
  const componentsLoaded: IndividualComponentProps[] = [];
  if(subComponentsListing?.length && subComponentsListing.length > 0){
    log.trace(`${logPrefix()}[LoadAllSubComponentData][2][${pageConstructionProps.preliminarySlug}] components: ${subComponentsListing?.length}`);
    await Promise.all(subComponentsListing.map(async (item: SubComponentOutline) => {
      if(item.__typename){
        const sortOrder = item.sortOrder ? item.sortOrder : 0;
        log.trace(`${logPrefix()}[LoadAllSubComponentData][2][${pageConstructionProps.preliminarySlug}][${sortOrder}] `, item.__typename?.toLowerCase());
        console.log("🚀 ~ awaitPromise.all ~ item===>", item)

        const singleComponentResult: IndividualComponentProps | undefined = await loadSingleComponentGraphQLData(item, pageConstructionProps);
        if(singleComponentResult){
          const specialOrder = singleComponentResult?.data?.order ? singleComponentResult?.data?.order : 'Top'; // This is either Top or Bottom. It is used for special cases where the pages contain a mix of Fixed and Dynamic components

          log.trace(`${logPrefix()}[LoadAllSubComponentData][3][${pageConstructionProps.preliminarySlug}][${sortOrder}][specialOrder: ${specialOrder}] ${singleComponentResult.id}`);

          item.order = specialOrder;
          const property = item._key || item.__typename?.toLowerCase() +"-"+ sortOrder;
          singleComponentResult.id = property;
          singleComponentResult.sortOrder = sortOrder;
          componentsLoaded.push(singleComponentResult);

          log.trace(`${logPrefix()}[LoadAllSubComponentData][4][${pageConstructionProps.preliminarySlug}][${property}]`);
        }
      }
    }));
    log.trace(`${logPrefix()}[LoadAllSubComponentData][promise-done][${pageConstructionProps.preliminarySlug}] finished`);
  }
  log.trace(`${logPrefix()}[LoadAllSubComponentData][last][${pageConstructionProps.preliminarySlug}] finished`);
  return componentsLoaded;
}