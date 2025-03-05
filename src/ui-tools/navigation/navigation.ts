import { PageAndSingleComponentDetails } from "../../interfaces/PageDefinition";
import { GetHomepageVariant, GetMultiSiteSlugByIdentifier } from "../../cms/tools/urlTools";
import { LanguageSite } from "../../interfaces/LanguageSite";
import { getLogger } from "../../services";
import { logPrefix } from "../../utils/logPrefix";

const log = getLogger("headless.uitools.navigation");

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

  log.trace(`${logPrefix()}[seo][sanity-query][query] called for slug: ${JSON.stringify(result)}`)

  return result;
}