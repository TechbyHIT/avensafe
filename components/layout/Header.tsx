import Image from 'next/image';
import Link from 'next/link';
import {
  business,
  mailtoHref,
  primaryPhone,
  telHref,
  whatsappHref,
  whatsappPhone,
} from '@/config/business';
import { SERVICES_MEGA_MENU } from '@/config/mega-menu';
import { STATIC_ROUTES } from '@/config/routes';
import { MobileNav } from '@/components/layout/MobileNav';
import { Container } from '@/components/ui/Container';
import { buildAreasMegaMenu } from '@/lib/nav/areas-mega-menu';
import { buildPrimaryNav } from '@/lib/navigation/build';

function PhoneIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7c.3.4.3 1 0 1.4l-.7.9c-.2.2-.2.5 0 .8.5.9 1.5 1.9 2.4 2.4.3.2.6.2.8 0l.9-.7c.4-.3 1-.3 1.4 0l1.7 1.2c.6.4.7 1.2.3 1.8l-.6.8c-.5.7-1.4 1-2.2.8-1.9-.5-3.7-1.6-5.1-3C4.2 9.2 3.1 7.4 2.6 5.5c-.2-.8.1-1.7.8-2.2l.3-.2Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.3a6.6 6.6 0 0 0-5.7 10l-.9 3.3 3.4-.9A6.6 6.6 0 1 0 8 1.3Zm3.8 9.3c-.2.5-1 .9-1.4.9-.4 0-1.5-.2-2.9-1.4-1.4-1.2-1.8-2.2-1.9-2.6-.1-.4.2-1.2.6-1.5.2-.1.4-.1.5 0l.6 1c.1.2.1.3 0 .4l-.3.4c-.1.1-.1.2 0 .4.3.5.9 1 1.4 1.3.2.1.3.1.4 0l.4-.4c.1-.1.3-.1.4 0l1 .5c.2.1.2.3.2.5Z" />
    </svg>
  );
}

/**
 * Hiranya-style site chrome: utility bar, conversion CTAs, Services/Areas mega-menus.
 */
