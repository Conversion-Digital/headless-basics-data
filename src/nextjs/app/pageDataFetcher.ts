import { PageBlueprint, PageDefinition } from "../../interfaces/PageDefinition";
import { getLogger } from "../../services/logging/LogConfig";
import { GetSite } from "../../services/siteContextService";
import { cleanSlug, isIgnoredSlug } from "../../utils/slugHelper";
import {
  GetLanguageSiteByCode,
  GetMainSiteLanguage,
} from "../../cms/tools/urlTools";
import { logPrefix } from "../../utils";
import {
  buildPageData,
} from "../../services/data/buildPageData"; // LEGACY (REMAINS FOR BACKWARD COMPATIBILITY)
import { getLogger as oldLogger } from "../../services/logging/LogConfig";
import { buildPageDataWithNewPipeline } from "../../services/data/pageDataBuilderService";

export interface IPageDataParams {
  slug: string[];
  source: string;
}

// Using the same array from existing code
const imageFileExtensions = [".jpg", ".jpeg", ".png", ".gif"];

/**
 * Handles the special case of fetching homepage data.
 * @param pageConstruction - Page construction details.
 * @param log - Logger instance for logging errors and debug information.
 * @returns PageBlueprint or null if language site is invalid.
 */
const handleHomepageCase = async (
  pageConstruction: PageDefinition,
  log: ReturnType<typeof getLogger>
): Promise<PageBlueprint | null> => {
  const { languageSite } = pageConstruction;

  // Ensure the language site exists before proceeding.
  if (!languageSite) {
    log.error(`${logPrefix()} Language site is null for homepage.`);
    return null;
  }

  // Convert the preliminary slug to a CMS URL.
  const cmsUrl = (await browserUrlToCmsUrlConverter(pageConstruction.preliminarySlug as string)).cmsUrl;

  log.trace(`${logPrefix()} cmsUrl: ${cmsUrl}`);

  pageConstruction.pageIdentifier = {
    pageVariant: "home",
    backEndSlug: cmsUrl,
    frontEndSlug: pageConstruction.preliminarySlug,
    identifier: undefined,
    cmsType: undefined,
    isFixedLayout: false,
  };

  return buildPageData(pageConstruction);
};

/**
 * Handles fetching data for dynamic pages.
 * @param pageConstruction - Page construction details.
 * @returns PageBlueprint containing the data for the dynamic page.
 */
const handleDynamicPageCase = async (pageConstruction: PageDefinition): Promise<PageBlueprint | null> => {
  // Convert the preliminary slug to a CMS URL.
  const cmsUrl = (await browserUrlToCmsUrlConverter(pageConstruction.preliminarySlug as string)).cmsUrl;

  pageConstruction.pageIdentifier = {
    pageVariant: 'subComponentsPage',
    backEndSlug: cmsUrl,
    frontEndSlug: pageConstruction.preliminarySlug,
    cmsType: 'subComponentsPage',
    isFixedLayout: false,
  };

  return await collectDynamicPageData(pageConstruction);
};

// Legacy function from pageDataProvider
import { browserUrlToCmsUrlConverter, collectDynamicPageData } from "../../services/data/pageDataProvider";

/**
 * Fetches page data based on given parameters.
 * @param params - Parameters including `slug` and `source`.
 * @returns PageBlueprint or null if the page should not be rendered.
 */
export const fetchPageData = async (params: IPageDataParams): Promise<PageBlueprint | null> => {
  const log = getLogger(`headless.nextjs.app.pageDataFetcher.slug.${params?.slug}`);
  const siteLanguage = await GetMainSiteLanguage();

  // NEW SWITCH
  if (process.env.USE_NEW_PAGE_BUILDER === "true") {
    // If the environment variable is set, use the new pipeline
    return buildPageDataWithNewPipeline(params);
  }

  // Otherwise, the old legacy code path
  if (!GetSite().shouldRenderAllPages()) {
    log.debug(`${logPrefix()} Rendering of all pages is disabled.`);
    return null;
  }

  // Retrieve the language site based on the site language.
  const languageSite = await GetLanguageSiteByCode(siteLanguage);
  const slug = cleanSlug(params.slug);

  // Check for image file extensions and skip processing if found.
  if (imageFileExtensions.some((ext) => slug.endsWith(ext))) {
    log.debug(`${logPrefix()} Slug contains an image file extension, skipping: ${slug}`);
    return null;
  }

  // Skip processing if the slug is in the ignored list.
  if (isIgnoredSlug(slug)) {
    log.debug(`${logPrefix()} Ignored slug detected: ${slug}`);
    return null;
  }

  // Determine the source context for logging purposes.
  const sourceContext = (slug === '/' ? 'Homepage' : 'Dynamic');
  // Construct the base `PageDefinition` object.
  const pageConstruction: PageDefinition = {
    preliminarySlug: slug,
    pageIdentifier: {
      pageVariant: "home",
      backEndSlug: undefined,
      frontEndSlug: undefined,
      cmsType: undefined,
      isFixedLayout: false,
    },
    languageSite: languageSite || undefined,
    isDynamic: slug !== '/',
    source: `${params.source} || Extra: ${sourceContext}`,
  };

  // Handle homepage and dynamic pages separately.
  if (slug === '/') {
    log.trace(`${logPrefix()} Handling homepage case. slug: ${params?.slug}`);
    return await handleHomepageCase(pageConstruction, log);
  }

  return await handleDynamicPageCase(pageConstruction);
};