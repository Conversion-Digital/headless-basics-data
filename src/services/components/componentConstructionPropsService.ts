import { IndividualComponentProps, PageDefinition } from "../../interfaces/PageDefinition";
export function initializeComponentProps(identifier: string, pageConstructionProps?: PageDefinition): IndividualComponentProps {
  const component: IndividualComponentProps = {
      identifier: identifier,
      sortOrder: 0,
      useCache: false,
      useUrlForVariableFunction: false,
      // useUrlForQuery: false,
      // usePageIdentifierForQuery: false,
      pageDefinition: pageConstructionProps,
  }

  return component;
}
