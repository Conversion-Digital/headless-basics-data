import { PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";
import { GetHomepageVariant, GetMultiSiteSlugByIdentifier } from "../../cms/tools/urlTools";
import { LanguageSite } from "../../interfaces/LanguageSite";

export function variablesNavigationBase(pageAndComponentCombo: PageAndSingleComponentDetails) {
  // Regadless of the page type, we always want to get the homepage for navigation purposes
  let result: { slug: string } = { slug: "" };

  if (pageAndComponentCombo?.page?.pageIdentifier?.cmsType === "homepage") {
    result = {
      slug: GetMultiSiteSlugByIdentifier(
        pageAndComponentCombo?.page?.pageIdentifier,
        pageAndComponentCombo?.page?.languageSite as LanguageSite,
      ),
    };
  } else {
    result = { slug: GetMultiSiteSlugByIdentifier(GetHomepageVariant(), pageAndComponentCombo?.page?.languageSite as LanguageSite) }; // Get the homepage (not the current page
  }
  return result;
}