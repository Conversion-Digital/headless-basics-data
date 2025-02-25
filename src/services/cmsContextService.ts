import { CmsVariant, CmsVariants, CmsVariantType } from "../cms/constants";
import { BrowserUrl } from "../interfaces/BrowserUrl";
import { PageDefinition } from "../interfaces/PageDefinition";
import { PageIdentifier } from "../interfaces/PageIdentifier";
import { logPrefix } from "../utils/logPrefix";
import { browserUrlToCmsUrlConverter } from "./data/pageDataProvider";
import { getLogger } from "./logging/LogConfig";
import { getPageTypeBySlug } from "./model/getPageTypeBySlug";
import { GetSite } from "./siteContextService";

const log = getLogger("headless.cmsContextService");

export function GetCMS(): CmsVariantType {
  const cmsVariant = process.env.NEXT_PUBLIC_CMS_VARIANT as CmsVariantType;
  return cmsVariant;
}

export function GetCMSVariant(): CmsVariant {
  return CmsVariants.variants[GetCMS()];
}

export function getSpecialCasePageVariant(): PageIdentifier {
  const specialCasePageIdentifier: PageIdentifier = {
    identifier: "special-case-id",
    pageVariant: "special-case",
    backEndSlug: "",
    frontEndSlug: "",
    cmsType: "",
    isFixedLayout: false,
  };
  return specialCasePageIdentifier;
}

export async function GetPageIdentifier(pageVariant: string): Promise<PageIdentifier | null> {
    try {

        // Handle the special-case immediately
        if (pageVariant === 'special-case') {
            log.trace(`${logPrefix()} > Handling special-case variant`);
            return getSpecialCasePageVariant();
        }

        const CMSVariant = await GetCMSVariant();

        if (!CMSVariant || !CMSVariant.pageTypes) {
            log.warn(`${logPrefix()}Invalid CMS Variant or no pageTypes found`);
            return null;
        }

        const pageIdentifier = CMSVariant.pageTypes[pageVariant] as PageIdentifier;

        if (!pageIdentifier) {
            log.trace(`${logPrefix()} GetPageIdentifier > pageIdentifier not found for variant: ${pageVariant}`);
            const site = GetSite();
            if (!site || !site.extraPageTypes) {
                log.warn(`${logPrefix()}Invalid site or settings, or no extraPageTypes found`);
                return null;
            }

            const matches = site.extraPageTypes.filter((x) => x.pageVariant === pageVariant);
            if(matches.length > 0){
                log.trace(`${logPrefix()}Match found in extraPageTypes for variant: ${pageVariant}`);
                return matches[0] as PageIdentifier;
            } else {
                log.trace(`${logPrefix()}No match found in extraPageTypes for variant: ${pageVariant}`);
                return null;
            }
        }
        // Returns a deep copy of pageIdentifier using JSON parse/stringify to avoid mutation
        return JSON.parse(JSON.stringify(pageIdentifier));
    } catch (error) {
        if (error instanceof Error) {
            log.error(`${logPrefix()}An error occurred: ${error.message}`);
        } else {
            log.error(`${logPrefix()}An unknown error occurred`);
        }
        return null;
    }
}


export async function getPageIdentifierBySlug(slug: any) {

    log.trace(`${logPrefix()} [Point1] ${slug}`);
    const { cmsUrl, languageSite }: BrowserUrl = await browserUrlToCmsUrlConverter(slug);

    log.trace(`${logPrefix()} [Point2] ${slug}`);
    // subComponentPage, ProductPag, etc
    const pageConstruction:PageDefinition = {
        preliminarySlug: slug,
        languageSite,
        pageIdentifier: { pageVariant: "subComponentsPage", backEndSlug: cmsUrl, frontEndSlug: slug, identifier: undefined, cmsType: "subComponentsPage", isFixedLayout: false },
        isDynamic: undefined,
        source: `getPageIdentifierBySlug(${slug})`
    }

    const resultPage = await getPageTypeBySlug(pageConstruction);
    log.trace(`${logPrefix()}[Point3] ${slug}`);
    const pageIdentifier = await GetPageIdentifier(resultPage?.contentTypeAlias);

    log.trace(`${logPrefix()}[Point4] ${slug}`);
    if(cmsUrl === undefined){
        log.error(`${logPrefix()} > cmsUrl: ${cmsUrl} > ${slug}`);
    }
    log.trace(`${logPrefix()}[Point5]`);
    if(!pageIdentifier){
        log.error(`${logPrefix()} > pageIdentifier is null | cmsUrl: ${cmsUrl} > ${slug}`);
    }

    if(pageIdentifier && !(pageIdentifier?.backEndSlug))
    {
        pageIdentifier.backEndSlug = cmsUrl;
    }
    log.trace(`${logPrefix()}[Point6] ${slug}`);
    return { pageIdentifier, cmsUrl, languageSite };
}