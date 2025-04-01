import { ThemeConfig, QueryFn, ViewFn, VariablesFn, MapIdentifierDataFn } from "./ThemeConfig.interface";

export interface QueryResult {
  componentDocumentation?: string;
  youtubeVideo?: string;
  lastUpdated?: string;
  order?: "Top" | "Bottom";
  [key: string]: unknown;
}

export interface SitemapQueryResult extends QueryResult {
  superAlias: string;
  url: string;
}

export interface DynamicFileModuleDetails {
  cmsPrefix: string;
  identifier: string; // The identifier of the component __type

  failedToFind: boolean;

  queryString: string; // This is the graphql Query retrieved from the module
  query?: QueryFn; // This is the object representation of the query from the module
  matchingPath: string; // This is the valid path the query was retrieved from.
  queryResult: unknown; // This is the resulting object that comes from the Graphql Query

  moduleX?: ThemeConfig; // This is the loaded module.

  variableFunc?: VariablesFn; // Used to reference the variable function from the loaded query module.
  dataMapper?: MapIdentifierDataFn; // Used to reference the data mapping function from the loaded query module.

  variables?: unknown; // Used to hold the loaded variabled of the module after callin the variables functions

  data?: unknown; // This is the raw data from the GraphQL API
  result?: QueryResult; // This is the data that comes back as a result of the call the GraphQL Query. This is the data field refined by the dataMapper Function in the module.
  view?: ViewFn; // This is the view that will be rendered for the component.
  useCache?: boolean;

  theme: string;
}
