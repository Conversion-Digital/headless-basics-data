import { PageVariant } from "../cms/constants";

export interface PageIdentifier {
  identifier?: string;
  backEndSlug?: string;
  frontEndSlug?: string;
  pageVariant: PageVariant;
  cmsType?: string;
  slugPrefix?: string;
  isFixedLayout: boolean;
}
