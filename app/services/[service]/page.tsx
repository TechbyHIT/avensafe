import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { getServices } from '@/lib/data/repository';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

export const revalidate = 43200; // REVALIDATE.service

interface RouteParams {
  readonly params: Promise<{ readonly service: string }>;
}

/** All services are prerendered: there are few of them and they are high value. */
export function generateStaticParams(): { service: string }[] {
  return getServices().map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { service } = await params;
  return metadataForPath(`/services/${service}`);
}

export default async function ServicePage({ params }: RouteParams) {
  const { service } = await params;
  const bundle = loadPage(`/services/${service}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
