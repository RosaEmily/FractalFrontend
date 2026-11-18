import { describe, expect, it } from "vitest";
import { safeHref, safeWebUrl } from "../src/shared/utils/safe-url";
import { renderMarkdown } from "../src/shared/utils/markdown";
import { GeneralAdapter } from "../src/modules/landing/adapters/general.adapter";
import { TeacherAdapter } from "../src/modules/landing/adapters/teacher.adapter";
import type { GeneralDTO } from "../src/modules/landing/dto/general.dto";
import type { TeacherDTO } from "../src/modules/landing/dto/teacher.dto";

describe("untrusted public links", () => {
  it.each([
    "javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)",
    "//evil.example", "/\\evil.example", "https://user:pass@evil.example",
    "file:///etc/passwd", "https://site.example\n.evil.example", "https://", "",
  ])("rejects executable or ambiguous URLs: %s", (value) => {
    expect(safeHref(value)).toBeNull();
    expect(safeWebUrl(value)).toBeNull();
  });

  it("keeps valid web, contact and internal links", () => {
    expect(safeWebUrl("https://example.test/cv.pdf?a=1&b=2")).toBe("https://example.test/cv.pdf?a=1&b=2");
    expect(safeHref("/contact#faqs")).toBe("/contact#faqs");
    expect(safeHref("mailto:test@example.test")).toBe("mailto:test@example.test");
    expect(safeHref("tel:+51987654321")).toBe("tel:+51987654321");
  });

  it("does not create script elements, event handlers or unsafe anchors from Markdown", () => {
    const target = document.createElement("div");
    target.innerHTML = renderMarkdown('<img src=x onerror=alert(1)>\n\n[x](javascript:alert(1))\n\n[x](//evil.example)\n\n[x](https://example.test/?x="onmouseover="alert)');
    expect(target.querySelector("img,script,iframe")).toBeNull();
    for (const anchor of target.querySelectorAll("a")) {
      expect(anchor.protocol).toMatch(/^https?:$/);
      expect(anchor.hasAttribute("onmouseover")).toBe(false);
      expect(anchor.hasAttribute("onerror")).toBe(false);
    }
  });

  it("removes unsafe social networks and footer links from legacy editorial data", () => {
    const dto = {
      banner: [], kpis: [], partners: [], pages: [],
      social_networks: [{ name: "bad", url: "javascript:alert(1)" }, { name: "good", url: "https://example.test" }],
      footer: { columns: [{ title: "Links", links: [{ type: "url", label: "Bad", url: "javascript:alert(1)" }] }] },
    } as unknown as GeneralDTO;
    const result = GeneralAdapter.one(dto);
    expect(result.social_networks).toEqual([{ name: "good", url: "https://example.test/" }]);
    expect(result.footer.columns).toEqual([]);
  });

  it("sanitizes teacher links even when the source bypassed admin validation", () => {
    const result = TeacherAdapter.one({ cv: "javascript:alert(1)", social_networks: { linkedin: "javascript:alert(1)", other: "https://example.test" } } as TeacherDTO);
    expect(result.cv).toBe("");
    expect(result.social_networks.linkedin).toBeNull();
    expect(result.social_networks.other).toBe("https://example.test/");
  });
});
