import { PageBlueprint } from "./PageDefinition";

export interface RenderSubComponentLocationProps {
  bluePrint: PageBlueprint;
  location?: "Top" | "Bottom";
}

export interface PageDataAndRenderingMappings {
  bluePrint: PageBlueprint;
}

export interface SubComponentDataProps {
  subComponentData: RenderSubComponentLocationProps;
}
