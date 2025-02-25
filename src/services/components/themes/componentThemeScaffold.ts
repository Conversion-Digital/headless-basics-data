import { PageAndSingleComponentDetails, ThemeConfig } from "../../../interfaces";
import { logPrefix } from "../../../utils/logPrefix";
import { standardVariables } from "../../data/graphql/graphqlVariablesService";
import { getLogger } from "../../logging/LogConfig";

const log = getLogger("services.components.themes.componentThemeScaffold");

// async function testSitemapImport() {
//   try {
//     // @ts-ignore
//     await import(`@conversiondigital/cd-headless-component-lib/src/theme/default/components/sitemap/heartcore-mapping`);
//     log.info(`${logPrefix()} Successfully imported from @conversiondigital/cd-headless-component-lib/src/theme/default/components/sitemap/heartcore-mapping`);
//   } catch (error) {
//     if (error instanceof Error) {
//       log.error(`${logPrefix()} Failed to import from sitemap: ${error.message}`);
//     } else {
//       log.error(`${logPrefix()} Unknown error during sitemap import:`, error);
//     }
//   }
// }

/**
 * Retrieve the theme configuration for a given component.
 */
export async function getThemeConfig(componentName: string): Promise<ThemeConfig> {

  const cmsPrefix = process.env.NEXT_PUBLIC_CMS_VARIANT || "default";
  const identifier = componentName?.toLowerCase() || "";

  const isSiteThemeSpecified = typeof process.env.SITE_THEME === 'undefined';
  const siteTheme = process.env.SITE_THEME as string || "default";

  log.trace(`${logPrefix()}[${identifier}][${cmsPrefix}][GETTHEME] Attempting to retrieve theme configuration for component '${componentName}'`);

  // Attempt to import the mapping module
  let mappingModule: any = await retrieveMappingModule(identifier, cmsPrefix, siteTheme, componentName);

  log.trace(`${logPrefix()}[${identifier}][${cmsPrefix}][GOTTHEME] Mapping done`);
  // Attempt to import the query module
  let queryModule: any = await retrieveQueryModule(identifier, cmsPrefix, siteTheme, componentName);

  log.trace(`${logPrefix()}[${identifier}][${cmsPrefix}][GOTTHEME] Query done`);
  // Attempt to import the variables module
  let variables = await retrieveVariables(identifier, siteTheme);

  log.trace(`${logPrefix()}[${identifier}][${cmsPrefix}][GOTTHEME] FINAL`);

  log.trace(`[${logPrefix()}][${identifier}][DEBUG] Mapping module loaded:`, mappingModule);
  log.trace(`[${logPrefix()}][${identifier}][DEBUG] Available keys in mapping module:`, Object.keys(mappingModule || {}));
  
  // if (!mappingModule) {
  //     throw new Error(`${logPrefix()} --- Mapping module could not be loaded for ${componentName}`);
  // }
  
  // if (!mappingModule.mapIdentifierData) {
  //     throw new Error(`${logPrefix()} --- mapIdentifierData is missing in mapping module for ${componentName}`);
  // }
  
  const { mapIdentifierData } = mappingModule;
  
  const { getQuery, query } = queryModule;

  return {
    identifier: identifier,
    mapIdentifierData,
    getQuery,
    query,
    variables,
  };
}

async function retrieveVariables(identifier: string, siteTheme: string) {
  let variables = (pageAndComponentCombo: PageAndSingleComponentDetails) => standardVariables(pageAndComponentCombo);
  try {
    log.trace(`${logPrefix()}[${identifier}] Attempting primary import for variables`);
    const varsModule = await import(`theme/default/components/${identifier}/variables`);
    if (varsModule && varsModule.variables) {
      variables = varsModule.variables;
    }
  } catch (primaryError) {
    log.trace(`${logPrefix()}[${identifier}] Primary import failed. Attempting fallback for variables`);
    variables = await retrieveSiteThemeVariables(siteTheme, identifier, variables);
  }
  return variables;
}

async function retrieveSiteThemeVariables(siteTheme: string, identifier: string, variables: (pageAndComponentCombo: PageAndSingleComponentDetails) => {}) {
  try {

    if(siteTheme === "default") {
      return await retrieveDefaultVariables(identifier, variables);
    }

    let fallbackVarsModule;
    switch (siteTheme) {
      case "deep-purple":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Variables] Site Theme ::: ${siteTheme} == deep-purple MATCH - attempting to load variables`);
        fallbackVarsModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/deep-purple/components/${identifier}/variables`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Variables] Site Theme ::: ${siteTheme} == deep-purple loaded variables`);
        break;
      case "light-blue":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Variables] Site Theme ::: ${siteTheme} MATCH - attempting to load `);
        fallbackVarsModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/light-blue/components/${identifier}/variables`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Variables] Site Theme ::: ${siteTheme} loaded variables module`);
    }

    if (fallbackVarsModule && fallbackVarsModule.variables) {
      variables = fallbackVarsModule.variables;
    }
  } catch (fallbackError) {
    log.trace(`${logPrefix()}[${identifier}] Site Theme ::: ${siteTheme} -- Fallback import failed for variables - ${(fallbackError as Error)?.message}. Using standardVariables.`);
    variables = await retrieveDefaultVariables(identifier, variables);
  }
  return variables;
}

