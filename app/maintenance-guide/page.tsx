import type { Metadata } from 'next';
import { GuidePage, guideMetadata } from '@/components/templates/GuidePage';

const SLUG = 'net-and-cable-maintenance-guide';

export const revalidate = 43200; // REVALIDATE.editorial

export function generateMetadata(): Metadata {
  return guideMetadata(SLUG);
}

export default function MaintenanceGuidePage() {
  return <GuidePage slug={SLUG} />;
}
