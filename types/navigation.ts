export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
}

export interface NavGroup {
  readonly label: string;
  readonly href: string;
  /**
   * When set, the group's children are filled in at render time from the JSON
   * data layer rather than being hardcoded here.
   */
  readonly dynamicSource?: 'services' | 'states' | 'featuredCities';
  readonly items?: readonly NavItem[];
}

export interface FooterColumn {
  readonly heading: string;
  readonly dynamicSource?: 'services' | 'states' | 'featuredCities';
  readonly items?: readonly NavItem[];
}
