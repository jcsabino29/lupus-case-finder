/**
 * Content Security Policy builder.
 *
 * Production policy is nonce-based with 'strict-dynamic': no 'unsafe-inline'
 * and no 'unsafe-eval' for scripts or styles. Development adds the minimum
 * relaxations Next.js needs for hot reload and React's debug tooling.
 *
 * When Supabase or other origins are added (stage 1+), list them explicitly
 * in `connectSrc` rather than loosening `default-src`.
 */
export interface CspOptions {
  nonce: string;
  isDev: boolean;
  /** Extra origins allowed for fetch/XHR/WebSocket (e.g. the Supabase URL). */
  connectSrc?: readonly string[];
}

const NONCE_PATTERN = /^[A-Za-z0-9+/=_-]{16,}$/;

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function buildCsp({ nonce, isDev, connectSrc = [] }: CspOptions): string {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error("CSP nonce is missing or malformed");
  }
  for (const origin of connectSrc) {
    if (!/^(https|wss):\/\/[a-z0-9.-]+(:\d+)?$/i.test(origin)) {
      throw new Error(`Refusing non-HTTPS or malformed connect-src origin: ${origin}`);
    }
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...connectSrc],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "frame-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  // Don't force HTTPS upgrades on plain-HTTP localhost during development.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}
