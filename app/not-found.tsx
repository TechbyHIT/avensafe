import type { Metadata } from 'next';
import Link from 'next/link';
import { STATIC_ROUTES } from '@/config/routes';
import { ContactActions } from '@/components/layout/ContactActions';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const links = [
    { href: STATIC_ROUTES.services, label: 'All services' },
    { href: STATIC_ROUTES.serviceAreas, label: 'Areas we cover' },
    { href: STATIC_ROUTES.pricingGuide, label: 'Pricing guide' },
    { href: STATIC_ROUTES.faq, label: 'Frequently asked questions' },
    { href: STATIC_ROUTES.contact, label: 'Contact us' },
  ];

  return (
    <Container width="prose">
      <div className="py-24">
        <p className="text-xs font-semibold tracking-widest text-brand-700 uppercase">404</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">We could not find that page</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          The link may be out of date, or the locality you were looking for may not be one we have
          published yet. If you were looking for a specific area, call us — we often work just beyond
          a listed boundary.
        </p>

        <div className="mt-8">
          <ContactActions />
        </div>

        <nav aria-label="Useful links" className="mt-12">
          <h2 className="text-sm font-semibold tracking-wide text-ink-900 uppercase">
            Try one of these
          </h2>
          <ul className="mt-4 divide-y divide-ink-200 border-t border-ink-200">
            {links.map((link) => (
              <li key={link.href} className="py-3">
                <Link href={link.href} className="text-sm font-medium text-brand-800">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Container>
  );
}
