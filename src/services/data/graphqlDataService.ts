import { ConfigKeysEnum } from "../../interfaces/ThemeConfig.interface";
import { logPrefix } from "../../utils/logPrefix";
import { GetPageIdentifier } from "../cmsContextService";
import { getLogger } from "../logging/LogConfig";
import { fetchAPIGatewayWrapper } from "./cmsDataQueryGateway";
import { componentData, PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";
import { DynamicFileModuleDetails, QueryResult } from "../../interfaces/DynamicFileModuleDetails";

export const log = getLogger("headless-data-lib.services.data.graphqlDataService");

// export async function testSitemapImport() {
//   const identifier = "sitemap";

//   const pathsToTest = [
//     // `@conversiondigital/headless-basics-components/theme/default/components/${identifier}`,
//     `@conversiondigital/headless-basics-components/src/theme/default/components/${identifier}`,
//     // `@conversiondigital/headless-basics-components/dist/theme/default/components/${identifier}`
//   ];

//   // try {
//   //   // @ts-ignore
//   //   const module = await import(`@conversiondigital/headless-basics-components/dist/theme/default/components/sitemap`);
//   //   return module.default;
//   // } catch (error) {
//   //   if (error instanceof Error) {
//   //     log.error(`${logPrefix()} 1 Failed to import from @conversiondigital/headless-basics-components/dist/theme/default/components/sitemap: ${error.message}`);
//   //   } else {
//   //     log.error(`${logPrefix()} 1a Failed to import from @conversiondigital/headless-basics-components/dist/theme/default/components/sitemap:`, error);
//   //   }
//   // }

//   try {
//     // @ts-ignore
//     const module = await import(`@conversiondigital/headless-basics-components/src/theme/default/components/sitemap`);
//     log.trace(`${logPrefix()} Successfully imported from @conversiondigital/headless-basics-components/src/theme/default/components/sitemap`);
//     const modulea = module.default;
//   } catch (error) {
//     if (error instanceof Error) {
//       log.error(`${logPrefix()} 2 Failed to import from @conversiondigital/headless-basics-components/src/theme/default/components/sitemap: ${error.message}`);
//     } else {
//       log.error(`${logPrefix()} 2a Failed to import from @conversiondigital/headless-basics-components/src/theme/default/components/sitemap:`, error);
//     }
//   }

//   for (const path of pathsToTest) {
//     log.trace(`${logPrefix()} Testing import path: ${path}`);
//     try {
//       const module = await import(`${path}`);
//       log.trace(`${logPrefix()} Successfully imported from: ${path}`);
//       return module.default;
//     } catch (error) {
//       if (error instanceof Error) {
//         log.error(`${logPrefix()} Failed to import from ${path}: ${error.message}`);
//       } else {
//         log.error(`${logPrefix()} Failed to import from ${path}:`, error);
//       }
//     }
//   }

//   throw new Error(`${logPrefix()} All paths failed to import the sitemap module.`);
// }

export async function resolveModuleFileLocation(
  details: DynamicFileModuleDetails
): Promise<DynamicFileModuleDetails> {
  const cmsPrefix = process.env.NEXT_PUBLIC_CMS_VARIANT
    ? `${process.env.NEXT_PUBLIC_CMS_VARIANT.toLowerCase()}`
    : "";


  // testSitemapImport()

  // Change this to however you obtain your "siteId".
  // For example, an environment variable or another property in `details`.
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";

  details.cmsPrefix = cmsPrefix;
  const identifier = details?.identifier?.toLowerCase() || "";

  // const isSiteThemeSpecified = typeof process.env.SITE_THEME === 'undefined';
  const siteTheme = process.env.SITE_THEME || "deep-purple";

  // First attempt: /theme/${siteId}/components/<identifier>
  let primaryPath = `theme/${siteId}/components/${identifier}`;
  // Fallback path: package location
  let siteThemefallbackPath = `@conversiondigital/headless-basics-components/src/theme/${siteTheme}/components/${identifier}`;
  let defaultFallbackPath = `@conversiondigital/headless-basics-components/src/theme/default/components/${identifier}`;

  details.matchingPath = primaryPath;
  details.failedToFind = true;

  log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}] Attempting primary path: ${primaryPath}`);

  details = await extractOverrideTheme(details, siteId, identifier, primaryPath, siteThemefallbackPath, siteTheme, defaultFallbackPath);

  // If we have a module, attempt to resolve the query
  if (details.moduleX !== null && typeof details.moduleX !== "undefined") {
    details.query = details.moduleX[ConfigKeysEnum.query];
    details.queryString = details.query ? details.query.toString() : "Unknown";

    if (details.queryString === "Unknown") {
      log.error(`${logPrefix()}[${details.identifier}] query not found for ${details.identifier}`);
    } else {
      details.failedToFind = false;
      log.trace(`${logPrefix()}[${details.identifier}][FOUND] ${details.matchingPath}`);
    }
  }

  return details;
}

/** Look for the override theme, if not found call the site theme function.
 * 
 * @param details  
 * @param siteId 
 * @param identifier 
 * @param primaryPath 
 * @param siteThemefallbackPath 
 * @param siteTheme 
 * @param defaultFallbackPath 
 * @returns 
 */
async function extractOverrideTheme(details: DynamicFileModuleDetails, siteId: string, identifier: string, primaryPath: string, siteThemefallbackPath: string, siteTheme: string, defaultFallbackPath: string) {
  log.trace(`${logPrefix()}[${identifier}] Attempting primary path: ${primaryPath}`);
  try {
    details.moduleX = await import(`theme/${siteId}/components/${identifier.toLowerCase()}`).then((module) => module.default);
    details.matchingPath = primaryPath;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.trace(`${logPrefix()}[${identifier}][${primaryPath}] Primary module not found:`, error.message);
    } else {
      log.trace(`${logPrefix()}[${identifier}][${primaryPath}] Primary module not found:`, error);
    }

    // Fallback attempt: library default components
    details = await extractSiteTheme(details, siteThemefallbackPath, siteTheme, defaultFallbackPath);
  }
  return details;
}

/** Look for the site theme, if not found call the default theme function.
 * 
 * @param details 
 * @param siteThemefallbackPath 
 * @param siteTheme 
 * @param identifier 
 * @param defaultFallbackPath 
 * @returns 
 */
async function extractSiteTheme(details: DynamicFileModuleDetails, siteThemefallbackPath: string, siteTheme: string, defaultFallbackPath: string) {
  log.trace(`${logPrefix()}[${details.identifier}][151] Attempting fallback site theme detection: ${siteTheme}`);
  try { 
    
    //@ts-ignore
    // const homepage = await import(`@conversiondigital/headless-basics-components/src/theme/deep-purple/components/homepagev2body`).then((module) => module.default);

    // log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}] HOMEPAGE LOADED FINE`);

    switch(siteTheme){
      case "deep-purple":
        log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][MATCH] Site Theme ::: ${siteTheme} == deep-purple MATCH - attempting to load ${siteThemefallbackPath}`);
          details.moduleX = await import(`@conversiondigital/headless-basics-components/src/theme/deep-purple/components/${details.identifier.toLowerCase()}`).then((module) => module.default);
        log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][MATCH] Site Theme ::: ${siteTheme} == deep-purple loaded ${siteThemefallbackPath}`);
        break;
      case "light-blue":
        log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][MATCH] Site Theme ::: ${siteTheme} MATCH - attempting to load ${siteThemefallbackPath}`);
          details.moduleX = await import(`@conversiondigital/headless-basics-components/src/theme/light-blue/components/${details.identifier.toLowerCase()}`).then((module) => module.default);
        log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][MATCH] Site Theme ::: ${siteTheme} loaded ${siteThemefallbackPath}`);
    }      
    details.matchingPath = siteThemefallbackPath;
    log.debug(`${logPrefix()}[${details.identifier.toLowerCase()}][FALLBACK] Site Theme ::: ${siteTheme} loaded ${siteThemefallbackPath}`);
  } catch (fallbackError: unknown) {
    if (fallbackError instanceof Error) {
      log.trace(
        `${logPrefix()}[${details.identifier.toLowerCase()}][${siteTheme}][110] Site Theme ::: ${siteTheme} Fallback module not found:`,
        fallbackError.message
      );
    } else {
      log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][${siteTheme}][114] Site Theme ::: ${siteTheme} Fallback module not found:`, fallbackError);
    }
    details = await extractDefaultTheme(details);
  }
  return details;
}

/** Look for the default theme.
 * 
 * @param details 
 * @param identifier 
 * @param defaultFallbackPath
 * @returns 
 */
async function extractDefaultTheme(details: DynamicFileModuleDetails) {
  const currentPath = `@conversiondigital/headless-basics-components/src/theme/default/components/${details.identifier.toLowerCase()}`;
  try {
    log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][DEFAULT THEME][191] Attempting default theme detection: ${currentPath}`);
    details.moduleX = await import(`@conversiondigital/headless-basics-components/src/theme/default/components/${details.identifier.toLowerCase()}`).then((module) => module.default);
    details.matchingPath = currentPath;
    log.trace(`${logPrefix()}[${details.identifier.toLowerCase()}][DEFAULT THEME][197] Default Theme loaded ${currentPath}`);
  } catch (fallbackError: unknown) {
    if (fallbackError instanceof Error) {
      log.error(`${logPrefix()}[${details.identifier.toLowerCase()}][Path: ${currentPath}][200] Default Theme Fallback module not found:`, fallbackError.message);
    } else {
      log.error(`${logPrefix()}[${details.identifier.toLowerCase()}][Path: ${currentPath}][202] Default Theme Fallback module not found:`, fallbackError);
    }
  }
  return details;
}

