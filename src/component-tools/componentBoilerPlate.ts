import { ViewComponentProps } from "../interfaces";
import { getLogger } from "../services";

const log = getLogger("data.component-tools.componentBoilerPlate")

export function componentBoilerPlate(dynamicComponent: ViewComponentProps) : {variant: string, blueprint: any, componentInformation: any, matchingData: any} {
    const componentInformation = dynamicComponent.componentInformation;
    const blueprint = dynamicComponent.blueprint;
  
    if (!componentInformation) {
      log.error("Invalid componentInformation.metaData passed to HeroUI", componentInformation);
      return { variant: "", blueprint: null, componentInformation: null, matchingData: null };
    } else if (!componentInformation.metaData) {
      log.error("Invalid componentInformation.metaData passed to HeroUI", (componentInformation as any).componentInformation.metaData);
      return { variant: "", blueprint: null, componentInformation: null, matchingData: null };
    }
  
    // populateMetaData(componentInformation)
    const matchingData = componentInformation.data;
    const variant = componentInformation?.metaData?.variant || ""

    return {variant, blueprint, componentInformation, matchingData};
}