async function retrieveDefaultVariables(identifier: string, variables: (pageAndComponentCombo: PageAndSingleComponentDetails) => {}) {
  try {
    const fallbackVarsModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/default/components/${identifier}/variables`);
    if (fallbackVarsModule && fallbackVarsModule.variables) {
      variables = fallbackVarsModule.variables;
    }
  } catch (fallbackError) {
    log.trace(`${logPrefix()}[${identifier}] Defaukt Theme ---Fallback import failed for variables - ${(fallbackError as Error)?.message}. Using standardVariables.`);
  }
  return variables;
}

async function retrieveQueryModule(identifier: string, cmsPrefix: string, siteTheme: string, componentName: string) {
  let queryModule: any;
  try {
    log.trace(`${logPrefix()}[${identifier}] Attempting primary import for query`);
    queryModule = await import(`theme/default/components/${identifier}/${cmsPrefix}-query`);
  } catch (primaryError) {
    log.trace(`${logPrefix()}[${identifier}] Primary import failed. Attempting fallback for query`);
    queryModule = await retrieveSiteThemeQuery(siteTheme, identifier, queryModule, cmsPrefix, componentName);
  }
  return queryModule;
}

async function retrieveSiteThemeQuery(siteTheme: string, identifier: string, queryModule: any, cmsPrefix: string, componentName: string) {
  try 
  {
    if(siteTheme === "default") {
      return await retrieveDefaultQuery(queryModule, identifier, cmsPrefix, componentName);
    }

    switch (siteTheme) {
      case "deep-purple":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Query] Site Theme ::: ${siteTheme} == deep-purple MATCH - attempting to load query`);
        queryModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/deep-purple/components/${identifier}/${cmsPrefix}-query`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Query] Site Theme ::: ${siteTheme} == deep-purple loaded query`);
        break;
      case "light-blue":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Query] Site Theme ::: ${siteTheme} MATCH - attempting to load `);
        queryModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/light-blue/components/${identifier}/${cmsPrefix}-query`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][Query] Site Theme ::: ${siteTheme} loaded query module`);
    }
  } catch (fallbackError) {
    log.trace(`${logPrefix()}[${identifier}] Site Theme :::: ${siteTheme} -- Fallback import failed for query - ${(fallbackError as Error)?.message}`);
    queryModule = await retrieveDefaultQuery(queryModule, identifier, cmsPrefix, componentName);
  }
  return queryModule;
}

async function retrieveDefaultQuery(queryModule: any, identifier: string, cmsPrefix: string, componentName: string) {
  try {
    queryModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/default/components/${identifier}/${cmsPrefix}-query`);
  } catch (fallbackError) {
    log.error(`${logPrefix()}[${identifier}] Default Theme -- Fallback import failed for query - ${(fallbackError as Error)?.message}`);
    throw new Error(`Could not import query for component '${componentName}'`);
  }
  return queryModule;
}

async function retrieveMappingModule(identifier: string, cmsPrefix: string, siteTheme: string, componentName: string) {
  let mappingModule: any;
  try 
  {
    log.trace(`${logPrefix()}[${identifier}]  Attempting primary import for mapping`);
    mappingModule = await import(`theme/default/components/${identifier}/${cmsPrefix}-mapping`);
  } catch (primaryError) {
    log.trace(`${logPrefix()}[${identifier}]  Primary import failed. Attempting fallback for mapping`);

    mappingModule = await retrieveSiteThemeMapping(siteTheme, identifier, mappingModule, cmsPrefix, componentName);
  }
  return mappingModule;
}

async function retrieveSiteThemeMapping(siteTheme: string, identifier: string, mappingModule: any, cmsPrefix: string, componentName: string) {
  try {
    if(siteTheme === "default") {
      return await retrieveDefaultMapping(mappingModule, identifier, cmsPrefix, componentName);
    }
    switch (siteTheme) {
      case "deep-purple":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][mapping] Site Theme ::: ${siteTheme} == deep-purple MATCH - attempting to load mapping`);
        mappingModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/deep-purple/components/${identifier}/${cmsPrefix}-mapping`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][mapping] Site Theme ::: ${siteTheme} == deep-purple loaded`);
        break;
      case "light-blue":
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][mapping] Site Theme ::: ${siteTheme} MATCH - attempting to load mapping`);
        mappingModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/light-blue/components/${identifier}/${cmsPrefix}-mapping`);
        log.trace(`${logPrefix()}[${identifier}][SITE-THEME][mapping] Site Theme ::: ${siteTheme} loaded mapping module`);
        break;
    }
    // mappingModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/${siteTheme}/components/${identifier}/${cmsPrefix}-mapping`);
  } catch (fallbackError) {
    log.trace(`${logPrefix()}[${identifier}] Site Theme ::: ${siteTheme} -- Fallback import failed for mapping - ${(fallbackError as Error)?.message}`);
    mappingModule = await retrieveDefaultMapping(mappingModule, identifier, cmsPrefix, componentName);
  }
  return mappingModule;
}

async function retrieveDefaultMapping(mappingModule: any, identifier: string, cmsPrefix: string, componentName: string) {
  try {
    log.trace(`${logPrefix()}[${identifier}][Default] -- Fallback import failed. Attempting to load default mapping`);
    mappingModule = await import(`@conversiondigital/cd-headless-component-lib/src/theme/default/components/${identifier}/${cmsPrefix}-mapping`);
  } catch (fallbackError) {
    log.error(`${logPrefix()}[${identifier}][Default] -- Fallback import failed for mapping - ${(fallbackError as Error)?.message}`);
    throw new Error(`Could not import mapping for component '${componentName}'`);
  }
  return mappingModule;
}