export async function getDynamicCmsDataViaCmsSelector(componentAndPageProps: PageAndSingleComponentDetails): Promise<DynamicFileModuleDetails> {
  let details: DynamicFileModuleDetails = {
    identifier: componentAndPageProps.component.identifier.toLowerCase(),

    failedToFind: true,
    queryString: "",
    cmsPrefix: "",
    query: undefined,
    matchingPath: "",
    moduleX: undefined,
    queryResult: undefined,
    variableFunc: undefined,
    dataMapper: undefined,
    variables: undefined,
    result: undefined,
    data: undefined,
    view: undefined,
    useCache: componentAndPageProps.component.useCache,
  }

  details = await resolveModuleFileLocation(details)

  log.trace(`${logPrefix()}[${details.identifier}] resolveModuleFileLocation completed pageIdentifier ${componentAndPageProps?.component?.identifier} ${componentAndPageProps.page.preliminarySlug}`)
  // let scenario = "variable-unprocessed"
  try {
    if (details.failedToFind) {
      log.error(`${logPrefix()}[${details.identifier}] Failed to find the following module -- `, `${details.identifier} > ${ConfigKeysEnum.query}()`);
      return details;
    }

    log.trace(`${logPrefix()}[${details.identifier}] ${details.identifier} > ${ConfigKeysEnum.query}()`)

    if (
      typeof componentAndPageProps.page.pageIdentifier !== "undefined" &&
      componentAndPageProps.component.useUrlForVariableFunction === false
    ) {
      // componentAndPageProps.component.usePageIdentifierForQuery = true
      // scenario = "variable-pageIdentifier"
      log.trace(`${logPrefix()}[${details.identifier}][usePageIdentifierForQuery] -- ${details.identifier} > ${ConfigKeysEnum.query}()`)
    } else if (
      typeof componentAndPageProps.page.preliminarySlug !== "undefined"
    ) {
      // componentAndPageProps.component.useUrlForQuery = true
      // scenario = "variable-cmsUrl"
      log.trace(`${logPrefix()}[${details.identifier}][useUrlForQuery] -- ${details.identifier} > ${ConfigKeysEnum.query}()`)
    } else {
      const pageIdentifier = await GetPageIdentifier("special-case");
      if (!pageIdentifier) {
        log.error(`${logPrefix()}[${details.identifier}][special-case] -- Failed to get page identifier for special case`);
        throw new Error("Failed to get page identifier for special case");
      }
      log.trace(`${logPrefix()}[${details.identifier}][special-case] -- ${details.identifier} > ${ConfigKeysEnum.query}()`)
      componentAndPageProps.page.pageIdentifier = pageIdentifier;
      // componentAndPageProps.component.usePageIdentifierForQuery = true;
    }

    log.trace(`${logPrefix()}[${details.identifier}] -- About to call the query() --- [${componentAndPageProps.page.source}]`)
    details.queryResult = details?.query?.(componentAndPageProps)
    log.trace(`${logPrefix()}[${details.identifier}] -- query completed --- [${componentAndPageProps.page.source}]`)

    if(typeof details?.queryResult === "undefined"){
      log.trace(`${logPrefix()}[${details.identifier}] query failure -- `, `${details?.matchingPath} > ${ConfigKeysEnum.query}()`);
    }else{
      log.trace(`${logPrefix()}[${details.identifier}][QUERY FOUND] -- `);
    }

    details.variableFunc = details?.moduleX?.[ConfigKeysEnum.variables]
    // const mappingKey = `${details.cmsPrefix}-${ConfigKeysEnum.mapIdentifierData}` as any;
    // details.dataMapper = details?.moduleX?.[mappingKey]
    details.dataMapper = details?.moduleX?.[ConfigKeysEnum.mapIdentifierData]
    details.view = details?.moduleX?.[ConfigKeysEnum.view]

    if(details?.view) {
      log.trace(`${logPrefix()}[${details.identifier}] -- View loaded: ${details?.view}`)
    }

    details.variables = details?.variableFunc?.(componentAndPageProps)
  } catch (err) {
    log.error(`${logPrefix()}[${details.identifier}][${componentAndPageProps.page.source}][${componentAndPageProps.page.preliminarySlug}] -- error - graphql`, err)
  }

  if(details.queryResult === undefined){
    log.error(`${logPrefix()}[${details.identifier}] query failure -- `, `${details?.matchingPath} > ${ConfigKeysEnum.query}()`);
  }

  // Process the query call
  details.data = await fetchAPIGatewayWrapper(details, componentAndPageProps)

  try {
    componentAndPageProps.component.data = details.data as componentData;
    // Lookup the data mapper function dynamically and process the data.  This is equivalent to filtering the data per CMS.
    log.trace(`${logPrefix()}[${details.identifier}][source: ${componentAndPageProps.page.source}][${componentAndPageProps.page.preliminarySlug}][dataMapper] -- Before calling the data mapper`)
    details.result = await details?.dataMapper?.(componentAndPageProps) as QueryResult
    log.trace(`${logPrefix()}[${details.identifier}][source: ${componentAndPageProps.page.source}][${componentAndPageProps.page.preliminarySlug}][dataMapper] -- after data mapper call`)
  } catch (err) {
    log.error(`${logPrefix()}[${details.identifier}][source: ${componentAndPageProps.page.source}][${componentAndPageProps.page.preliminarySlug}] -- error - await details.dataMapper `, err)
  }

  if (details.failedToFind) {
    log.error(`${logPrefix()}[${details.identifier}] Failed to find the module`)
    throw new Error(`${logPrefix()}[${details.identifier}] fileLookupResult is undefined`)
  }
  return details;
}
