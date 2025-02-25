import { getLogger } from "./logging/LogConfig";
import { logPrefix } from "../utils/logPrefix";
import { SiteSettings } from "../interfaces/SiteSettings";
import { BaseSiteConfig } from "../interfaces/baseSiteConfig";

const log = getLogger("page.siteContextService");

declare global {
  // eslint-disable-next-line no-var
  var myGlobalSiteHolder: SiteSettings | undefined;
}

export function GetSite(): SiteSettings {
  if (typeof global.myGlobalSiteHolder === "undefined") {
    log.trace(`${logPrefix()} The site variable is not defined`);
    throw new Error("myGlobalSiteHolder is not defined");
  }
  // log.trace(`${logPrefix()} Getting site`, global.myGlobalSiteHolder);
  return global.myGlobalSiteHolder;
}

export async function GetSiteConfig(): Promise<BaseSiteConfig> {
  if (typeof global.myGlobalSiteHolder === "undefined") {
    throw new Error("myGlobalSiteHolder is not defined");
  }
  return global.myGlobalSiteHolder.siteConfig;
}
