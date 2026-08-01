import type { Metadata } from 'next';
import { GuidePage, guideMetadata } from '@/components/templates/GuidePage';

const SLUG = 'safety-guide';

export const revalidate = 43200; // REVALIDATE.editorial

export function generateMetadata(): Metadata {
  return guideMetadata(SLUG);
}

export default function SafetyGuidePage() {
  return <GuidePage slug={SLUG} />;
}
