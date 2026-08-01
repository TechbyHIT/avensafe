import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { business } from '@/config/business';
import { SEO_DEFAULTS } from '@/config/seo';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { StickyMobileCta } from '@/components/layout/StickyMobileCta';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Root metadata. `metadataBase` is what makes every relative canonical, OG and
 * Twitter URL resolve absolutely, and the title template is applied to static
 * pages; generated pages supply an absolute title instead.
 */
export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: SEO_DEFAULTS.defaultTitle,
    template: SEO_DEFAULTS.titleTemplate,
  },
  description: SEO_DEFAULTS.defaultDescription,
  applicationName: business.name,
  authors: [{ name: business.legalName, url: business.url }],
  creator: business.legalName,
  publisher: business.legalName,
  formatDetection: { telephone: true, address: false, email: true },
  // Icons come from Next's file conventions (`app/icon.svg`), so they are not
  // declared here — doing both would emit duplicate tags.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SEO_DEFAULTS.themeColor,
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang={SEO_DEFAULTS.htmlLang} className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        {/* Keyboard users can jump the header without tabbing the whole menu. */}
        <a
          href="#main"
          className="skip-link focus:left-4 focus:top-4 focus:rounded-(--radius-control) focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-800 focus:shadow-(--shadow-raised)"
        >
          Skip to main content
        </a>

        <Header />

        <main id="main" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>

        <Footer />
        <StickyMobileCta />
      </body>
    </html>
  );
}
