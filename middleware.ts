import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APEX_HOST = 'avensafesolutions.com';

const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'srsltid',
  'gbraid',
  'wbraid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'yclid',
  '_ga',
  'gtm_debug',
]);

function isTrackingParam(key: string): boolean {
  const name = key.toLowerCase();
  return name.startsWith('utm_') || TRACKING_PARAMS.has(name);
}

/**
 * Collapses the host and tracking-parameter variants that otherwise return 200
 * with a canonical pointing at the clean URL. Search Console reports those as
 * "Alternate page with proper canonical tag".
 *
 * Localhost and unknown hosts are left alone. HTTP is upgraded only when the
 * proxy says the public scheme is http, so a missing forwarded-proto header
 * cannot loop.
 */
export function middleware(request: NextRequest): NextResponse {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.next();
  }

  const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const host = hostHeader.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? '';
  if (host !== APEX_HOST && host !== `www.${APEX_HOST}`) {
    return NextResponse.next();
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  const needsHttps = forwardedProto === 'http';
  const needsApex = host !== APEX_HOST;

  const destination = new URL(request.nextUrl.pathname, `https://${APEX_HOST}`);
  let stripped = false;
  for (const [key, value] of request.nextUrl.searchParams) {
    if (isTrackingParam(key)) {
      stripped = true;
      continue;
    }
    destination.searchParams.append(key, value);
  }

  if (!needsHttps && !needsApex && !stripped) {
    return NextResponse.next();
  }

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/).*)'],
};
