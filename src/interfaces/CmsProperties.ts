import { PageIdentifier } from "./PageIdentifier";

export interface CmsProperties {
  cmsName?: string;
  deliveryApiDomain?: string;
  deliveryApiUrl?: string;
  deliveryApiKey?: string;
  cmsUrl?: string;
  projectAlias?: string;
  projectId?: string;
  pageTypes: {
    home: PageIdentifier;
    dynamic: PageIdentifier;
  };
}
