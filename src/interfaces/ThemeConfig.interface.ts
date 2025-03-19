import { IndividualComponentProps, PageAndSingleComponentDetails, PageBlueprint } from "./PageDefinition";

export type QueryFn = (pageAndComponentCombo: PageAndSingleComponentDetails) => string;
export type GetQueryFn = () => QueryFn;
export type ViewFn = (dynamicComponent: ViewComponentProps) => React.ReactNode;
export type MapIdentifierDataFn = (pageAndComponentCombo: PageAndSingleComponentDetails) => unknown;
export type VariablesFn = (pageAndComponentCombo: PageAndSingleComponentDetails) => unknown;

export interface ThemeConfig {
  identifier: string;
  mapIdentifierData: MapIdentifierDataFn;
  getQuery: GetQueryFn;
  query: QueryFn;
  variables: VariablesFn;
  view?: ViewFn;
  // more config properties
  [key: string]: any; // This will allow dynamic key access
}

export interface ViewComponentProps {
  blueprint?: PageBlueprint;
  componentDetails: IndividualComponentProps;
}

export enum ConfigKeysEnum {
  identifier = "identifier",
  mapIdentifierData = "mapIdentifierData",
  getQuery = "getQuery",
  query = "query",
  variables = "variables",
  view = "view",
}
