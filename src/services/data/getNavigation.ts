import { cache } from 'react'
import { GetLanguageSiteByCode } from '../../cms/tools/urlTools'
import { GetPageIdentifier } from '../cmsContextService'
import { CountryCode } from '../../cms/constants'
import { PageDefinition } from '../../interfaces/PageDefinition'
import { getNavItems } from './commonData'

export const getNavigation = cache(async (countryCode: string) => {
    const languageSite =  await GetLanguageSiteByCode(countryCode as CountryCode);
    if (!languageSite) {
        throw new Error("Language site is null");
    }
    const pageIdentifier = await GetPageIdentifier("home");
    if (!pageIdentifier) {
        throw new Error("Page identifier is null");
    }
    const pageConstruction:PageDefinition = {
        preliminarySlug: "",
        languageSite,
        pageIdentifier: pageIdentifier,
        isDynamic: undefined,
        source: `getNavigation(${countryCode})`
    }
    const navItems = await getNavItems(pageConstruction);
    return navItems;
})


export const preload = (countryCode: string) => {
  void getNavigation(countryCode)
}
