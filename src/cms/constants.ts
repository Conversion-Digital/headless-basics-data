// export const EXAMPLE_PATH = 'cms-umbraco-heartcore'
// export const CMS_NAME = 'Umbraco Heartcore'
// export const CMS_URL = 'https://umbraco.com/heartcore'

// Need to add the folowing to env.local  CMS_VARIANT=heartcore

export const HOME_OG_IMAGE_URL =
    "https://og-image.vercel.app/Next.js%20Blog%20Example%20with%20**Umbraco%20Heartcore**.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg&images=https://media.umbraco.io/demo-headless/8d8a349dde73ca6/u_heartcore_heart_lockup_tagline_dark.svg"

export const SUPER_ALIAS = "SUPER-ALIAS::"

export type CmsVariantType = "heartcore" | "contentful" | "kontent" | "sanity"

export type CountryCode = "us" | "au" | "nz" | "en"

export type PageVariant = "homepage" | "home" | "subComponentsPage" | "productPage" | "sitemap"| "special-case"

export interface CmsVariant {
    pageTypes: {
        [key: string]: {
            frontEndSlug: string | null;
            backEndSlug: string | null;
            pageVariant: string;
            cmsType: string;
            isFixedLayout: boolean;
            components?: string[];
        };
    };
}

const CmsVariants = {
    variants: {
        heartcore: {
            cmsName: "Umbraco Heartcore",
            deliveryApiDomain: process.env.UMBRACO_GRAPHQL_ENDPOINT,
            deliveryApiUrl: "w-1/3",
            cmsUrl: "https://umbraco.com/heartcore",
            deliveryApiKey: process.env.UMBRACO_API_KEY,
            contentApiKey: "",
            previewApiKey: "",
            projectAlias: process.env.UMBRACO_PROJECT_ALIAS,
            pageTypes: {
                home: {
                    frontEndSlug: "",
                    backEndSlug: "",
                    pageVariant: "Home",
                    cmsType: "homepage",
                    isFixedLayout: false
                },
                subComponentsPage: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "subComponentsPage",
                    cmsType: "subComponentsPage",
                    isFixedLayout: false,
                },
                productPage: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "productPage",
                    cmsType: "productPage",
                    isFixedLayout: true,
                }
            },
        },
        sanity: {
            cmsName: "Sanity CMS",
            deliveryApiDomain: process.env.GRAPHQL_ENDPOINT,
            deliveryApiUrl: "w-1/3",
            cmsUrl: process.env.CMS_URL,
            deliveryApiKey: "",
            contentApiKey: "",
            previewApiKey: "",
            projectAlias: process.env.PROJECT_ID,
            pageTypes: {
                home: {
                    frontEndSlug: "",
                    backEndSlug: "",
                    pageVariant: "page",
                    cmsType: "page",
                    isFixedLayout: false
                },
                page: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "page",
                    cmsType: "page",
                    isFixedLayout: false,
                }
            },
        },
        kontent: {
            cmsName: "Kentico Kontent",
            deliveryApiDomain: process.env.KONTENT_GRAPHQL_ENDPOINT,
            deliveryApiUrl: "w-1/3",
            cmsUrl: "",
            deliveryApiKey: '',
            contentApiKey: "",
            previewApiKey: process.env.KONTENT_PREVIEW_API_KEY,
            projectAlias: "",
            projectId: process.env.KONTENT_PROJECT_ID,
            pageTypes: {
                home: {
                    frontEndSlug: "/",
                    backEndSlug: "/",
                    pageVariant: "Home",
                    cmsType: "homepage",
                    isFixedLayout: true,
                },
                dynamic: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "dynamic",
                    cmsType: "navigation_item",
                    isFixedLayout: false,
                },
                landing: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "landing",
                    cmsType: "staticPage",
                    isFixedLayout: true,
                },
                productPage: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "productPage",
                    cmsType: "productPage",
                    isFixedLayout: false,
                }
            },
        },
        contentful: {
            cmsName: "Contentful",
            deliveryApiDomain: process.env.CONTENTFUL_GRAPHQL_ENDPOINT,
            deliveryApiUrl: process.env.CONTENTFUL_DELIVERY_API_URL,
            cmsUrl: "https://app.contentful.com/spaces/3j9y7hnidlox",
            deliveryApiKey: process.env.CONTENTFUL_DELIVERY_API_KEY,
            contentApiKey: "",
            previewApiKey: process.env.CONTENTFUL_PREVIEW_API_KEY,
            projectAlias: "contentful-CD",
            spaceId: process.env.CONTENTFUL_SPACE_ID,
            environmentId: process.env.CONTENTFUL_ENVIRONMENT,
            pageTypes: {
                home: {
                    frontEndSlug: "/",
                    backEndSlug: "/",
                    pageVariant: "Home",
                    cmsType: "pageCollection",
                    isFixedLayout: true,
                },
                dynamic: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "dynamic",
                    cmsType: "pageCollection",
                    isFixedLayout: false,
                },
                productPage: {
                    frontEndSlug: null,
                    backEndSlug: null,
                    pageVariant: "productPage",
                    cmsType: "productPage",
                    isFixedLayout: false,
                }
            },
        },
    },
}
export { CmsVariants }

export type DynamicCmsDataVariant = "navigation" | "page"

export interface DynamicDataCmsProperties {
    identifier: string
    snippetLocation: string
    snippetFileName: string
    snippetExport: string
    variableFunction: string
    dataFunctionMapperName: string
    queryIsFunction: boolean
    queryHasVariables: boolean
    isClientSide: boolean
}

export const COMPONENT_PRODUCT_DETAILS: string = "productDetails"
export const SUB_COMPONENT_CONTENT: string = "subComponentContent"

export const countryCodeWithNames = { 'US': 'USA', 'AU': 'Australia', 'NZ': 'New Zealand' }
