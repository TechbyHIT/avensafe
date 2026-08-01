import { FEATURED_CITY_SLUGS, FOOTER_COLUMNS, PRIMARY_NAV } from '@/config/navigation';
import { getCities, getServices, getStateById, getStates } from '@/lib/data/repository';
import { cityPath, servicePath, statePath } from '@/lib/routing/url';
import type { NavItem } from '@/types/navigation';

/**
 * Resolves the navigation configuration against the data layer.
 *
 * Menus marked with a `dynamicSource` in `config/navigation.ts` are filled in
 * here, so adding a service or state to JSON puts it in the header, the footer
 * and the mobile drawer without touching a component.
 */

export interface ResolvedNavGroup {
  readonly label: string;
  readonly href: string;
  readonly items: readonly NavItem[];
}

function itemsForSource(source: 'services' | 'states' | 'featuredCities'): readonly NavItem[] {
  if (source === 'services') {
    return getServices().map((service) => ({
      label: service.name,
      href: servicePath(service),
      description: service.summary,
    }));
  }

  if (source === 'featuredCities') {
    const bySlug = new Map(getCities().map((city) => [city.slug, city]));
    return FEATURED_CITY_SLUGS.flatMap((slug) => {
      const city = bySlug.get(slug);
      if (!city) return [];
      const state = getStateById(city.stateId);
      if (!state) return [];
      return [{ label: city.name, href: cityPath(state, city) }];
    });
  }

  return getStates().map((state) => ({
    label: state.name,
    href: statePath(state),
  }));
}

export function buildPrimaryNav(): readonly ResolvedNavGroup[] {
  return PRIMARY_NAV.map((group) => ({
    label: group.label,
    href: group.href,
    items: group.dynamicSource ? itemsForSource(group.dynamicSource) : (group.items ?? []),
  }));
}

export interface ResolvedFooterColumn {
  readonly heading: string;
  readonly items: readonly NavItem[];
}

export function buildFooterColumns(): readonly ResolvedFooterColumn[] {
  return FOOTER_COLUMNS.map((column) => ({
    heading: column.heading,
    items: column.dynamicSource
      ? itemsForSource(column.dynamicSource)
      : (column.items ?? []),
  }));
}
