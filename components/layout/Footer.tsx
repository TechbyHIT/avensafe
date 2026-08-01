import Image from 'next/image';
import Link from 'next/link';
import { business, mailtoHref, telHref } from '@/config/business';
import { STATIC_ROUTES } from '@/config/routes';
import { SocialLinks } from '@/components/layout/SocialLinks';
import { Container } from '@/components/ui/Container';
import { buildFooterColumns } from '@/lib/navigation/build';
import { joinWithAnd } from '@/lib/utils/text';
import { getStates } from '@/lib/data/repository';

export function Footer() {
  const columns = buildFooterColumns();
  const year = new Date().getFullYear();
  const stateNames = getStates().map((state) => state.name);

  return (
    <footer className="border-t border-ink-200 bg-ink-950 text-ink-300">
      <Container width="wide">
        {/* Brand + contact band */}
        <div className="grid gap-10 border-b border-ink-800 py-12 lg:grid-cols-[1.35fr_1fr_1fr] lg:gap-12">
          <div>
            <Link
              href={STATIC_ROUTES.home}
              data-no-underline=""
              className="inline-flex items-center gap-3 no-underline"
            >
              <Image
                src="/brand/avensafe-mark.png"
                alt=""
                width={52}
                height={52}
                className="h-12 w-12 object-contain"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-wide text-white uppercase">
                  <span>Aven</span>
                  <span className="text-accent-400">safe</span>
                </span>
                <span className="mt-0.5 text-[11px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
                  Safe homes · Secure lives
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-400">{business.tagline}</p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-white uppercase">Call Avensafe</p>
            <ul className="mt-4 space-y-3">
              {business.phones.map((phone) => (
                <li key={phone.e164}>
                  <a
                    href={telHref(phone)}
                    className="block text-lg font-semibold tracking-wide text-accent-400 no-underline hover:text-accent-500"
                    aria-label={`Call ${business.name} on ${phone.display}`}
                  >
                    {phone.display}
                  </a>
                  <p className="mt-0.5 text-xs text-ink-500">{phone.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-white uppercase">Email</p>
              <a
                href={mailtoHref('Website enquiry')}
                className="mt-3 block text-sm font-medium text-ink-200 break-all hover:text-white"
              >
                {business.email}
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-white uppercase">Hours</p>
              <div className="mt-3 space-y-1.5 text-sm text-ink-400">
                {business.openingHours.map((hours) => (
                  <p key={hours.days.join('-')}>
                    {hours.days.length > 1
                      ? `${hours.days[0]}–${hours.days[hours.days.length - 1]}`
                      : hours.days[0]}
                    : {hours.opens}–{hours.closes}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-xs font-semibold tracking-wide text-white uppercase">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.items.slice(0, 8).map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm leading-snug text-ink-400 no-underline hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-ink-800 py-6">
          <p className="text-xs leading-relaxed text-ink-500">
            Serving {joinWithAnd(stateNames)}.
          </p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {business.legalName}. All rights reserved.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href={STATIC_ROUTES.serviceAreas} className="hover:text-white">
                Service areas
              </Link>
              <Link href={STATIC_ROUTES.faq} className="hover:text-white">
                FAQ
              </Link>
              <Link href={STATIC_ROUTES.contact} className="hover:text-white">
                Contact
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
