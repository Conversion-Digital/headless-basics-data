import { CountryCode } from "../cms/constants";

export interface LanguageSite {
  countryCode: CountryCode;
  homepageSlugPrefix: string;
  specialSlugPrefix?: string; // Needed for heartcore and potentially other CMSs
  shouldLanguageCodeBeAddedToNav: boolean;
}
