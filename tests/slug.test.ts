import { describe, it, expect } from "vitest";
import { slugify, displayToSlug, fileSlug } from "../src/slug.js";

describe("slugify", () => {
  it("converts strings to lowercase", () => {
    expect(slugify("HELLO WORLD")).toBe("hello-world");
  });

  it("trims whitespace from beginning and end", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("removes single and double quotes", () => {
    expect(slugify(`"hello" 'world'`)).toBe("hello-world");
    expect(slugify(`don't panic`)).toBe("dont-panic");
  });

  it("replaces non-alphanumeric characters with dashes", () => {
    expect(slugify("hello_world")).toBe("hello-world");
    expect(slugify("hello!@#$%^&*()world")).toBe("hello-world");
  });

  it("replaces multiple consecutive dashes with a single dash", () => {
    expect(slugify("hello   world")).toBe("hello-world");
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("removes leading and trailing dashes", () => {
    expect(slugify("-hello-world-")).toBe("hello-world");
    expect(slugify("!hello-world!")).toBe("hello-world");
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
  });

  it("removes non-ascii characters", () => {
    expect(slugify("café")).toBe("caf");
    expect(slugify("안녕하세요")).toBe("");
  });
});

describe("displayToSlug", () => {
  it("behaves exactly like slugify", () => {
    expect(displayToSlug("Hello World!")).toBe(slugify("Hello World!"));
    expect(displayToSlug("Hello World!")).toBe("hello-world");
  });
});

describe("fileSlug", () => {
  it("converts strings to lowercase and trims whitespace", () => {
    expect(fileSlug("  Hello World  ")).toBe("hello-world");
  });

  it("removes quotes", () => {
    expect(fileSlug(`"hello" 'world'`)).toBe("hello-world");
    expect(fileSlug(`don't panic`)).toBe("dont-panic");
  });

  it("keeps unicode letters and numbers", () => {
    expect(fileSlug("café")).toBe("café");
    expect(fileSlug("안녕하세요")).toBe("안녕하세요");
    expect(fileSlug("El Niño")).toBe("el-niño");
    expect(fileSlug("123 안녕하세요 456")).toBe("123-안녕하세요-456");
  });

  it("replaces non-unicode-letter/number characters with dashes", () => {
    expect(fileSlug("hello_world")).toBe("hello-world");
    expect(fileSlug("hello!@#$%^&*()world")).toBe("hello-world");
  });

  it("removes leading and trailing dashes", () => {
    expect(fileSlug("-hello-world-")).toBe("hello-world");
    expect(fileSlug("!hello-world!")).toBe("hello-world");
  });

  it("truncates to 60 characters", () => {
    const longString = "a".repeat(100);
    expect(fileSlug(longString).length).toBe(60);
    expect(fileSlug(longString)).toBe("a".repeat(60));
  });

  it("truncates to 60 characters and ensures it does not end with a dash", () => {
    const str = "a".repeat(59) + "-" + "b".repeat(10);
    const slug = fileSlug(str);
    expect(slug.length).toBe(59);
    expect(slug).toBe("a".repeat(59));
  });

  it("normalizes to NFC", () => {
    const nfd = "\u0065\u0301"; // "e" + acute accent
    const nfc = "\u00E9"; // "é"
    expect(fileSlug(nfd)).toBe(nfc);
  });
});
