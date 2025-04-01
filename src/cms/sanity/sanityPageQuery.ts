import { fetchAPI, fetchAPIGatewayWrapperForSanity } from "../../services";
import { getLogger } from "../../services/logging/LogConfig";
import { logPrefix } from "../../utils/logPrefix";

const log = getLogger("components.template.upsertDemoData");


export async function getPageByTitle(title: string, componentName: string): Promise<any | undefined> {
    const endpoint = await fetchAPIGatewayWrapperForSanity();
    
    // Build a GROQ query to search for a page with the same title as the component.
    const pageQuery = `query GetPageOrHomepageBySlug($title: String!) {
        allPage(where: { title:  { eq: $title } }) {
            _id
            __typename
            _createdAt
            _updatedAt
            _rev
            _key
            title
            description
            level
            sortOrder
            showInNavigation
            components {
                __typename
            }
        }
    }`;
    const queryVariables = { title: title };
    const queryDetails = {
        queryResult: pageQuery,
        variables: queryVariables,
        matchingPath: "page-search",
        cmsPrefix: "default",
        identifier: "templateComponentGlobal",
        failedToFind: false,
        queryString: pageQuery,
        siteId: "default-site",
        theme: "default", // Added the required 'theme' property
    };
    try{
        log.info(`${logPrefix()} Starting upsert mutation...`);
        // Search for the page.
        const pageResult = await fetchAPI(
          queryDetails,
          endpoint,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
          }
        );
        log.info(`${logPrefix()} Page search result:`, pageResult);
    
        // If the page already exists, log and skip the upsert.
        if (!pageResult) {
          log.trace(
            `${logPrefix()} Page with title "${componentName}" found. Skipping upsert.`
          );
          return undefined;
        }
        return pageResult;
      } catch (error) {
        log.error(`${logPrefix()} Error in getPageByTitle: ${error}`);
      }
}