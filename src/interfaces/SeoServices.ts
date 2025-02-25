
export interface AlternateUrl {
  url: string;
  type: string;
}

export type OGImage = string | OGImageDescriptor | URL;

export type OGImageDescriptor = {
  url: string | URL;
  secureUrl?: string | URL;
  alt?: string;
  type?: string;
  width?: string | number;
  height?: string | number;
};

export interface AlternateUrlResponse {
  "x-default": string;
  [key: `${Lowercase<string>}-${string}`]: string;
}

export interface SeoItems {
  alternateMultiURLs?: AlternateUrl[];
  canonicalURLContentItem?: { url: string };
  canonicalURLAbsolute?: string;
  noIndexPage?: boolean;
  ogImage?: { url: string };
  ogDescription?: string;
  seoDescription?: string;
  seoTitle?: string;
  name?: string;
  structuredData?: unknown;
}
