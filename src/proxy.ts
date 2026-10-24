import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, createNonce } from "@/lib/security/csp";

/**
 * Generates a per-request nonce and a strict Content-Security-Policy.
 * Next.js reads the nonce from the request's CSP header and applies it to
 * its own scripts and styles automatically.
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp({ nonce, isDev: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
