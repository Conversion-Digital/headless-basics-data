import { FileLookupResult } from "./FileLookupResult";

export interface GraphQLQueryLookupResult {
  result: unknown;
  fileLookupResult: FileLookupResult;
}