export function Header() {
  const nav = buildPrimaryNav();
  const areasMegaMenu = buildAreasMegaMenu();
  const waMessage = `Hello ${business.shortName}, I would like a free quote for invisible grills / safety nets.`;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand-900 text-white">
        <Container width="wide">
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs sm:text-sm">
            <p className="text-white/85">
              Premium Invisible Grills &amp; Safety Nets across South &amp; West India.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={mailtoHref()}
                className="text-white/90 no-underline hover:text-accent-400"
              >
                {business.email}
              </a>
              <a
                href={telHref(primaryPhone)}
                className="inline-flex items-center gap-1.5 font-medium text-white no-underline hover:text-accent-400"
              >
                <PhoneIcon />
                {primaryPhone.display}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <div className="border-b border-ink-200 bg-white shadow-sm">
        <Container width="wide">
          <div className="flex h-[4.25rem] items-center justify-between gap-4">
            <Link
              href={STATIC_ROUTES.home}
              data-no-underline=""
              className="flex shrink-0 items-center gap-2.5 no-underline"
            >
              <Image
                src="/brand/avensafe-mark.png"
                alt=""
                width={44}
                height={44}
                priority
                className="h-11 w-11 object-contain"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-wide text-brand-900 uppercase sm:text-base">
                  <span className="text-brand-900">Aven</span>
                  <span className="text-accent-600">safe</span>
                </span>
                <span className="hidden text-[10px] font-semibold tracking-[0.16em] text-ink-500 uppercase sm:block">
                  Safe homes · Secure lives
                </span>
              </span>
            </Link>

            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {nav.map((group) => {
                  const isServices = group.label === 'Services';
                  const isAreas = group.label === 'Areas';
                  return (
                    <li key={group.label} className="group relative">
                      <Link
                        href={group.href}
                        data-no-underline=""
                        className="inline-flex items-center gap-1 rounded-(--radius-control) px-3 py-2 text-sm font-medium text-ink-700 no-underline hover:bg-ink-50 hover:text-brand-800"
                      >
                        {group.label}
                        {isServices || isAreas || group.items.length > 0 ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            aria-hidden="true"
                            className="text-ink-400"
                          >
                            <path d="M4 6l4 4 4-4" strokeLinecap="round" />
                          </svg>
                        ) : null}
                      </Link>

                      {isServices ? (
                        <div className="invisible absolute left-1/2 top-full z-50 w-[min(96vw,72rem)] -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-(--shadow-raised)">
                            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
                              {SERVICES_MEGA_MENU.map((column) => {
                                const preview = column.links.slice(0, 6);
                                const remaining = column.links.length - preview.length;
                                return (
                                <div key={column.heading}>
                                  <Link
                                    href={column.href}
                                    className="text-sm font-bold text-brand-900 no-underline hover:text-accent-700"
                                  >
                                    {column.heading}
                                  </Link>
                                  <ul className="mt-3 space-y-1.5">
                                    {preview.map((link) => (
                                      <li key={`${column.heading}-${link.label}`}>
                                        <Link
                                          href={link.href}
                                          className="block text-sm text-ink-600 no-underline hover:text-brand-800"
                                        >
                                          {link.label}
                                        </Link>
                                      </li>
                                    ))}
                                    {remaining > 0 ? (
                                      <li>
                                        <Link
                                          href={column.href}
                                          className="block text-sm font-medium text-brand-800 no-underline hover:text-accent-700"
                                        >
                                          +{remaining} more →
                                        </Link>
                                      </li>
                                    ) : null}
                                  </ul>
                                </div>
                                );
                              })}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-[#f7f3ea] px-6 py-3">
                              <p className="text-sm text-ink-700">
                                Each subsection is its own page — then every state and city.
                              </p>
                              <Link
                                href={STATIC_ROUTES.services}
                                className="text-sm font-semibold text-brand-800 no-underline hover:text-accent-700"
                              >
                                View all services →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {isAreas ? (
                        <div className="invisible absolute left-1/2 top-full z-50 w-[min(96vw,56rem)] -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-(--shadow-raised)">
                            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {areasMegaMenu.map((city) => (
                                <div key={city.name}>
                                  <Link
                                    href={city.href}
                                    className="text-sm font-bold text-brand-900 no-underline hover:text-accent-700"
                                  >
                                    {city.name}
                                  </Link>
                                  <ul className="mt-3 space-y-1.5">
                                    {city.areas.map((link) => (
                                      <li key={`${city.name}-${link.label}`}>
                                        <Link
                                          href={link.href}
                                          className="block text-sm text-ink-600 no-underline hover:text-brand-800"
                                        >
                                          {link.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-[#f7f3ea] px-6 py-3">
                              <p className="text-sm text-ink-700">
                                Looking for another city or locality?
                              </p>
                              <Link
                                href={STATIC_ROUTES.serviceAreas}
                                className="text-sm font-semibold text-brand-800 no-underline hover:text-accent-700"
                              >
                                Browse all service areas →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {!isServices && !isAreas && group.items.length > 0 ? (
                        <div className="invisible absolute left-0 top-full w-72 pt-1 opacity-0 transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                          <ul className="rounded-(--radius-card) border border-ink-200 bg-white p-2 shadow-(--shadow-raised)">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  data-no-underline=""
                                  className="block rounded-(--radius-control) px-3 py-2 no-underline hover:bg-ink-50"
                                >
                                  <span className="block text-sm font-medium text-ink-900">
                                    {item.label}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={whatsappHref(waMessage, whatsappPhone)}
                aria-label={`Message ${business.name} on WhatsApp`}
                className="grid h-10 w-10 place-items-center rounded-full bg-wa-500 text-white no-underline shadow-sm hover:bg-wa-600"
              >
                <WhatsAppIcon />
              </a>
              <a
                href={telHref(primaryPhone)}
                className="hidden items-center gap-2 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-bold text-accent-ink no-underline hover:bg-accent-600 sm:inline-flex"
              >
                <PhoneIcon />
                {primaryPhone.display}
              </a>
              <MobileNav groups={nav} />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
