import { GetLanguageSiteByCode, GetMainSiteLanguage } from "../cms/tools/urlTools";
import { LanguageSite } from "../interfaces/LanguageSite";
import { getLogger } from "./logging/LogConfig";
import { GetSite } from "./siteContextService";

const log = getLogger("headless.services.languageService");

// Please Read: https://expiadev.atlassian.net/wiki/spaces/HP/pages/3692363790/Language+Sites+and+URL+Construction
// This function processes slugs that come directly from the CMS to identify a path. 
// For instance in an Umbraco language site setup, the slug will be prefixed with the language site prefix:
// The function detects the prefix being used and will return the LanguageSite object that matches the prefix.
export async function GetLanguageSiteByURL(cmsSlug:string):Promise<LanguageSite>{

    if(!cmsSlug){
      const mainContryCode = await GetMainSiteLanguage();
      const languageSite = await GetLanguageSiteByCode(mainContryCode);
      if (!languageSite) {
        throw new Error("Main site language could not be determined");
      }
      return languageSite;
    }

    let languageSite;
    log.trace('GetLanguageSiteByURL cmsSlug', cmsSlug);
    const languages = GetSite().languageSites;
    if(languages.findIndex(x => cmsSlug.startsWith(x.countryCode) || cmsSlug.startsWith('/'+x.countryCode)) > -1){
      languageSite = languages.find(x => cmsSlug.startsWith(x.countryCode)  || cmsSlug.startsWith('/'+x.countryCode));
      if (languageSite) {
        cmsSlug = cmsSlug.replace(languageSite.homepageSlugPrefix, '/').replace(languageSite.countryCode, '');
      }
    }else {
      const mainContryCode = await GetMainSiteLanguage();
      languageSite = await GetLanguageSiteByCode(mainContryCode);
    } 

    log.trace('GetLanguageSiteByURL ', languageSite, cmsSlug);

    // if (!languageSite) {
    //     throw new Error("Language site could not be determined");
    // }
    // return languageSite;
}