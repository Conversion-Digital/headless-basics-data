import { CountryCode } from "../cms/constants";
import { LanguageSite } from "./LanguageSite";
import { PageIdentifier } from "./PageIdentifier";
import { EcommerceSettings } from "./EcommerceSettings";
import { PageSettings } from "./PageSettings";
import { BaseSiteConfig } from "./baseSiteConfig";
import { SiteComponents } from "./SiteComponentsInterface";

export interface SiteSettings {
  logo: unknown;
  name: string;
  id: string;
  description: string;

  mainSiteLanguage: CountryCode;
  languageSites: LanguageSite[];
  extraPageTypes: PageIdentifier[];
  ecommerceSettings?: EcommerceSettings;
  hideStoreButtons: boolean;
  siteConfig: BaseSiteConfig;
  deepSearchNavigation?: boolean;
  pageSettings?: PageSettings;

  fixedLayouts: SiteComponents;

  getSiteComponents(): SiteComponents;
  getSiteSettings(): SiteSettings;
  shouldRenderAllPages(): boolean;
  shouldAbortPageDataCollection(): boolean;
}
