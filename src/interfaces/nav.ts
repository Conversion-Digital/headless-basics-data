export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface INavItem {
  id?: string;
  url?: string;
  name: string;
  _level?: number;
  superAlias?: string;
  target?: string;
  prefetch?: boolean;
  children?: INavItem[];
  showInNavigation?: boolean;
  className: string;
  productPhoto?: unknown;
}
