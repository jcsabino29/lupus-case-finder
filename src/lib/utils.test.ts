import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes, last one wins", () => {
    expect(cn("px-2 text-fg", false && "hidden", "px-4")).toBe("text-fg px-4");
  });
});
