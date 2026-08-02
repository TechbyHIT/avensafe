import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRERENDER } from '@/config/constants';
import { GeneratedPage } from '@/components/templates/GeneratedPage';
import { listServiceIntentTargets } from '@/lib/routing/inventory';
import { loadPage } from '@/lib/routing/page-bundle';
import { metadataForPath } from '@/lib/routing/page-helpers';

export const revalidate = 43200; // REVALIDATE.service

interface RouteParams {
  readonly params: Promise<{ readonly service: string; readonly intent: string }>;
}

export function generateStaticParams(): { service: string; intent: string }[] {
  if (PRERENDER.quickBuild) return [];
  return listServiceIntentTargets().map((target) => ({
    service: target.service!.slug,
    intent: target.intent!.slug,
  }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { service, intent } = await params;
  return metadataForPath(`/services/${service}/${intent}`);
}

export default async function ServiceIntentPage({ params }: RouteParams) {
  const { service, intent } = await params;
  const bundle = loadPage(`/services/${service}/${intent}`);
  if (!bundle) notFound();

  return <GeneratedPage bundle={bundle} />;
}
