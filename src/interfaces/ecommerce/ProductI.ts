/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProductI {
  url: string;
  id: string;
  __typename: string;
  contentTypeAlias: string;
  name: string;
  productDataSheet: {
    url: string;
  };
  productDescription: string;
  productFeature: string;
  images: {
    url: string;
    media?: {
      altText?: string;
      name?: string;
    };
  }[];
  productInstallationMenu: {
    url: string;
  };
  downloads: any;
  productKeyFeatures: string[];
  productName: string;
  productPhoto: {
    url: string;
    media?: {
      altText?: string;
      name?: string;
    };
  };
  productVideos: {
    url: string;
  }[];
  features: {
    content: Feature;
  }[];
  specifications: {
    content: Specification;
  }[];
  imageSectionContent: {
    content: ImageSectionContent;
  }[];
  warranty: string;
  frequentlyAskedQuestions: string;
  rows: any; // Advanced Specifications Rows
  showStandardProductBody: boolean;
  turnOnAdvancedProductSpecificationTable: boolean; // On/Off advanced specs table
}

interface Feature {
  content: any;
  __typename: string;
  contentTypeAlias: string;
  heading: string;
  description?: string;
  image?: {
    url: string;
    media?: {
      altText?: string;
      name?: string;
    };
  };
  listing?: Feature[];
}

interface Specification {
  __typename: string;
  contentTypeAlias: string;
  category: string;
  title: string;
  value: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AdvancedSpecification {
  __typename: string;
  contentTypeAlias: string;
  values?: {
    content?: {
      isHeading: any;
      columnSpan: any;
      value: string;
    };
  };
}
interface ImageSectionContent {
  __typename: string;
  contentTypeAlias: string;
  heading: string;
  text?: string;
  image?: {
    url: string;
    media?: {
      altText?: string;
      name?: string;
    };
  };
}
