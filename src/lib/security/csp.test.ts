import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "./csp";
import { securityHeaders } from "./headers";

const nonce = "dGVzdC1ub25jZS0xMjM0NTY=";

describe("buildCsp", () => {
  it("production policy has no unsafe-inline or unsafe-eval", () => {
    const csp = buildCsp({ nonce, isDev: false });
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain(`'nonce-${nonce}'`);
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("development policy only relaxes what Next.js dev needs", () => {
    const csp = buildCsp({ nonce, isDev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("rejects a missing or malformed nonce", () => {
    expect(() => buildCsp({ nonce: "", isDev: false })).toThrow();
    expect(() => buildCsp({ nonce: "abc'; script-src *", isDev: false })).toThrow();
  });

  it("only accepts https/wss connect-src origins", () => {
    expect(
      buildCsp({ nonce, isDev: false, connectSrc: ["https://example.supabase.co"] }),
    ).toContain("connect-src 'self' https://example.supabase.co");
    expect(() =>
      buildCsp({ nonce, isDev: false, connectSrc: ["http://insecure.example.com"] }),
    ).toThrow();
    expect(() => buildCsp({ nonce, isDev: false, connectSrc: ["*"] })).toThrow();
  });
});

describe("createNonce", () => {
  it("returns unique, well-formed values", () => {
    const a = createNonce();
    const b = createNonce();
    expect(a).not.toEqual(b);
    expect(() => buildCsp({ nonce: a, isDev: false })).not.toThrow();
  });
});

describe("securityHeaders", () => {
  it("includes the required baseline headers", () => {
    const map = new Map(securityHeaders.map((h) => [h.key, h.value]));
    expect(map.get("X-Frame-Options")).toBe("DENY");
    expect(map.get("X-Content-Type-Options")).toBe("nosniff");
    expect(map.get("Strict-Transport-Security")).toMatch(/max-age=\d{8,}/);
    expect(map.get("Referrer-Policy")).toBeTruthy();
    expect(map.get("Permissions-Policy")).toContain("camera=()");
  });
});
