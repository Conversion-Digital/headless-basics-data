/* eslint-disable @typescript-eslint/no-use-before-define */
import React from 'react';
import { getLogger } from "./logging/LogConfig";
import { JSX } from "react";
import { RenderSubComponentLocationProps } from '../interfaces/RenderSubComponentContentProps';
import { IndividualComponentProps } from '../interfaces/PageDefinition';
import { ViewComponentProps } from '../interfaces/ThemeConfig.interface';
import { logPrefix } from '../utils/logPrefix';

const log = getLogger("headless.contentRendererServiceTSX");

// Reusable fallback component for undefined or invalid components
export const FallbackComponent: React.FC<{ typename: string }> = ({ typename }) => (
  <div>Component not found -- {typename}</div>
);
FallbackComponent.displayName = "FallbackComponent";

// Main component rendering subcomponents for a specific location
export const PageSubComponents: React.FC<RenderSubComponentLocationProps> = ({ bluePrint, location }) => {
  let subComponentContent = (<></>);

  // Log the location being rendered
  log.trace('Rendering SubComponents for location: ', location);

  // Check if there are any components to render
  if (bluePrint?.components && bluePrint?.components?.length > 0) {
    subComponentContent = (
      <>
        <RenderSubComponentContent
          bluePrint={bluePrint}
          location={location}
        />
      </>
    );
  }

  // Return the rendered content or an empty fragment if no components exist
  return subComponentContent;
};

// Add a display name for easier debugging in dev tools
PageSubComponents.displayName = "PageSubComponents";

// Component that filters and renders subcomponents based on their location
export const RenderSubComponentContent: React.FC<RenderSubComponentLocationProps> = ({ bluePrint, location }) => {
  log.trace('Rendering SubComponents for location: ', location);

  let result: JSX.Element | null = null;

  // Retrieve all subcomponents from the provided data
  let allSubComponents: IndividualComponentProps[] = bluePrint.components || [];

  // Filter components based on their 'order' property
  // If 'order' is undefined, add the component to 'Top' results
  allSubComponents = allSubComponents.filter((element: IndividualComponentProps) => {
    if (!element.subComponentOutline) {
      return false; // Exclude components without a definition
    }

    if (element.subComponentOutline.order === location) {
      return true; // Include components matching the location
    }
    if (!element.subComponentOutline.order) {
      return location === 'Top'; // Include top-level components if no order is defined
    }
    return false; // Exclude all other components
  });

  log.trace('Filtered SubComponents: ', allSubComponents.length);

  // Loop through each filtered component and render it dynamically
  allSubComponents.forEach((element: IndividualComponentProps) => {
    let Component: React.FC<ViewComponentProps> | null = null; // Initialize the component as null
    const componentNameLower = element?.subComponentOutline?.__typename?.toLowerCase();
    if (typeof element.view === 'function') {
      // Cast the view function to a React.FC<ViewComponentProps>
      Component = element.view as React.FC<ViewComponentProps>;
    } else {
      // Fallback if no valid component is found
      log.trace(`${logPrefix()} ::: No Component Type Found: ${componentNameLower}`);
      /* eslint-disable react/display-name */
      Component = () => (
        <FallbackComponent
          typename={componentNameLower || "Unknown"}
        />
      );
      Component.displayName = 'FallbackComponentWrapper';
    }

    // Accumulate the result with the dynamically resolved component
    result = (
      <>
        {result}
        {Component && (
          <Component
            key={element.id}
            blueprint={bluePrint}
            componentInformation={element}
          />
        )}
      </>
    );
  });

  // Return the accumulated result, or an empty fragment if no components were rendered
  return <>{result}</>;
};

// Add a display name for easier debugging in dev tools
RenderSubComponentContent.displayName = "RenderSubComponentContent";
