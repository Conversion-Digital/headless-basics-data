import { IndividualComponentProps, PageAndSingleComponentDetails } from "../interfaces/PageDefinition";
import { LanguageSite } from "../interfaces/LanguageSite";
import { PageIdentifier } from "../interfaces/PageIdentifier";
import { logPrefix } from "../utils/logPrefix";
import { initializeComponentProps } from "./components/componentConstructionPropsService";
import { getDynamicCmsDataViaCmsSelector } from "./data/graphqlDataService";
import { getLogger } from "./logging/LogConfig";
import { stripSiteLanguagePrefix } from './urlService';


const log = getLogger("headless.services.components.urlService");

export async function findAliasMatch(url: string) {
  log.trace(`${logPrefix()}[findAliasMatch][1][${url}]`)

  const component: IndividualComponentProps = initializeComponentProps("alias")
  component.useCache = true

  const pageIdentifier: PageIdentifier = {
    backEndSlug: url,
    frontEndSlug: url,
    identifier: undefined,
    pageVariant: "special-case",
    cmsType: "alias",
    isFixedLayout: false,
  }
  component.variableForQuery = "robots.txt"
  const page: PageAndSingleComponentDetails = {
    component,
    page: { pageIdentifier: pageIdentifier, source: `findAliasMatch(${url})` },
  }

  log.trace(`${logPrefix()}[findAliasMatch][3][${url}]`)
  const aliasResult = await getDynamicCmsDataViaCmsSelector(page)

  const alias = aliasResult.result || undefined

  log.trace(`${logPrefix()}[findAliasMatch][4][${url}] > ${alias}`)

  return alias
}


// Please Read: https://expiadev.atlassian.net/wiki/spaces/HP/pages/3692363790/Language+Sites+and+URL+Construction
// This function accepts the CMS URL unprocessed.
export async function processURLForNavigationServer(url: string, languageSite: LanguageSite) {

  log.trace(`${logPrefix()}[processURLForNavigationServer][0][${url}]`);

  // Do not process external links
  if (url.startsWith('http') || url.startsWith('tel')){
      log.trace(`${logPrefix()}[processURLForNavigationServer][1][${url}] > External link, skipping processing`);
      return url;
  }
  url = stripSiteLanguagePrefix(url, languageSite);
  log.trace(`${logPrefix()}[processURLForNavigationServer][2][${url}] stripped`);
  if (languageSite?.specialSlugPrefix) {
      const valueToRemove = languageSite.specialSlugPrefix.replace(/\/+/g, '');
      log.debug("languageSite.specialSlugPrefix value", valueToRemove, url);
      url = url.replace(valueToRemove, '');
      log.trace(`${logPrefix()}[processURLForNavigationServer][3][${url}] specialSlugPrefix removed`);
  }

  if (languageSite?.shouldLanguageCodeBeAddedToNav && !url.startsWith("/" + languageSite.countryCode)) {
      url = `/${languageSite.countryCode}${url}`;
      log.trace(`${logPrefix()}[processURLForNavigationServer][4][${url}] countryCode added`);
  }

  const aliasResult = await findAliasMatch(url);
  if(aliasResult){
      log.trace(`${logPrefix()}[processURLForNavigationServer][5][${url}] > Alias ${aliasResult}`);
      return aliasResult;
  }else {
      log.trace(`${logPrefix()}[processURLForNavigationServer][6][${url}] > url results ${url}`);
      return url;
  }
}