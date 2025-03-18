# Longform README  
Welcome to the <b>headless-basics-data</b> project! This repository provides a set of TypeScript modules, services, utilities, and interfaces designed for a headless CMS approach. The code aims to support a flexible, multi-site setup, offering features like content rendering, SEO handling, language-based routing, and more. Below is a comprehensive overview of the project and its underlying code.  

## Table of Contents  
1. Overview  
2. Architecture Run Through  
3. Components Overview  
4. Project Structure  
5. Key Features  
6. Installation  
7. Building  
8. Usage  
9. Configuration &amp; Environment Variables  
10. Publishing the Package  
11. Contributing  
12. License  
 
## Overview  
The <b>headless-basics-data</b> project provides a modular and extensible codebase for managing content in a headless CMS environment. It supports multi-site configurations, dynamic content fetching, and SEO metadata generation.  
 
## Architecture Run Through  
The project is organized into several key areas:  
- <b>CMS Integration</b>: Contains modules for interfacing with various CMS platforms such as Umbraco Heartcore, Kontent, and Contentful. This area includes tools for constructing GraphQL queries and processing responses from the CMS.  
- <b>Data Services</b>: Responsible for fetching, processing, and aggregating data from the CMS. Services include page data collection, component data processing, and SEO data generation.  
- <b>Routing and URL Services</b>: Implements logic for processing URLs and navigation. This involves stripping language prefixes, matching aliases, and transforming CMS URLs into friendly formats.  
- <b>UI Tools and Components</b>: Provides utility functions and components for rendering navigation menus, themes, and dynamic content on the frontend.  
- <b>Utilities and Logging</b>: A collection of helper functions for string manipulation, hashing, and logging to maintain consistency and aid in debugging.  

## Components Overview  
Components in this project serve as modular building blocks representing discrete sections of a webpage. They are utilized to render dynamic content retrieved from the CMS:  
- <b>Dynamic Components</b>: These components are imported dynamically based on the page layout and are responsible for rendering various content sections such as banners, grids, and content blocks.  
- <b>Component Services</b>: Each component has associated services that handle data fetching, variable mapping, and query execution. This standardized construction ensures consistency across different pages.  
- <b>Theming and Styling</b>: Components leverage Tailwind CSS for styling, and theme-specific modules may override default behaviors to provide a customized look and feel.  
- <b>Fallback Mechanisms</b>: When a specific component cannot be loaded, fallback components are used to maintain page functionality and display an appropriate message.  

## Project Structure  
The repository is organized as follows:  
- <b>src/</b>    
>>>>&ndash; <b>cms/</b>: Contains CMS-specific tools and constants.  
>>>>&ndash; <b>interfaces/</b>: TypeScript interfaces defining the project&apos;s data models.  
>>>>&ndash; <b>multisite/</b>: Tools for handling multi-site URL slugs.  
>>>>&ndash; <b>nextjs/app/</b>: Modules for Next.js page-data handling.  
>>>>&ndash; <b>services/</b>: Core business logic for data fetching, URL processing, SEO, and logging.  
>>>>&ndash; <b>ui-tools/</b>: Utility modules for navigation and theming.  
>>>>&ndash; <b>utils/</b>: General-purpose helpers for string manipulation, prefetching, and more.  
- <b>bitbucket-pipelines.yml.disabled</b>: Example pipeline configuration.  
- <b>package.json</b>: Project metadata, scripts, and dependencies.  
- <b>tsconfig.json</b>: TypeScript configuration for building type definitions.  
- <b>tailwind.config.cjs</b> and <b>postcss.config.cjs</b>: Configuration files for Tailwind CSS and PostCSS processing.  

## Key Features  
1. <b>Multi-Site Slug Management</b>: Dynamic transformation of slugs based on language and site configuration.  
2. <b>CMS Data Fetching</b>: Supports multiple CMS platforms with GraphQL integration.  
3. <b>Flexible Page Data &amp; Layout</b>: Aggregates data for both fixed and dynamic page layouts.  
4. <b>SEO &amp; Navigation</b>: Automated generation of SEO metadata and navigation structures.  
5. <b>Type-Safe Interfaces</b>: Extensive TypeScript interfaces ensure code maintainability and scalability.  

## Installation  
1. Install pnpm globally:  npm install -g pnpm  
2. Clone the repository:  git clone <repository-url>  
3. Navigate into the project directory and install dependencies:  pnpm install  

## Building  
To build the project and generate type declarations:  
1. Clean the build directory:  pnpm run clean  
2. Build the project:  pnpm run build  
The build artifacts will be located in the <b>dist/</b> directory.  

## Usage  
To integrate the package into your project:  
1. Install the package:  pnpm add @conversiondigital/headless-basics-data  
2. Import required modules:  import { buildPageData } from &apos;@conversiondigital/headless-basics-data&apos;;  
3. Configure your CMS and multi-site settings, then use the services to fetch data, build pages, and generate SEO metadata.  

## Configuration &amp; Environment Variables  
Configure the following environment variables as needed:  
- <b>UMBRACO_GRAPHQL_ENDPOINT</b>: The GraphQL endpoint for Umbraco Heartcore.  
- <b>KONTENT_GRAPHQL_ENDPOINT</b>, <b>KONTENT_PROJECT_ID</b>, <b>KONTENT_PREVIEW_API_KEY</b>: Settings for Kentico Kontent.  
- <b>CONTENTFUL_GRAPHQL_ENDPOINT</b>, <b>CONTENTFUL_SPACE_ID</b>, <b>CONTENTFUL_DELIVERY_API_KEY</b>: Settings for Contentful.  
- <b>NEXT_PUBLIC_LOG_LEVEL</b>: Controls log verbosity (e.g., trace, debug, info, warn, error).  
- <b>NEXT_PUBLIC_CMS_VARIANT</b>: Determines which CMS variant to use (e.g., heartcore, contentful, or kontent).  

## Publishing the Package  
When ready to publish the updated package:  
1. Update the version in <b>package.json</b>:  pnpm version patch  
2. Build the project:  pnpm run build  
3. Publish from the <b>dist/</b> directory:  npm publish ./dist --no-git-checks  

## Contributing  
1. Fork the repository and clone it locally.  
2. Create a feature or fix branch from <b>develop</b>.  
3. Commit your changes and open a Pull Request detailing your changes and testing steps.  

Feel free to suggest improvements to the code structure, documentation, or usage examples.  

## License  
This project is licensed under the ISC License. For details, please refer to the <b>package.json</b> file.  
