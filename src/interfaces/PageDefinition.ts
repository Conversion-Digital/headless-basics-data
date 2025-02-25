import { DynamicDataCmsProperties } from "../cms/constants";
import { LanguageSite } from "./LanguageSite";
import { INavItem } from "./nav";
import { PageIdentifier } from "./PageIdentifier";
import { SeoItems } from "./SeoServices";
import { SiteSettings } from "./SiteSettings";
import { ViewFn } from "./ThemeConfig.interface";

export interface PageBlueprint {
  siteSettings?: SiteSettings;
  pageData?: PageDefinition;
  navItems?: INavItem[];
  seoItems?: SeoItems;
  breadcrumbItems?: any;
  footerItems?: unknown[];
  stickyNavItems?: unknown[];
  sitemapData?: unknown[];
  components?: IndividualComponentProps[];
}

export interface PageDefinition {
  preliminarySlug?: string; // This variable is used to store the slug before the pageIdentifier is created, after that the front end and backend slugs are used.
  pageIdentifier: PageIdentifier;
  isDynamic?: boolean;
  languageSite?: LanguageSite;
  source: string; // This is for debugging purposes, to locate the calling page or function
}

export interface PageAndSingleComponentDetails {
  component: IndividualComponentProps; // This variable is used to store the slug before the pageIdentifier is created, after that the front end and backend slugs are used.
  page: PageDefinition;
}

export type componentData = {
  order?: 'Top' | 'Bottom';
  [key: string]: unknown;
}

export interface IndividualComponentProps {
  id?: string;
  udi?: string;
  identifier: string;
  sortOrder: number;
  useCache?: boolean;
  variableForQuery?: unknown | undefined;
  data?: componentData;
  useUrlForVariableFunction?: boolean;
  // useUrlForQuery?: boolean;
  // usePageIdentifierForQuery?: boolean;
  pageDefinition?: PageDefinition;
  view?: ViewFn;

  metaData?: ComponentMetaData;
  subComponentOutline?: SubComponentOutline; // The sub component definition is the outline of the components from a single query.  These all need to be loaded properly
}

export interface ComponentMetaData {
  url: string;
  typeName: string;
  id: string;
  rendering: string;
  variant: string;
  name: string;
  queryFileLocation: string;
  query: string;
  liveDocumentation: string;
  youtubeVideo: string;
  renderingExportFunction: string;
  isInsideGrid: boolean;
  lastUpdated?: string;
  isClientSide: boolean;
  languageSite?: LanguageSite;
}

export interface SubComponentOutline {
  order: unknown;
  __typename: string;
  id: string;
  name: string;
  url: string;
  variant?: string;
  sortOrder: number;
  baseComponentDefinition: DynamicDataCmsProperties; // This is the definition of the component without the data
}
