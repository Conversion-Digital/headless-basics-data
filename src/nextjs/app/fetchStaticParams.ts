import { GetMainSiteLanguage } from "../../cms/tools/urlTools";
import { LanguageSite } from "../../interfaces/LanguageSite";
import { getLogger } from "../../services";
import { GetSite } from "../../services";
import { collectAllRoutes } from "../../services/routeProviderService";
import { logPrefix } from "../../utils";

export interface IPath {
  slug: string[];
}

/**
 * Fetches static paths for pre-rendering based on the site's configuration.
 * @returns Array of paths with slugs.
 */
export const fetchStaticParams = async (): Promise<IPath[]> => {
  const log = getLogger(`headless.nextjs.app.fetchStaticParams`);
  const site = GetSite();

  if (typeof site === "undefined") {
    throw new Error(`${logPrefix()} fetchStaticParams -  Site is not defined`);
  }

  log.debug(`Fetching static parameters for site: ${site.id}`);

  // If the site is configured not to render all pages, return an empty array
  if (!site.shouldRenderAllPages()) {
    const mainSiteLanguage = await GetMainSiteLanguage();
    log.debug(`${logPrefix()} getStaticPaths ${mainSiteLanguage} paths`, 0);
    return [];
  }

  const languageSites = site.languageSites;

  // Collect routes for all language sites
  const pathsArray = await Promise.all(
    languageSites.map(async (languageSite: LanguageSite) => {
      try {
        return await collectAllRoutes();
      } catch (error) {
        log.error(`${logPrefix()} Error in generateStaticParams for languageSite > ${JSON.stringify(languageSite)}, Error: ${error}`);
        // Print out the stack trace
        if (error instanceof Error) {
          log.error(`${logPrefix()} Error in generateStaticParams for languageSite >  Error: ${error.stack}`);
        }
        return [];
      }
    }),
  );

  // Flatten the nested array of paths
  let paths: IPath[] = pathsArray.flat();

  // Add the homepage route
  paths.push({ slug: [""] });

  // Filter out specific paths for production mode
  const isProduction = process.env.NEXT_PUBLIC_AUTHOR_MODE === "false";
  if (isProduction) {
    paths = paths.filter((path) => !path.slug.includes("library"));
  }

  log.debug(`${logPrefix()} Total paths fetched: ${paths.length}`);
  return paths;
};
