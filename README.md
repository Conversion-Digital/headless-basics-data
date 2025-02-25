# Longform README

Welcome to the **headless-basics-data** project! This repository provides a set of TypeScript modules, services, utilities, and interfaces designed for a headless CMS approach. The code aims to support a flexible, multi-site setup, offering features like content rendering, SEO handling, language-based routing, and more. Below is a comprehensive overview of the project and its underlying code.

---

## Table of Contents

1. **Overview**  
2. **Project Structure**  
3. **Key Features**  
4. **Installation**  
5. **Building**  
6. **Usage**  
7. **Configuration & Environment Variables**  
8. **Publishing the Package**  
9. **Contributing**  
10. **License**  

---

## Overview

The **headless-basics-data** project aims to provide reusable building blocks for a headless CMS ecosystem. Here, youU+0060ll find code to:

- **Fetch** data from various CMS platforms (currently focusing on Umbraco Heartcore, Kontent, and Contentful).  
- **Render** content for pages, sub-components, and dynamic data using a multi-site structure.  
- **Build** meta information and SEO data programmatically.  
- **Manage** language-based URLs, multi-site routing, and alias logic.

All modules are written in **TypeScript**, offering type definitions and interfaces for structured and maintainable code.

---

## Project Structure

A high-level view of the repository folder organization:

- **src/**  
  - **cms/**  
    - Contains CMS-specific tools and constants.  
    - **heartcore/tools/**: Utility functions for processing Umbraco Heartcore content (e.g., filtering and updating class attributes).  
    - **constants.ts** / **SiteConstants.ts**: Shared constants and factory methods for site configuration.  
  - **interfaces/**  
    - TypeScript interfaces that define data models (e.g., PageIdentifier, LanguageSite, ProductI).  
  - **multisite/**  
    - Tools for multi-site slug handling and generation.  
  - **nextjs/app/**  
    - Next.js specific modules for handling page-data.  
  - **services/**  
    - **data/**: Collects data from the CMS, providing buildPageData, pageLayoutDataCollector, etc.  
    - **components/**: Services for dynamic imports and page-component data location.  
    - **logging/**: Custom logging wrapper configuration.  
    - **model/**: Logic for retrieving page type by slug.  
    - **urlService.ts** / **urlServiceServer.ts**: Functions to handle URL rewriting, alias matching, and prefix stripping.  
    - **seoRendererService.ts**: Methods to generate Next.js metadata for SEO.  
  - **ui-tools/**  
    - Basic UI-related utility modules (e.g., navigation, theme).  
  - **utils/**  
    - General-purpose helpers (e.g., replaceString, prefetch, parseHeadingTags).  
  - **index.ts**  
    - Exports important modules/services.  
- **bitbucket-pipelines.yml.disabled**  
  - Example pipeline file for building and deploying (disabled by default).  
- **package.json**  
  - Declares project metadata, scripts, and dependencies.  
- **tsconfig.json**  
  - TypeScript configuration for building type definitions.  
- **tailwind.config.cjs** / **postcss.config.cjs**  
  - Configuration files for Tailwind CSS processing.

---

## Key Features

1. **Multi-Site Slug Management**  
   - Tools for transforming slugs according to language or site settings.  
   - Ability to strip or add language prefixes dynamically.

2. **CMS Data Fetching**  
   - GraphQL queries for retrieving content from multiple CMS variants (e.g., **Heartcore**, **Kontent**, **Contentful**).  
   - Modular design for easy extension to additional CMS vendors.

3. **Flexible Page Data & Layout**  
   - Functions to collect a pageU+0060s data from multiple sources, merging them into a unified structure.  
   - Sub-component logic for nested or dynamic content sections.

4. **SEO & Navigation**  
   - Automatic retrieval of SEO fields and generation of Next.js metadata.  
   - Navigation building with the option for deep or shallow search in the data structure.

5. **Type-Safe Interfaces**  
   - All data structures and responses are typed, improving safety and clarity in development.

---

## Installation

1. Ensure you have [**pnpm**](https://pnpm.io) installed, or install it globally:
   ```
   npm install -g pnpm
   ```
2. Clone the repository:
   ```
   git clone <repository-url>
   ```
3. Navigate into the project directory and install dependencies:
   ```
   pnpm install
   ```

---

## Building

To generate a build containing TypeScript declaration files:

1. **Clean** the output and delete any old definitions:
   ```
   pnpm run clean
   ```
2. **Build** the type declarations:
   ```
   pnpm run build
   ```
The build artifacts will be placed into the **dist/** directory, including **index.d.ts** and other declaration files. This ensures your published package has the necessary type definitions for consumers.

---

## Usage

The **@conversiondigital/headless-basics-data** package is typically used in Next.js or Node.js applications:

1. **Install** via your package manager once published:
   ```
   npm install @conversiondigital/headless-basics-data
   ```
   or
   ```
   pnpm add @conversiondigital/headless-basics-data
   ```
2. **Import** what you need:
   ```
   import { buildPageData } from U+0060@conversiondigital/headless-basics-dataU+0060;
   import { processURLForNavigation } from U+0060@conversiondigital/headless-basics-dataU+0060;
   ```
3. **Configure** your multi-site or CMS settings, then call the relevant services to fetch data, build pages, or generate SEO metadata.

---

## Configuration & Environment Variables

Several environment variables can be used to configure CMS credentials or logging:

- **UMBRACO_GRAPHQL_ENDPOINT**: The GraphQL endpoint for Umbraco Heartcore.  
- **KONTENT_GRAPHQL_ENDPOINT** / **KONTENT_PROJECT_ID** / **KONTENT_PREVIEW_API_KEY**: For Kentico Kontent.  
- **CONTENTFUL_GRAPHQL_ENDPOINT**, **CONTENTFUL_SPACE_ID**, **CONTENTFUL_DELIVERY_API_KEY**: For Contentful.  
- **NEXT_PUBLIC_LOG_LEVEL**: Controls log verbosity (U+0060traceU+0060, U+0060debugU+0060, U+0060infoU+0060, U+0060warnU+0060, U+0060errorU+0060).  
- **NEXT_PUBLIC_CMS_VARIANT**: Determines which CMS variant to use. E.g. U+0060heartcoreU+0060, U+0060contentfulU+0060, or U+0060kontentU+0060.

---

## Publishing the Package

When changes are ready, you can publish the updated package to an npm registry:

1. Update the version in **package.json**:
   ```
   pnpm version patch
   ```
2. Build the project:
   ```
   pnpm run build
   ```
3. Publish from **dist/**:
   ```
   npm publish ./dist --no-git-checks
   ```
   Alternatively, if using a CI/CD pipeline, refer to the example in **bitbucket-pipelines.yml.disabled**.

---

## Contributing

1. **Fork** this repository and clone locally.  
2. **Create** a feature or fix branch from **develop**.  
3. **Commit** and push changes.  
4. **Open a Pull Request** detailing your changes and any relevant testing steps.

Feel free to suggest improvements to code structure, documentation, or usage examples.

---

## License

This project is licensed under the **ISC License**. For details, see the [package.json](./package.json) file or consult the repository documentation.

---
