import { getLogger } from "./logging/LogConfig";
import { collectSitemapNavigationStructure } from "./data/collectSitemapNavigationStructure";
import { Path } from "../interfaces/url/path";
import { logPrefix } from "../utils/logPrefix";

const log = getLogger("headless.services.components.routeProviderService");

export async function filterOutDataOrComponentFolders(paths: any[]) {
  // Remove empty slugs as they conflict with the homepage. Also remove any _data folders, as the are not renderable pages
  paths = paths.filter((x) => {
    if (x.slug.length > 0) {
      const slugLength = x.slug.length;
      if (slugLength > 0) {
        log.trace("collectAllRoutes > paths > slugLength > ", slugLength, x.slug);
        // check is the slug array has an entry that starts with an underscore
        const containsUnderscores = x.slug.some((slug: string) => slug.startsWith("_"));
        if (containsUnderscores) {
          return false;
        } else {
          return true;
        }
      }
    }
  });
  return paths;
}

export async function collectAllRoutes(): Promise<Path[]> {
  const data = await collectSitemapNavigationStructure("sitemap", "collectAllRoutes()");
  log.trace(`${logPrefix()} collectAllRoutes > data > ${JSON.stringify(data)}`);
  let paths: Path[] = [];
  data.map((page: { superAlias: string; url: string }) => {
    if (page.superAlias && page.superAlias != "") {
      let parts = page.superAlias.split("/");
      parts = parts.filter((x) => x != "");
      paths.push({ slug: parts });
    } else {
      if (page.url) {
        let parts = page.url.split("/");
        parts = parts.filter((x) => x != "");
        if (parts.length > 0) {
          if (parts[0] !== "global-settings") {
            paths.push({ slug: parts });
          }
        }
      }
    }
  });

  log.trace("collectAllRoutes > paths > ", paths);
  paths = await filterOutDataOrComponentFolders(paths);
  log.trace("collectAllRoutes > paths > after filtering ", paths);

  return paths;
}
