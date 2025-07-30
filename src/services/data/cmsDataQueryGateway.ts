import { GetCMS } from "../cmsContextService";
import { CmsVariants } from "../../cms/constants";
import { getLogger } from "../logging/LogConfig";
import { logPrefix } from "../../utils";
import { DynamicFileModuleDetails } from "../../interfaces/DynamicFileModuleDetails";
import { PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";

const log = getLogger("ui-base.lib.services.cmsDataQueryGateway");


export async function fetchAPI(
  details: DynamicFileModuleDetails,
  endpoint: string,
  headers: { [key: string]: string } = {},
  IndividualComponentProps?: PageAndSingleComponentDetails
) {
  log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] endpoint: ${endpoint}`);
  log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] graphqlDataService - variables -- `, JSON.stringify(details.variables)  || " -- no variables", details.matchingPath);

  let json = { data: undefined, errors: undefined };

  const revalidate = process.env.NEXT_REVALIDATE_TIME ? parseInt(process.env.NEXT_REVALIDATE_TIME) : 100;
  const bodyString = JSON.stringify({
    query: details.queryResult,
    variables: details.variables,
  });
  log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] -- bodyString: ${bodyString}`);
  const res = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: bodyString,
      next: { revalidate: revalidate }
  })
  log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] -- res.status: ${res.status}`);
  json = await res.json();


  if (json.errors) {
    
    try{
      log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] fetchAPI in graphqlDataService - Failed to fetch API`, details.matchingPath, details.variables, json.errors);
      log.error(json.errors);
    } catch(e) {
      log.error(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] graphqlDataService - error`, json.errors, details.matchingPath);
      log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] graphqlDataService - variables -- `, JSON.stringify(details.variables)  || " -- no variables", details.matchingPath);
    }

    // Check if errors are only about missing _type properties, which we can handle gracefully
    const isOnlyTypeErrors = json?.errors?.every((error: any) => 
      error.message && error.message.includes('object is missing "_type" property')
    );
    
    if (isOnlyTypeErrors) {
      log.warn(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] GraphQL _type errors detected, returning partial data:`, json?.errors);
      // Return partial data if available, despite _type errors
      if (json.data !== undefined && json.data !== null) {
        return json.data;
      }
    }
    
    throw new Error(`${logPrefix()}[${IndividualComponentProps?.component.identifier}][${IndividualComponentProps?.page?.preliminarySlug}][${IndividualComponentProps?.component?.identifier}][${IndividualComponentProps?.page?.source}] GRAPHQL ERRORS :::: ${JSON.stringify(json?.errors)} ::::: details.variables = ${JSON.stringify(details?.variables)}  /n/r  :::: /n/r   ::::: QUERY:::: ${details?.queryResult}`);
  }

  if (json.data !== undefined && json.data !== null) {
    log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] returning json.data ::: ${JSON.stringify(json?.data)?.substring(0, 100)}`);
    return json.data;
  } else {
    log.trace(`${logPrefix()}[${IndividualComponentProps?.component.identifier}] returning pure JSON variable ::: ${JSON.stringify(json)?.substring(0, 100)}`);
    return json;
  }
}

export async function fetchMutationAPI(
  mutationPayload: any,
  endpoint: string,
  headers: { [key: string]: string } = {}
) {
  log.trace(
    `${logPrefix()} endpoint: ${endpoint}`
  );
  log.trace(
    `${logPrefix()} mutationPayload: ${
      JSON.stringify(mutationPayload) || " -- no mutationPayload"
    }`
  );

  let json = { data: undefined, errors: undefined };

  const revalidate = process.env.NEXT_REVALIDATE_TIME
    ? parseInt(process.env.NEXT_REVALIDATE_TIME)
    : 100;

  const bodyString = JSON.stringify(mutationPayload);
  log.trace(
    `${logPrefix()} -- bodyString: ${bodyString}`
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: bodyString,
    next: { revalidate: revalidate },
  });

  log.trace(
    `${logPrefix()} -- res.status: ${res.status}`
  );

  json = await res.json();

  if (json.errors) {
    try {
      log.trace(
        `${logPrefix()} fetchMutationAPI - Failed to fetch mutation`,
        json.errors
      );
      log.error(json.errors);
    } catch (e) {
      log.error(
        `${logPrefix()} fetchMutationAPI - error`,
        json.errors
      );
    }
    throw new Error(
      `${logPrefix()} MUTATION ERRORS :::: ${JSON.stringify(
        json?.errors
      )} ::::: mutationPayload = ${JSON.stringify(mutationPayload)}`
    );
  }

  if (json.data !== undefined && json.data !== null) {
    log.trace(
      `${logPrefix()} returning json.data ::: ${JSON.stringify(
        json?.data
      )?.substring(0, 100)}`
    );
    return json.data;
  } else {
    log.trace(
      `${logPrefix()} returning pure JSON variable ::: ${JSON.stringify(
        json
      )?.substring(0, 100)}`
    );
    return json;
  }
}


export async function fetchAPIGatewayWrapper(details: DynamicFileModuleDetails, pageAndSingleComponentDetails: PageAndSingleComponentDetails) {

    const cmsVariant = GetCMS();
    log.trace(`${logPrefix()}[${pageAndSingleComponentDetails?.component.identifier}] fetchAPIGatewayWrapper - cmsVariant ::: ${cmsVariant}`);
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
    };

    if(cmsVariant === 'kontent') {
        const endpoint = `${CmsVariants.variants[cmsVariant].deliveryApiDomain}/${CmsVariants.variants[cmsVariant].projectId}`;
        return await fetchAPI(details, endpoint, headers, pageAndSingleComponentDetails);
    } else if(cmsVariant === 'contentful') {
        const endpoint = `${CmsVariants.variants[cmsVariant].deliveryApiDomain}/${CmsVariants.variants[cmsVariant].deliveryApiUrl}/${CmsVariants.variants[cmsVariant].spaceId}`;

        headers["Authorization"] = `Bearer ${CmsVariants.variants[cmsVariant].deliveryApiKey}`;

        return await fetchAPI(details, endpoint, headers, pageAndSingleComponentDetails);
    } else if(cmsVariant === 'heartcore') {
        const endpoint = `${CmsVariants.variants[cmsVariant].deliveryApiDomain}`;

        if (CmsVariants.variants[cmsVariant].deliveryApiKey) {
            headers["Api-Key"] = CmsVariants.variants[cmsVariant].deliveryApiKey;
        } else {
            throw new Error("deliveryApiKey is undefined");
        }
        if (CmsVariants.variants[cmsVariant].projectAlias) {
            headers["Umb-Project-Alias"] = CmsVariants.variants[cmsVariant].projectAlias;
        }
        
        log.trace(`${logPrefix()}[${pageAndSingleComponentDetails?.component.identifier}] fetchAPIGatewayWrapper - endpoint ::: ${endpoint}`);

        return await fetchAPI(details, endpoint, headers, pageAndSingleComponentDetails);
    } else if(cmsVariant === 'sanity') {
      const endpoint = await fetchAPIGatewayWrapperForSanity();
      log.trace(`${logPrefix()}[${pageAndSingleComponentDetails?.component.identifier}] fetchAPIGatewayWrapper - endpoint ::: ${endpoint}`);

      return await fetchAPI(details, endpoint, headers, pageAndSingleComponentDetails);
  }
}

export async function fetchAPIGatewayWrapperForSanity() {
  const cmsVariant = GetCMS();
  const projectId = process.env.PROJECT_ID || "5he8nsc5";
  const dataSet = process.env.SANITY_DATASET || "production";
  const defaultEndpoint = `https://${projectId}.api.sanity.io/v2023-08-01/graphql/${dataSet}/default`;
  const endpoint = CmsVariants.variants[cmsVariant].deliveryApiDomain || defaultEndpoint;
  return endpoint;
}

export async function fetchAPIGatewayWrapperForSanityMutations() {
  const projectId = process.env.PROJECT_ID || "5he8nsc5";
  const dataSet = process.env.SANITY_DATASET || "production";
  const defaultEndpoint = `https://${projectId}.api.sanity.io/v2023-08-01/data/mutate/${dataSet}`;
  const endpoint = defaultEndpoint;
  return endpoint;
}
