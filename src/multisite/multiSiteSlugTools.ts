import { GetMultiSiteSlug, GetMultiSiteSlugByIdentifier } from "../cms/tools/urlTools";
import { LanguageSite } from "../interfaces/LanguageSite";
import { PageIdentifier } from "../interfaces/PageIdentifier";
import { GetCMS } from "../services/cmsContextService";
import { getLogger } from "../services/logging/LogConfig";

const log = getLogger("headless.graphql.heartcore.common.multiSite");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sanitiseForKontent(result: { slug: string }): { slug: string } {
  throw new Error("Function not implemented.");
}

export function variablesMultiSiteSlug(slug: string, languageSite?: LanguageSite) {
  log.trace("variablesMultiSiteSlug > ", slug, languageSite);

  if (slug.indexOf("/global-components") > -1) {
    return { slug: slug };
  }

  let result = { slug: GetMultiSiteSlug(slug, languageSite) };
  if (GetCMS() == "kontent") {
    result = sanitiseForKontent(result);
  }
  return result;
}

export function variablesMultiSiteByIdentifier(pageIdentifier: PageIdentifier, languageSite?: LanguageSite) {
  return { slug: GetMultiSiteSlugByIdentifier(pageIdentifier, languageSite) };
}

export function variablesByName(name: string) {
  const result = { name: name };
  return result;
}

export function variablesById(id: string) {
  const result = { id: id };
  return result;
}
