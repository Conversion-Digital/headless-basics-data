import { getPageIdentifierBySlug } from "../../services/cmsContextService";
import { getLogger } from "../../services/logging/LogConfig";
import { seoExtractor } from "../../services/seoRendererService";
import { GetSite } from "../../services/siteContextService";
import { logPrefix } from "../../utils";
import { cleanSlug, isIgnoredSlug } from "../../utils/slugHelper";
import { Metadata } from "next";

export interface IMetadataParams {
  slug: string[];
}

/**
 * Fetches metadata for a given slug.
 * @param params - Metadata fetch parameters.
 * @returns Metadata object.
 */
export const fetchMetadata = async ({ slug }: IMetadataParams): Promise<Metadata> => {
  const log = getLogger(`headless.nextjs.app.metadataFetcher.slug. ${slug}`);

  const cleanedSlug = cleanSlug(slug);
  const site = GetSite();

  if (typeof site === "undefined") {
    throw new Error(`${logPrefix()} fetchMetadata -  Site is not defined`);
  }

  if (!slug || slug.length === 0 || isIgnoredSlug(cleanedSlug)) {
    log.trace(`${logPrefix()} Returning default metadata for homepage or ignored slug.`);
    return {
      title: "Homepage",
      description: "Welcome to the homepage!",
      openGraph: {
        title: "Homepage",
        description: "Welcome to the homepage!",
      },
    };
  }

  const { pageIdentifier, cmsUrl } = await getPageIdentifierBySlug(cleanedSlug);

  if (!pageIdentifier || !cmsUrl) {
    log.warn(`${logPrefix()} Page not found for slug ${cleanedSlug}`);
    return {};
  }

  return await seoExtractor(cmsUrl, pageIdentifier);
};
