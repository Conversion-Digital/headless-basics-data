import { LanguageSite } from "../../interfaces/LanguageSite";
import { PageIdentifier } from "../../interfaces/PageIdentifier";
import { GetCMS } from "../../services/cmsContextService";
import { getLogger } from "../../services/logging/LogConfig";
import { GetSite } from "../../services/siteContextService";
import { logPrefix } from "../../utils/logPrefix";
import { CmsVariants, CountryCode } from "../constants";
const log = getLogger("headless.hearcore.tools.urlTools");

export async function GetLanguageSiteByCode(code: CountryCode): Promise<LanguageSite | null> {
  const cmsVariant = GetCMS();
  log.trace(`${logPrefix()} cmsVariant == ${cmsVariant} code == ${code}`);

  const match = GetSite().languageSites.filter((x) => x.countryCode === code);
  log.trace(`${logPrefix()} match == ${JSON.stringify(match)}`);
  if (match.length > 0) {
    return match[0] as LanguageSite;
  }
  log.trace(`${logPrefix()} No match found for language site with code: ${code}`);
  return null;
}

export async function GetMainSiteLanguage(): Promise<CountryCode> {
  const cmsVariant = GetCMS();
  log.trace(`${logPrefix()} cmsVariant == ${cmsVariant}`);
  const countryCode = GetSite().mainSiteLanguage as CountryCode;
  log.trace(`${logPrefix()} countryCode == ${countryCode}`);
  return countryCode;
}

export function GetHomepageVariant(): PageIdentifier {
  const cmsVariant = GetCMS();
  const cmsVariantSelected = CmsVariants.variants[cmsVariant];
  const pageIdentifier = cmsVariantSelected.pageTypes["home"] as PageIdentifier;
  return pageIdentifier;
}

function processSlug(slug: string, languageSite?: LanguageSite) {
  const prefix = languageSite?.homepageSlugPrefix;
  const originalSlug = slug;
  //console.log("process ----------", slug, originalSlug, prefix);
  slug = prefix + "/" + slug;
  slug = slug.replace(/\/+/g, "/");

  // If the prefix is not empty, and the slug is equal to languageSite control slug, then we are on the country homepage
  if (prefix && prefix != "" && originalSlug == languageSite?.countryCode) {
    slug = prefix;
    //console.log("process 1 ----------", slug, originalSlug, prefix);
  } else if (prefix && prefix != "" && originalSlug !== languageSite?.countryCode) {
    // We are on a sub page.
    //console.log("process 2 ---------- before", slug, originalSlug, prefix);
    if (slug.startsWith(prefix + prefix)) {
      //console.log("scenario one");
      slug = slug.replace(prefix + prefix, prefix); // Example. 
    } else {
      slug = slug.replace(prefix + "/" + languageSite?.countryCode, prefix); // Example. Before: /au-homepage/au/search ->  After: /au-homepage/search
    }
    //console.log("process ---------- after", slug);
  }

  if (GetCMS() == "heartcore" && typeof languageSite?.specialSlugPrefix != "undefined") {
    //console.log("heartcore only ----- ", slug);
    slug = `${languageSite?.specialSlugPrefix}/${slug}`;
  }

  slug = slug.replace(/\/+/g, "/");
  return slug;
}

export function isGuid(value: string) {
  const guidRegexWithHyphens = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const guidRegexWithoutHyphens = /^[0-9a-f]{32}$/i;
  return guidRegexWithHyphens.test(value) || guidRegexWithoutHyphens.test(value);
}

export function stripPTags(input: string): string {
  return input.replace(/<p>|<\/p>/g, "");
}

export function GetMultiSiteSlugByIdentifier(pageIdentifier: PageIdentifier, languageSite?: LanguageSite) {
  if (typeof pageIdentifier?.backEndSlug === "undefined") {
    throw new Error(`${logPrefix()}[URLTools] PageIdentifier backEndSlug is undefined`);
  }

  return processSlug(pageIdentifier?.backEndSlug, languageSite);
}

export function GetMultiSiteSlug(slug: string, languageSite?: LanguageSite) {
  if (typeof slug === "undefined") {
    throw new Error(`${logPrefix()}[URLTools] slug is undefined`);
  }

  return processSlug(slug, languageSite);
}
