import { describe, it, expect } from "vitest";
import en from "../locales/en.json";
import sv from "../locales/sv.json";

// Flatten an i18n catalog to dotted leaf keys. Arrays (random pools like
// greetings/funMessages) are treated as leaves — their lengths may differ
// between languages; only the key structure must match.
function flatten(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [prefix];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    keys.push(...flatten(v, key));
  }
  return keys;
}

describe("i18n catalog parity", () => {
  it("en and sv expose exactly the same keys", () => {
    const enKeys = new Set(flatten(en));
    const svKeys = new Set(flatten(sv));
    const missingInSv = [...enKeys].filter((k) => !svKeys.has(k)).sort();
    const missingInEn = [...svKeys].filter((k) => !enKeys.has(k)).sort();
    expect({ missingInSv, missingInEn }).toEqual({
      missingInSv: [],
      missingInEn: [],
    });
  });
});
