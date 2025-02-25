import { IndividualComponentProps, PageBlueprint } from "./PageDefinition";

export interface DynamicComponentProps {
  blueprint?: PageBlueprint;
  componentInformation: IndividualComponentProps;
}
