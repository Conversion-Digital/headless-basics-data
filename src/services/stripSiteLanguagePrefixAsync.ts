import { GetLanguageSiteByURL } from "./languageService";
import { stripSiteLanguagePrefix } from "./urlService";


export async function stripSiteLanguagePrefixAsync(url: string) {
    const languageSite = await GetLanguageSiteByURL(url);
    return stripSiteLanguagePrefix(url, languageSite);
}
